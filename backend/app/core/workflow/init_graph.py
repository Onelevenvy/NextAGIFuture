from langchain.pydantic_v1 import BaseModel
from langchain.tools import BaseTool
from typing import Dict, Any, List, Dict, Any
from functools import lru_cache
from langgraph.graph.graph import CompiledGraph
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.messages import HumanMessage, AIMessage, AnyMessage
from app.core.graph.skills import managed_skills
from langgraph.checkpoint.base import BaseCheckpointSaver
from langchain_core.tools import BaseTool
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, StateGraph
from langgraph.graph.graph import CompiledGraph
from langgraph.prebuilt import ToolNode
from app.core.graph.members import LLMNode, SequentialWorkerNode, TeamState
from langchain_core.runnables.config import RunnableConfig
from langchain_core.runnables import RunnableLambda


def validate_config(config: Dict[str, Any]) -> bool:
    required_keys = ["id", "name", "nodes", "edges", "metadata"]
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
    tool_to_node = {
        tool.name: node_id for node_id, tools in tool_nodes.items() for tool in tools
    }

    def tools_router(state: Dict) -> str:
        messages = state.get("messages", [])
        if messages:
            last_message = messages[-1]
            # 检查是否有工具调用
            if (
                not hasattr(last_message, "additional_kwargs")
                or "tool_calls" not in last_message.additional_kwargs
            ):
                return END
            tool_calls = last_message.additional_kwargs["tool_calls"]
            if not tool_calls:
                return END

            # 获取第一个工具调用（如果需要处理多个工具调用，这里需要修改）
            first_tool_call = tool_calls[0]
            tool_name = first_tool_call.get("function", {}).get("name")

            # 根据工具名称路由到相应的节点
            if tool_name in tool_to_node:
                return tool_to_node[tool_name]
        else:
            return END

    return tools_router


# 工具注册表
class ToolsInfo(BaseModel):
    description: str
    tool: BaseTool


tool_registry: dict[str, ToolsInfo] = managed_skills


@lru_cache(maxsize=None)
def get_tool(tool_name: str) -> BaseTool:
    if tool_name in tool_registry:
        return tool_registry[tool_name].tool
    raise ValueError(f"Unknown tool: {tool_name}")


def initialize_fake_node(node_data: Dict[str, Any]):
    def chatbot(state):
        return {"messages": [HumanMessage(content="this is a fake msg,请忽略他")]}

    return chatbot


