from langchain.pydantic_v1 import BaseModel
from langchain.tools import BaseTool
from typing import Dict, Any, List
from functools import lru_cache
from langgraph.graph.graph import CompiledGraph
from langgraph.prebuilt import ToolNode
from langchain_core.messages import AnyMessage, AIMessage
from app.core.graph.skills import managed_skills
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, StateGraph
from langchain_core.runnables import RunnableLambda
from .node import (
    WorkerNode,
    SequentialWorkerNode,
    LeaderNode,
    SummariserNode,
    LLMNode,
    TeamState,
)


def validate_config(config: Dict[str, Any]) -> bool:
    required_keys = ["id", "name", "nodes", "edges", "metadata"]
    return all(key in config for key in required_keys)


class ToolsInfo(BaseModel):
    description: str
    tool: BaseTool


tool_registry: dict[str, ToolsInfo] = managed_skills


@lru_cache(maxsize=None)
def get_tool(tool_name: str) -> BaseTool:
    if tool_name in tool_registry:
        return tool_registry[tool_name].tool
    raise ValueError(f"Unknown tool: {tool_name}")


def should_continue(state: TeamState) -> str:
    messages: list[AnyMessage] = state["messages"]
    if messages and isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:
        for tool_call in messages[-1].tool_calls:
            if tool_call["name"] == "AskHuman":
                return "call_human"
        return "call_tools"
    return "default"  # 将 "continue" 改为 "default"


def create_tools_condition(
    current_node: str, next_node: str, tools: List[str]
) -> Dict[str, str]:
    mapping = {"continue": next_node}
    if "ask-human" in tools:
        mapping["call_human"] = f"{current_node}_askHuman_tool"
    if any(tool != "ask-human" for tool in tools):
        mapping["call_tools"] = f"{current_node}_tools"
    return mapping


def ask_human(state: TeamState) -> None:
    pass


def initialize_graph(
    build_config: Dict[str, Any], checkpointer: BaseCheckpointSaver
) -> CompiledGraph:
    if not validate_config(build_config):
        raise ValueError("Invalid configuration structure")

    try:
        graph_builder = StateGraph(TeamState)

        nodes = build_config["nodes"]
        edges = build_config["edges"]
        metadata = build_config["metadata"]

        # Determine graph type based on configuration structure
        llm_nodes = [node for node in nodes if node["type"] == "llm"]
        is_sequential = len(llm_nodes) > 1 and all(
            any(
                edge["source"] == node["id"] and edge["target"] == next_node["id"]
                for edge in edges
            )
            for node, next_node in zip(llm_nodes[:-1], llm_nodes[1:])
        )
        is_hierarchical = len(llm_nodes) > 1 and not is_sequential

        # Add nodes
        for node in nodes:
            node_id = node["id"]
            node_type = node["type"]
            node_data = node["data"]

            if node_type == "llm":
                if is_sequential:
                    node_class = SequentialWorkerNode
                elif is_hierarchical:
                    if node_id == metadata["entry_point"]:
                        node_class = LeaderNode
                    else:
                        node_class = WorkerNode
                else:
                    node_class = LLMNode

                graph_builder.add_node(
                    node_id,
                    RunnableLambda(
                        node_class(
                            provider=node_data.get("provider", "openai"),
                            model=node_data["model"],
                            openai_api_key="",
                            openai_api_base="https://open.bigmodel.cn/api/paas/v4/",
                            temperature=node_data["temperature"],
                        ).work
                    ),
                )
            elif node_type == "tool":
                tools = [get_tool(tool_name) for tool_name in node_data["tools"]]
                graph_builder.add_node(node_id, ToolNode(tools))
            elif node_type == "summariser":
                graph_builder.add_node(
                    node_id,
                    RunnableLambda(
                        SummariserNode(
                            provider=node_data.get("provider", "openai"),
                            model=node_data["model"],
                            openai_api_key="",
                            openai_api_base="",
                            temperature=node_data["temperature"],
                        ).summarise
                    ),
                )

        # Add edges
        conditional_edges = {}
        for edge in edges:
            source_node = next(node for node in nodes if node["id"] == edge["source"])
            target_node = next(node for node in nodes if node["id"] == edge["target"])

            if source_node["type"] == "llm":
                if source_node["id"] not in conditional_edges:
                    conditional_edges[source_node["id"]] = {
                        "continue": {},
                        "call_tools": {},
                    }

                if target_node["type"] == "tool":
                    conditional_edges[source_node["id"]]["call_tools"][
                        target_node["id"]
                    ] = target_node["id"]
                elif target_node["type"] == "end":
                    # Handle end nodes
                    if edge["type"] == "default":
                        graph_builder.add_edge(edge["source"], END)
                    else:
                        conditional_edges[source_node["id"]]["continue"][END] = END
                elif edge["type"] == "default":
                    graph_builder.add_edge(edge["source"], edge["target"])
                else:
                    conditional_edges[source_node["id"]]["continue"][
                        target_node["id"]
                    ] = target_node["id"]

            elif source_node["type"] == "tool" and target_node["type"] == "llm":
                # Tool to LLM edge
                graph_builder.add_edge(edge["source"], edge["target"])

        # Add conditional edges for LLM nodes
        for llm_id, conditions in conditional_edges.items():
            if conditions["continue"] or conditions["call_tools"]:
                edges_dict = {
                    "default": next(iter(conditions["continue"].values()), END),
                    **conditions["call_tools"]
                }
                if "call_human" in conditions:
                    edges_dict["call_human"] = conditions["call_human"]
                graph_builder.add_conditional_edges(
                    llm_id,
                    should_continue,
                    edges_dict
                )

        # Set entry point
        graph_builder.set_entry_point(metadata["entry_point"])

        # Compile graph
        interrupt_before = []
        hitl_config = build_config.get("metadata", {}).get("human_in_the_loop", {})
        interrupt_before = hitl_config.get("interrupt_before", [])
        interrupt_after = hitl_config.get("interrupt_after", [])

        graph = graph_builder.compile(
            checkpointer=checkpointer,
            interrupt_before=interrupt_before,
            interrupt_after=interrupt_after,
        )

        # try:
        #     # 获取图像数据
        #     img_data = graph.get_graph().draw_mermaid_png()

        #     # 保存图像到文件
        #     with open("aaaab-_graph_image.png", "wb") as f:
        #         f.write(img_data)
        # except Exception:
        #     # 处理可能的异常
        #     pass

        return graph

    except KeyError as e:
        raise ValueError(f"Invalid configuration: missing key {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to initialize graph: {e}")
