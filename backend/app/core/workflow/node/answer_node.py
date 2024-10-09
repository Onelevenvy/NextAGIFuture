from collections.abc import Sequence
from typing import Any

from app.core.workflow.node.state import (
    ReturnTeamState,
    TeamState,
    format_messages,
    parse_variables,
    update_node_outputs,
)
from langchain.chat_models import init_chat_model
from langchain_core.messages import AIMessage, AnyMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import (
    RunnableConfig,
    RunnableSerializable,
)
from langchain_core.tools import BaseTool
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI


class AnswerNode:
    def __init__(self, node_id: str, input_schema: str):
        self.node_id = node_id
        self.input_schema = input_schema

    async def work(self, state: TeamState, config: RunnableConfig) -> ReturnTeamState:
        if "node_outputs" not in state:
            state["node_outputs"] = {}

        if self.input_schema:
            parsed_input_schema = parse_variables(
                self.input_schema, state["node_outputs"]
            )
            result = AIMessage(content=parsed_input_schema)
        else:
            messages = state.get("all_messages", [])
            result = AIMessage(
                content=messages[-1].content if messages else "No answer available."
            )

        # 更新 node_outputs
        new_output = {self.node_id: {"response": result.content}}
        state["node_outputs"] = update_node_outputs(state["node_outputs"], new_output)

        # 确保返回一个有效的 ReturnTeamState，并标记这是一个 AnswerNode 的响应
        return_state: ReturnTeamState = {
            "history": state.get("history", []) + [result],
            "messages": [result],
            "all_messages": state.get("all_messages", []) + [result],
            "node_outputs": state["node_outputs"],
        }
        return return_state
