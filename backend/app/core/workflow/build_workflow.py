import time
from functools import lru_cache
from typing import Any, Dict, Set
from app.core.rag.qdrant import QdrantStore
from langchain.tools import BaseTool
from langchain_core.messages import AIMessage, AnyMessage
from langchain_core.runnables import RunnableLambda
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.graph import CompiledGraph
from langgraph.prebuilt import ToolNode
from app.core.tools import managed_tools
from app.core.workflow.utils.db_utils import get_all_models_helper
from .node.answer_node import AnswerNode
from .node.llm_node import LLMNode
from .node.retrieval_node import RetrievalNode
from .node.input_node import InputNode
from .node.state import TeamState
from .node.subgraph_node import SubgraphNode
from langchain.tools.retriever import create_retriever_tool



def create_subgraph(subgraph_config: Dict[str, Any]) -> CompiledGraph:
    subgraph_builder = StateGraph(TeamState)
    
    # 添加subgraph的节点
    for node in subgraph_config["nodes"]:
        node_id = node["id"]
        node_type = node["type"]
        node_data = node["data"]
        
        if node_type == "answer":
            _add_answer_node(subgraph_builder, node_id, node_data)
        elif node_type == "retrieval":
            _add_retrieval_node(subgraph_builder, node_id, node_data)
        elif node_type == "llm":
            _add_llm_node(subgraph_builder, node_id, node_data, subgraph_config["nodes"], subgraph_config["edges"], False, False, {})
        elif node_type in ["tool", "toolretrieval"]:
            _add_tool_node(subgraph_builder, node_id, node_type, node_data)
    
    # 添加subgraph的边
    for edge in subgraph_config["edges"]:
        _add_edge(subgraph_builder, edge, subgraph_config["nodes"], {})
    
    # 设置入口点并编译subgraph
    subgraph_builder.set_entry_point("InputNode")
    return subgraph_builder.compile()





def validate_config(config: Dict[str, Any]) -> bool:
    required_keys = ["id", "name", "nodes", "edges", "metadata"]
    return all(key in config for key in required_keys)


@lru_cache(maxsize=None)
def get_tool(tool_name: str) -> BaseTool:
    for _, tool in managed_tools.items():
        if tool.display_name == tool_name:
            return tool.tool
    raise ValueError(f"Unknown tool: {tool_name}")


@lru_cache(maxsize=None)
def get_retrieval_tool(tool_name: str, description: str, owner_id: int, kb_id: int):
    retriever = QdrantStore().retriever(owner_id, kb_id)
    return create_retriever_tool(retriever, name=tool_name, description=description)


# 添加一个全局变量来存储工具名称到节点ID的映射
tool_name_to_node_id: Dict[str, str] = {}


