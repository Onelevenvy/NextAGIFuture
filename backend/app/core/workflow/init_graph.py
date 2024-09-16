from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool, BaseTool
from typing import Dict, Any, List

from langgraph.graph.graph import CompiledGraph
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langchain_core.tools import tool
from typing import Annotated


class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(
    func=multiply,
    name="Calculator",
    description="Useful for when you need to multiply two numbers.",
    args_schema=CalculatorInput,
    return_direct=True,
)
import os

os.environ["TAVILY_API_KEY"] = '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'


@tool
def AskHuman(query: Annotated[str, "query to ask the human"]) -> None:
    """Ask the human a question to gather additional inputs"""
    pass


def validate_config(config: Dict[str, Any]) -> bool:
    required_keys = ['id', 'name', 'nodes', 'edges', 'metadata']
    return all(key in config for key in required_keys)


from langgraph.graph import StateGraph, START, END


def create_tools_router(tool_nodes: Dict[str, List[BaseTool]]):
    """
    创建一个动态的工具路由器。

    :param tool_nodes: 一个字典，键是工具节点的ID，值是该节点包含的工具列表。
    :param default_node: 默认返回的节点ID（通常是LLM节点）。
    :return: 一个路由函数。
    """
    # 创建一个反向映射，从工具名称到节点ID
    tool_to_node = {tool.name: node_id for node_id, tools in tool_nodes.items() for tool in tools}

    def tools_router(state: Dict) -> str:
        next_node = tools_condition(state)
        # If no tools are invoked, return to the user
        if next_node == END:
            return END
        messages = state.get("messages", [])
        last_message = messages[-1]
        # 检查是否有工具调用
        if not hasattr(last_message, 'additional_kwargs') or 'tool_calls' not in last_message.additional_kwargs:
            return END
        tool_calls = last_message.additional_kwargs['tool_calls']
        if not tool_calls:
            return END

        # 获取第一个工具调用（如果需要处理多个工具调用，这里需要修改）
        first_tool_call = tool_calls[0]
        tool_name = first_tool_call.get("function", {}).get("name")

        # 根据工具名称路由到相应的节点
        if tool_name in tool_to_node:
            return tool_to_node[tool_name]

    return tools_router


from typing import Annotated, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.tools import Tool
from langchain_core.messages import HumanMessage, ToolMessage, AIMessage


class State(TypedDict):
    messages: Annotated[list, add_messages]


# 工具注册表
class ToolsInfo(BaseModel):
    description: str
    tool: BaseTool


tool_registry: dict[str, ToolsInfo] = {

    "tavilysearch": ToolsInfo(
        description="tavily search useful when searching for information on the internet",
        tool=TavilySearchResults(max_results=1),  # type: ignore[call-arg]

    ),
    "calculator": ToolsInfo(
        description=calculator.description,
        tool=calculator,
    ),
    "ask-human": ToolsInfo(description=AskHuman.description, tool=AskHuman),

}
from functools import lru_cache


@lru_cache(maxsize=None)
def get_tool(tool_name: str) -> BaseTool:
    if tool_name in tool_registry:
        return tool_registry[tool_name].tool
    raise ValueError(f"Unknown tool: {tool_name}")


# 节点初始化函数
def initialize_llm_node(node_data: Dict[str, Any], llm_with_tools):
    def chatbot(state):
        return {"messages": [llm_with_tools.invoke(state["messages"])]}

    return chatbot


def initialize_fake_node(node_data: Dict[str, Any]):
    def chatbot(state):
        return {"messages": [HumanMessage(content="this is a fake msg,请忽略他")]}

    return chatbot


def initialize_graph(config: Dict[str, Any]) -> CompiledGraph:
    if not validate_config(config):
        raise ValueError("Invalid configuration structure")
    try:
        nodes_to_keep = [node for node in config["nodes"] if node["type"] not in ["start", "end"]]
        nodes_to_keep_ids = {node["id"] for node in nodes_to_keep}

        # Filter edges
        edges_to_keep = [edge for edge in config["edges"] if
                         edge["source"] in nodes_to_keep_ids and edge["target"] in nodes_to_keep_ids]

        new_configs = {
            "id": config["id"],
            "name": config["name"],
            "nodes": nodes_to_keep,
            "edges": edges_to_keep,
            "metadata": config["metadata"]
        }

        config = new_configs
        graph_builder = StateGraph(State)
        llm_node = next(node for node in config['nodes'] if node['type'] == 'llm')
        llm_node_id = llm_node['id']
        # 初始化 LLM 和工具
        for node in config['nodes']:
            if node['type'] == 'llm':
                llm = ChatOpenAI(
                    model=node['data']['model'],
                    openai_api_key='1a65e1fed7ab7a788ee94d73570e9fcf.5FVs3ceE6POvEnSN',
                    openai_api_base="https://open.bigmodel.cn/api/paas/v4/"
                )

        # 收集所有工具
        all_tools = []
        tool_nodes = {}
        for node in config['nodes']:
            if node['type'] == 'tool':
                node_tools = [get_tool(tool_name) for tool_name in node['data']['tools']]
                all_tools.extend(node_tools)
                tool_nodes[node['id']] = node_tools
                graph_builder.add_node(node['id'], ToolNode(tools=node_tools))

        llm_with_tools = llm.bind_tools(all_tools)

        # 添加节点
        for node in config['nodes']:
            if node['type'] == 'llm':
                graph_builder.add_node(node['id'], initialize_llm_node(node['data'], llm_with_tools))
            elif node['type'] == 'fake_node':
                graph_builder.add_node(node['id'], initialize_fake_node(node['data']))
            else:
                continue

        dynamic_router = create_tools_router(tool_nodes)

        graph_builder.add_conditional_edges(
            llm_node_id,
            dynamic_router, )

        for edge in config['edges']:
            if edge['type'] == "default":
                graph_builder.add_edge(edge['source'], edge['target'])

        # 设置入口点
        graph_builder.set_entry_point(config['metadata']['entry_point'])

        # # 从配置中获取 human-in-the-loop 设置
        hitl_config = config.get('metadata', {}).get('human_in_the_loop', {})
        interrupt_before = hitl_config.get('interrupt_before', [])
        interrupt_after = hitl_config.get('interrupt_after', [])

        # # 编译图，包含 human-in-the-loop 设置
        return graph_builder.compile(
            interrupt_before=interrupt_before,
            interrupt_after=interrupt_after
        )
    except KeyError as e:
        raise ValueError(f"Invalid configuration: missing key {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to initialize graph: {e}")