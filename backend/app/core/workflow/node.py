from collections.abc import Mapping, Sequence
from typing import Annotated, Any, Dict

from langchain.chat_models import init_chat_model
from langchain.tools.retriever import create_retriever_tool
from langchain_core.messages import AIMessage, AnyMessage
from langchain_core.output_parsers.openai_tools import JsonOutputKeyToolsParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import (
    RunnableConfig,
    RunnableLambda,
    RunnableSerializable,
)
from langchain_core.tools import BaseTool
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from langgraph.graph import add_messages
from pydantic import BaseModel, Field
from typing_extensions import NotRequired, TypedDict
import re
from app.core.rag.qdrant import QdrantStore
from app.core.tools import managed_tools
from app.core.tools.api_tool import dynamic_api_tool
from app.core.tools.retriever_tool import create_retriever_tool


class GraphSkill(BaseModel):
    name: str = Field(description="The name of the skill")
    definition: dict[str, Any] | None = Field(
        description="The skill definition. For api tool calling. Optional."
    )
    managed: bool = Field("Whether the skill is managed or user created.")

    @property
    def tool(self) -> BaseTool:
        if self.managed:
            return managed_tools[self.name].tool
        elif self.definition:
            return dynamic_api_tool(self.definition)
        else:
            raise ValueError("Skill is not managed and no definition provided.")


class GraphUpload(BaseModel):
    name: str = Field(description="Name of the upload")
    description: str = Field(description="Description of the upload")
    owner_id: int = Field(description="Id of the user that owns this upload")
    upload_id: int = Field(description="Id of the upload")

    @property
    def tool(self) -> BaseTool:
        retriever = QdrantStore().retriever(self.owner_id, self.upload_id)
        return create_retriever_tool(retriever)


class GraphPerson(BaseModel):
    name: str = Field(description="The name of the person")
    role: str = Field(description="Role of the person")
    provider: str = Field(description="The provider for the llm model")
    model: str = Field(description="The llm model to use for this person")

    openai_api_key: str = Field(description="The openai_api_key")

    openai_api_base: str = Field(description="The openai_api_base")

    temperature: float = Field(description="The temperature of the llm model")
    backstory: str = Field(
        description="Description of the person's experience, motives and concerns."
    )

    @property
    def persona(self) -> str:
        return f"<persona>\nName: {self.name}\nRole: {self.role}\nBackstory: {self.backstory}\n</persona>"


class GraphMember(GraphPerson):
    tools: list[GraphSkill | GraphUpload] = Field(
        description="The list of tools that the person can use."
    )
    interrupt: bool = Field(
        default=False,
        description="Whether to interrupt the person or not before skill use",
    )


# Create a Leader class so we can pass leader as a team member for team within team
class GraphLeader(GraphPerson):
    pass


class GraphTeam(BaseModel):
    name: str = Field(description="The name of the team")
    role: str = Field(description="Role of the team leader")
    backstory: str = Field(
        description="Description of the team leader's experience, motives and concerns."
    )
    members: dict[str, GraphMember | GraphLeader] = Field(
        description="The members of the team"
    )
    provider: str = Field(description="The provider of the team leader's llm model")
    model: str = Field(description="The llm model to use for this team leader")

    openai_api_key: str = Field(description="The openai_api_key")

    openai_api_base: str = Field(description="The openai_api_base")
    temperature: float = Field(
        description="The temperature of the team leader's llm model"
    )

    @property
    def persona(self) -> str:
        return f"Name: {self.name}\nRole: {self.role}\nBackstory: {self.backstory}\n"


def add_or_replace_messages(
    messages: list[AnyMessage], new_messages: list[AnyMessage]
) -> list[AnyMessage]:
    """Add new messages to the state. If new_messages list is empty, clear messages instead."""
    if not new_messages:
        return []
    else:
        return add_messages(messages, new_messages)  # type: ignore[return-value, arg-type]


def format_messages(messages: list[AnyMessage]) -> str:
    """Format list of messages to string"""
    message_str: str = ""
    for message in messages:
        message_str += f"{message.name}: {message.content}\n\n"
    return message_str


class TeamState(TypedDict):
    all_messages: Annotated[
        list[AnyMessage], add_messages
    ]  # Stores all messages in this thread
    messages: Annotated[list[AnyMessage], add_or_replace_messages]
    history: Annotated[list[AnyMessage], add_messages]
    team: GraphTeam
    next: str
    main_task: list[AnyMessage]
    task: list[
        AnyMessage
    ]  # This is the current task to be perform by a team member. Its a list because Worker's MessagesPlaceholder only accepts list of messages.
    node_outputs: Dict[str, Any]