def should_continue(state: TeamState) -> str:
    messages: list[AnyMessage] = state["messages"]
    if messages and isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:
        for tool_call in messages[-1].tool_calls:
            if tool_call["name"] == "ask_human":
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

        graph_builder.add_node("InputNode", InputNode)

        # 创建工具名称到节点ID的映射
        tool_name_to_node_id = _create_tool_name_mapping(nodes)

        # Determine graph type
        is_sequential, is_hierarchical = _determine_graph_type(nodes, edges)

        # Create dictionaries for LLM children and conditional edges
        llm_children = _create_llm_children_dict(nodes, edges)
        conditional_edges = _create_conditional_edges_dict(nodes)

        # Add nodes
        for node in nodes:
            node_id = node["id"]
            node_type = node["type"]
            node_data = node["data"]

            if node_type == "subgraph":
                subgraph = create_subgraph(node_data)
                graph_builder.add_node(node_id, subgraph)
            elif node_type == "answer":
                _add_answer_node(graph_builder, node_id, node_data)
            elif node_type == "retrieval":
                _add_retrieval_node(graph_builder, node_id, node_data)
            elif node_type == "llm":
                _add_llm_node(
                    graph_builder,
                    node_id,
                    node_data,
                    nodes,
                    edges,
                    is_sequential,
                    is_hierarchical,
                    llm_children,
                )
            elif node_type in ["tool", "toolretrieval"]:
                _add_tool_node(graph_builder, node_id, node_type, node_data)

        # Add edges
        for edge in edges:
            _add_edge(graph_builder, edge, nodes, conditional_edges)

        # Add conditional edges
        _add_conditional_edges(graph_builder, conditional_edges)

        # Set entry point and compile graph
        graph_builder.set_entry_point("InputNode")

        # Compile graph
        hitl_config = build_config.get("metadata", {}).get("human_in_the_loop", {})
        interrupt_before = hitl_config.get("interrupt_before", [])
        interrupt_after = hitl_config.get("interrupt_after", [])
        graph = graph_builder.compile(
            checkpointer=checkpointer,
            interrupt_before=interrupt_before,
            interrupt_after=interrupt_after,
        )

        # save graph image
        if save_graph_img:
            try:
                img_data = graph.get_graph().draw_mermaid_png()
                with open(f"save_graph_{time.time()}.png", "wb") as f:
                    f.write(img_data)
            except Exception:
                pass

        return graph

    except KeyError as e:
        raise ValueError(f"Invalid configuration: missing key {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to initialize graph: {e}")


# 辅助函数
def _create_tool_name_mapping(nodes):
    tool_name_to_node_id = {}
    for node in nodes:
        if node["type"] == "tool":
            tool_name_to_node_id[node["id"]] = [
                tool.lower() for tool in node["data"]["tools"]
            ]
        if node["type"] == "toolretrieval":
            tool_name_to_node_id[node["id"]] = [
                tool["name"].lower() for tool in node["data"]["tools"]
            ]
    return tool_name_to_node_id


def _determine_graph_type(nodes, edges):
    llm_nodes = [node for node in nodes if node["type"] == "llm"]
    is_sequential = len(llm_nodes) > 1 and all(
        any(
            edge["source"] == node["id"] and edge["target"] == next_node["id"]
            for edge in edges
        )
        for node, next_node in zip(llm_nodes[:-1], llm_nodes[1:])
    )
    is_hierarchical = len(llm_nodes) > 1 and not is_sequential
    return is_sequential, is_hierarchical


def _create_llm_children_dict(nodes, edges):
    llm_children = {node["id"]: set() for node in nodes if node["type"] == "llm"}
    for edge in edges:
        source, target = edge["source"], edge["target"]
        if source in llm_children:
            target_node = next((node for node in nodes if node["id"] == target), None)
            if target_node and target_node["type"] == "llm":
                llm_children[source].add(target)
    return llm_children


def _create_conditional_edges_dict(nodes):
    return {
        node["id"]: {"default": {}, "call_tools": {}, "call_human": {}}
        for node in nodes
        if node["type"] == "llm"
    }


def _add_answer_node(graph_builder, node_id, node_data):
    graph_builder.add_node(
        node_id,
        (
            AnswerNode(
                node_id,
                input_schema=node_data.get("answer", None),
            ).work
        ),
    )


def _add_retrieval_node(graph_builder, node_id, node_data):
    graph_builder.add_node(
        node_id,
        (
            RetrievalNode(
                node_id,
                query=node_data["query"],
                user_id=node_data["usr_id"],
                kb_id=node_data["kb_id"],
            ).work
        ),
    )


