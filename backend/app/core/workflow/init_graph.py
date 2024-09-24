from langchain.pydantic_v1 import BaseModel
from langchain.tools import BaseTool
from typing import Dict, Any, Set
from functools import lru_cache
import time
from langgraph.graph.graph import CompiledGraph
from langgraph.prebuilt import ToolNode
from langchain_core.messages import AnyMessage, AIMessage
from app.core.graph.skills import managed_skills
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, StateGraph
from langchain_core.runnables import RunnableLambda

from app.curd.models import get_all_models
from app.api.deps import SessionDep
from app.core.workflow.db_utils import get_all_models_helper
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


# 添加一个全局变量来存储工具名称到节点ID的映射
tool_name_to_node_id: Dict[str, str] = {}


def should_continue(state: TeamState) -> str:
    messages: list[AnyMessage] = state["messages"]
    if messages and isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:
        for tool_call in messages[-1].tool_calls:
            if tool_call["name"] == "AskHuman":
                return "call_human"
            # 使用工具名称到节点ID的映射
            tool_name = tool_call["name"].lower()
            for node_id, tools in tool_name_to_node_id.items():
                if tool_name in tools:
                    return node_id
    return "default"


def initialize_graph(
    build_config: Dict[str, Any],
    checkpointer: BaseCheckpointSaver,
    save_graph_img=False,
) -> CompiledGraph:
    global tool_name_to_node_id

    if not validate_config(build_config):
        raise ValueError("Invalid configuration structure")

    try:
        graph_builder = StateGraph(TeamState)

        nodes = build_config["nodes"]
        edges = build_config["edges"]
        metadata = build_config["metadata"]

        # 创建工具名称到节点ID的映射
        tool_name_to_node_id = {}
        for node in nodes:
            if node["type"] == "tool":
                tool_name_to_node_id[node["id"]] = [
                    tool.lower() for tool in node["data"]["tools"]
                ]

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

        # Create a dictionary to store child LLM nodes for each LLM node
        llm_children: Dict[str, Set[str]] = {node["id"]: set() for node in llm_nodes}

        # Populate llm_children
        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            if source in llm_children:
                target_node = next(
                    (node for node in nodes if node["id"] == target), None
                )
                if target_node and target_node["type"] == "llm":
                    llm_children[source].add(target)

        # Create a dictionary to store conditional edges
        conditional_edges = {
            node["id"]: {"default": {}, "call_tools": {}, "call_human": {}}
            for node in nodes
            if node["type"] == "llm"
        }

        # Add nodes
        for node in nodes:
            node_id = node["id"]
            node_type = node["type"]
            node_data = node["data"]

            if node_type == "llm":
                model_name = node_data["model"]
                all_models = get_all_models_helper()
                model_info = None
                for model in all_models.data:
                    if model.ai_model_name == model_name:
                        model_info = {
                            "ai_model_name": model.ai_model_name,
                            "provider_name": model.provider.provider_name,
                            "base_url": model.provider.base_url,
                            "api_key": model.provider.api_key,
                        }
                        break
                if model_info is None:
                    raise ValueError(f"Model {model_name} not supported now.")

                # in the future wo can use more langchain templates here apply to different node type TODO
                if is_sequential:
                    # node_class = SequentialWorkerNode
                    node_class = LLMNode
                elif is_hierarchical:
                    if llm_children[node_id]:
                        # node_class = LeaderNode
                        node_class = LLMNode
                    else:
                        # node_class = WorkerNode
                        node_class = LLMNode
                else:
                    node_class = LLMNode

                # Find tools to bind
                tools_to_bind = []
                for edge in edges:
                    if edge["source"] == node_id:
                        target_node = next(
                            (n for n in nodes if n["id"] == edge["target"]), None
                        )
                        if target_node and target_node["type"] == "tool":
                            tools_to_bind.extend(
                                [
                                    get_tool(tool_name)
                                    for tool_name in target_node["data"]["tools"]
                                ]
                            )

                graph_builder.add_node(
                    node_id,
                    RunnableLambda(
                        node_class(
                            provider=model_info["provider_name"],
                            model=model_info["ai_model_name"],
                            tools=tools_to_bind,
                            openai_api_key=model_info["api_key"],
                            openai_api_base=model_info["base_url"],
                            temperature=node_data["temperature"],
                            system_prompt=node_data.get("systemMessage", None),
                            agent_name=node_data.get("label", node_id),
                        ).work
                    ),
                )
                # Prepare conditional edges for tool calling
                if tools_to_bind:
                    conditional_edges[node_id] = {
                        "default": {},
                        "call_tools": {},
                        "call_human": {},
                    }
            elif node_type == "tool":
                tools = [get_tool(tool_name) for tool_name in node_data["tools"]]
                graph_builder.add_node(node_id, ToolNode(tools))
            elif node_type == "summariser":
                graph_builder.add_node(
                    node_id,
                    RunnableLambda(
                        SummariserNode(
                            provider=node_data.get("provider", "zhipuai"),
                            model=node_data["model"],
                            openai_api_key="",
                            openai_api_base="",
                            temperature=node_data["temperature"],
                        ).summarise
                    ),
                )

        # Add edges
        for edge in edges:
            source_node = next(node for node in nodes if node["id"] == edge["source"])
            target_node = next(node for node in nodes if node["id"] == edge["target"])

            if source_node["type"] == "llm":
                if target_node["type"] == "tool":
                    conditional_edges[source_node["id"]]["call_tools"][
                        target_node["id"]
                    ] = target_node["id"]
                elif target_node["type"] == "end":
                    conditional_edges[source_node["id"]]["default"][END] = END
                else:
                    conditional_edges[source_node["id"]]["default"][
                        target_node["id"]
                    ] = target_node["id"]

            elif source_node["type"] == "tool" and target_node["type"] == "llm":
                # Tool to LLM edge
                graph_builder.add_edge(edge["source"], edge["target"])

        # Add conditional edges
        for llm_id, conditions in conditional_edges.items():
            edges_dict = {
                "default": next(iter(conditions["default"].values()), END),
                **conditions["call_tools"],
            }
            if conditions["call_human"]:
                edges_dict["call_human"] = next(iter(conditions["call_human"].values()))
            graph_builder.add_conditional_edges(llm_id, should_continue, edges_dict)

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
        if save_graph_img:
            try:
                # 获取图像数据
                img_data = graph.get_graph().draw_mermaid_png()

                # 保存图像到文件
                with open(f"save_graph_{time.time()}.png", "wb") as f:
                    f.write(img_data)
            except Exception:
                # 处理可能的异常
                pass

        return graph

    except KeyError as e:
        raise ValueError(f"Invalid configuration: missing key {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to initialize graph: {e}")