# When returning teamstate, is it possible to exclude fields that you dont want to update
class ReturnTeamState(TypedDict):
    all_messages: NotRequired[list[AnyMessage]]
    messages: NotRequired[list[AnyMessage]]
    history: NotRequired[list[AnyMessage]]
    team: NotRequired[GraphTeam]
    next: NotRequired[str | None]  # Returning None is valid for sequential graphs only
    task: NotRequired[list[AnyMessage]]


def parse_variables(text: str, state: TeamState) -> str:
    def replace_variable(match):
        var_path = match.group(1).split(".")
        value = state["node_outputs"]
        for key in var_path:
            if key in value:
                value = value[key]
            else:
                return match.group(0)  # 如果找不到变量，保持原样
        return str(value)

    return re.sub(r"\{([^}]+)\}", replace_variable, text)


class BaseNode:
    def __init__(
        self,
        node_id: str,
        provider: str,
        model: str,
        tools: Sequence[BaseTool],
        openai_api_key: str,
        openai_api_base: str,
        temperature: float,
        system_prompt: str,
        agent_name: str,
    ):
        self.node_id = node_id
        self.system_prompt = system_prompt
        self.agent_name = agent_name
        if provider in ["zhipuai", "Siliconflow"]:
            self.model = ChatOpenAI(
                model=model,
                temperature=temperature,
                openai_api_key=openai_api_key,
                openai_api_base=openai_api_base,
            )
            if len(tools) >= 1:
                self.model = self.model.bind_tools(tools)
            self.final_answer_model = self.model

        elif provider in ["openai"]:
            self.model = init_chat_model(
                model,
                model_provider=provider,
                base_url=openai_api_base,
                temperature=temperature,
            )
            self.final_answer_model = ChatOpenAI(
                model=model,
                temperature=0,
                streaming=True,
                openai_api_key=openai_api_key,
                openai_api_base=openai_api_base,
            )
        elif provider == "ollama":
            self.model = ChatOllama(
                model=model,
                temperature=temperature,
                base_url=(
                    openai_api_base
                    if openai_api_base
                    else "http://host.docker.internal:11434"
                ),
            )
            self.final_answer_model = ChatOllama(
                model=model,
                temperature=0,
                streaming=True,
                openai_api_key=openai_api_key,
                openai_api_base=openai_api_base,
            )
        else:
            self.model = init_chat_model(
                model,
                model_provider=provider,
                temperature=temperature,
                streaming=True,
                openai_api_key=openai_api_key,
                openai_api_base=openai_api_base,
            )
            self.final_answer_model = init_chat_model(
                model,
                model_provider=provider,
                temperature=temperature,
                streaming=True,
                openai_api_key=openai_api_key,
                openai_api_base=openai_api_base,
            )

    def update_node_output(self, state: TeamState, node_id: str, output: Any):
        state["node_outputs"][node_id] = output


class LLMNode(BaseNode):
    """Perform LLM Node actions"""

    async def work(self, state: TeamState, config: RunnableConfig) -> ReturnTeamState:
        state["node_outputs"] = {
            "start": {"query": "我是tqx"},
            "llm": {"response": "我是大模型EE"},
        }
        if self.system_prompt:
            parsed_system_prompt = parse_variables(self.system_prompt, state)
            llm_node_prompts = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "Perform the task given to you.\n"
                        "If you are unable to perform the task, that's OK, you can ask human for help, or just say that you are unable to perform the task."
                        "Execute what you can to make progress. "
                        "And your role is:" + parsed_system_prompt + "\n"
                        "And your name is:"
                        + self.agent_name
                        + "\n"
                        + "please remember your name\n"
                        "Stay true to your role and use your tools if necessary.\n\n",
                    ),
                    (
                        "human",
                        "Here is the previous conversation: \n\n {history_string} \n\n Provide your response.",
                    ),
                    MessagesPlaceholder(variable_name="messages"),
                ]
            )

        else:
            llm_node_prompts = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        (
                            "Perform the task given to you.\n"
                            "If you are unable to perform the task, that's OK, you can ask human for help, or just say that you are unable to perform the task."
                            "Execute what you can to make progress. "
                            "Stay true to your role and use your tools if necessary.\n\n"
                        ),
                    ),
                    (
                        "human",
                        "Here is the previous conversation: \n\n {history_string} \n\n Provide your response.",
                    ),
                    MessagesPlaceholder(variable_name="messages"),
                ]
            )
        history = state.get("history", [])
        messages = state.get("messages", [])
        prompt = llm_node_prompts.partial(history_string=format_messages(history))
        chain: RunnableSerializable[dict[str, Any], AnyMessage] = prompt | self.model
        result: AIMessage = await chain.ainvoke(state, config)

        # self.update_node_output(state, self.node_id, result.content)
        return_state: ReturnTeamState = {
            "history": history + [result],
            "messages": [result] if result.tool_calls else [],
            "all_messages": messages + [result],
        }
        return return_state