def _add_llm_node(
    graph_builder,
    node_id,
    node_data,
    nodes,
    edges,
    is_sequential,
    is_hierarchical,
    llm_children,
):
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

    if is_sequential:
        node_class = LLMNode
    elif is_hierarchical:
        if llm_children[node_id]:
            node_class = LLMNode
        else:
            node_class = LLMNode
    else:
        node_class = LLMNode

    tools_to_bind = _get_tools_to_bind(node_id, edges, nodes)

    if node_data.get("type") == "subgraph":
        subgraph = create_subgraph(node_data["subgraph_config"])
        graph_builder.add_node(node_id, SubgraphNode(subgraph).work)
    else:
        graph_builder.add_node(
            node_id,
            RunnableLambda(
                node_class(
                    node_id,
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


def _get_tools_to_bind(node_id, edges, nodes):
    tools_to_bind = []
    for edge in edges:
        if edge["source"] == node_id:
            target_node = next((n for n in nodes if n["id"] == edge["target"]), None)
            if target_node and target_node["type"] == "tool":
                tools_to_bind.extend(
                    [get_tool(tool_name) for tool_name in target_node["data"]["tools"]]
                )
            if target_node and target_node["type"] == "toolretrieval":
                tools_to_bind.extend(
                    [
                        get_retrieval_tool(
                            tool["name"],
                            tool["description"],
                            tool["usr_id"],
                            tool["kb_id"],
                        )
                        for tool in target_node["data"]["tools"]
                    ]
                )
    return tools_to_bind


def _add_tool_node(graph_builder, node_id, node_type, node_data):
    if node_type == "tool":
        tools = [get_tool(tool_name) for tool_name in node_data["tools"]]
    else:  # toolretrieval
        tools = [
            get_retrieval_tool(
                tool["name"],
                tool["description"],
                tool["usr_id"],
                tool["kb_id"],
            )
            for tool in node_data["tools"]
        ]
    graph_builder.add_node(node_id, ToolNode(tools))


def _add_edge(graph_builder, edge, nodes, conditional_edges):
    source_node = next(node for node in nodes if node["id"] == edge["source"])
    target_node = next(node for node in nodes if node["id"] == edge["target"])

    if source_node["type"] == "start":
        if edge["type"] == "default":
            graph_builder.add_edge(START, "InputNode")
            graph_builder.add_edge("InputNode", edge["target"])
        else:
            raise ValueError("Start node can only have normal edge.")
    elif source_node["type"] == "llm":
        if target_node["type"].startswith("tool"):
            if edge["type"] == "default":
                graph_builder.add_edge(edge["source"], edge["target"])
            else:
                conditional_edges[source_node["id"]]["call_tools"][
                    target_node["id"]
                ] = target_node["id"]
        elif target_node["type"] == "end":
            if edge["type"] == "default":
                graph_builder.add_edge(edge["source"], END)
            else:
                conditional_edges[source_node["id"]]["default"][END] = END
        elif target_node["type"] == "llm":
            if edge["type"] == "default":
                graph_builder.add_edge(edge["source"], edge["target"])
            else:
                conditional_edges[source_node["id"]]["default"][target_node["id"]] = (
                    target_node["id"]
                )
        else:
            if edge["type"] == "default":
                graph_builder.add_edge(edge["source"], edge["target"])
            else:
                conditional_edges[source_node["id"]]["default"][target_node["id"]] = (
                    target_node["id"]
                )
    elif source_node["type"].startswith("tool") and target_node["type"] == "llm":
        graph_builder.add_edge(edge["source"], edge["target"])
    elif source_node["type"] == "retrieval":
        graph_builder.add_edge(edge["source"], edge["target"])
    elif source_node["type"] == "answer":
        if target_node["type"] == "end":
            graph_builder.add_edge(edge["source"], END)
        else:
            graph_builder.add_edge(edge["source"], edge["target"])
    elif source_node["type"] == "subgraph":
        graph_builder.add_edge(edge["source"], edge["target"])
    elif target_node["type"] == "subgraph":
        graph_builder.add_edge(edge["source"], edge["target"])


def _add_conditional_edges(graph_builder, conditional_edges):
    for llm_id, conditions in conditional_edges.items():
        edges_dict = {
            "default": next(iter(conditions["default"].values()), END),
            **conditions["call_tools"],
        }
        if conditions["call_human"]:
            edges_dict["call_human"] = next(iter(conditions["call_human"].values()))
        if edges_dict != {"default": END}:
            graph_builder.add_conditional_edges(llm_id, should_continue, edges_dict)