def initialize_graph(
    build_config: Dict[str, Any], checkpointer: BaseCheckpointSaver
) -> CompiledGraph:
    if not validate_config(build_config):
        raise ValueError("Invalid configuration structure")
    try:
        nodes_to_keep = [
            node
            for node in build_config["nodes"]
            if node["type"] not in ["start", "end"]
        ]
        nodes_to_keep_ids = {node["id"] for node in nodes_to_keep}

        # Filter edges
        edges_to_keep = [
            edge
            for edge in build_config["edges"]
            if edge["source"] in nodes_to_keep_ids
            and edge["target"] in nodes_to_keep_ids
        ]

        new_configs = {
            "id": build_config["id"],
            "name": build_config["name"],
            "nodes": nodes_to_keep,
            "edges": edges_to_keep,
            "metadata": build_config["metadata"],
        }

        graph_builder = StateGraph(TeamState)
        llm_node = next(node for node in new_configs["nodes"] if node["type"] == "llm")
        llm_node_id = llm_node["id"]
        # 初始化 LLM 和工具
        for node in new_configs["nodes"]:
            if node["type"] == "llm":
                llm = ChatOpenAI(
                    model=node["data"]["model"],
                    openai_api_key="1a65e1fed7ab7a788ee94d73570e9fcf.5FVs3ceE6POvEnSN",
                    openai_api_base="https://open.bigmodel.cn/api/paas/v4/",
                )

        # 收集所有工具
        all_tools = []
        tool_nodes = {}
        for node in new_configs["nodes"]:
            if node["type"] == "tool":
                node_tools = [
                    get_tool(tool_name) for tool_name in node["data"]["tools"]
                ]
                all_tools.extend(node_tools)
                tool_nodes[node["id"]] = node_tools
                graph_builder.add_node(node["id"], ToolNode(tools=node_tools))

        llm_with_tools = llm.bind_tools(all_tools)

        # 添加节点
        for node in new_configs["nodes"]:
            if node["type"] == "llm":
                graph_builder.add_node(
                    node["id"],
                    RunnableLambda(
                        LLMNode(
                            llm=llm_with_tools, tools=True
                        ).work  # type: ignore[arg-type]
                    ),
                )
            elif node["type"] == "fake_node":
                graph_builder.add_node(node["id"], initialize_fake_node(node["data"]))
            else:
                continue

        dynamic_router = create_tools_router(tool_nodes)

        graph_builder.add_conditional_edges(
            llm_node_id,
            dynamic_router,
        )

        for edge in new_configs["edges"]:
            if edge["type"] == "default":
                graph_builder.add_edge(edge["source"], edge["target"])

        # 设置入口点
        graph_builder.set_entry_point(new_configs["metadata"]["entry_point"])

        # # 从配置中获取 human-in-the-loop 设置
        hitl_config = new_configs.get("metadata", {}).get("human_in_the_loop", {})
        interrupt_before = hitl_config.get("interrupt_before", [])
        interrupt_after = hitl_config.get("interrupt_after", [])

        # # 编译图，包含 human-in-the-loop 设置
        return graph_builder.compile(
            checkpointer=checkpointer,
            interrupt_before=interrupt_before,
            interrupt_after=interrupt_after,
        )
    except KeyError as e:
        raise ValueError(f"Invalid configuration: missing key {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to initialize graph: {e}")


if __name__ == "main":
    config4 = {
        "id": "b136b7fe-3ddb-4ced-8b64-cc8065c566a2",
        "name": "Flow Visualization",
        "nodes": [
            {
                "id": "llm-1",
                "type": "llm",
                "position": {"x": 361, "y": 178},
                "data": {"label": "LLM", "model": "glm-4", "temperature": 0.7},
            },
            {
                "id": "tool-2",
                "type": "tool",
                "position": {"x": 558, "y": 368},
                "data": {"label": "Tool", "tools": ["calculator"]},
            },
            {
                "id": "start-3",
                "type": "start",
                "position": {"x": 117, "y": 233},
                "data": {"label": "Start"},
            },
            {
                "id": "end-4",
                "type": "end",
                "position": {"x": 775, "y": 133},
                "data": {"label": "End"},
            },
        ],
        "edges": [
            {
                "id": "reactflow__edge-start-3right-llm-1left",
                "source": "start-3",
                "target": "llm-1",
                "sourceHandle": "right",
                "targetHandle": "left",
                "type": "default",
            },
            {
                "id": "reactflow__edge-llm-1right-tool-2left",
                "source": "llm-1",
                "target": "tool-2",
                "sourceHandle": "right",
                "targetHandle": "left",
                "type": "smoothstep",
            },
            {
                "id": "reactflow__edge-llm-1right-end-4left",
                "source": "llm-1",
                "target": "end-4",
                "sourceHandle": "right",
                "targetHandle": "left",
                "type": "smoothstep",
            },
            {
                "id": "reactflow__edge-tool-2right-llm-1right",
                "source": "tool-2",
                "target": "llm-1",
                "sourceHandle": "right",
                "targetHandle": "right",
                "type": "default",
            },
        ],
        "metadata": {
            "entry_point": "llm-1",
            "start_connections": [{"target": "llm-1", "type": "default"}],
            "end_connections": [{"source": "llm-1", "type": "smoothstep"}],
        },
    }
    graph4 = initialize_graph(config4)
