from app.core.rag.qdrant import QdrantStore
from app.core.tools.retriever_tool import create_retriever_tool
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from app.core.workflow.node.state import (
    ReturnTeamState,
    TeamState,
    parse_variables,
    update_node_outputs,
)

from langchain_core.messages import AIMessage
from langchain_core.runnables import RunnableConfig


class AnswerNode:
    def __init__(self, node_id: str, query: str, user_id: int, kb_id: int):
        self.node_id = node_id
        self.query = query
        self.qdrant_store = QdrantStore()
        self.user_id = user_id
        self.kb_id = kb_id

    async def work(self, state: TeamState, config: RunnableConfig) -> ReturnTeamState:

        if "node_outputs" not in state:
            state["node_outputs"] = {}

        if self.input_schema:
            parsed_input_schema = parse_variables(self.query, state["node_outputs"])
            result = AIMessage(self._retrieval_work(parsed_input_schema))
        else:
            messages = state.get("all_messages", [])
            result = AIMessage(
                content=messages[-1].content if messages else "No answer available."
            )

        # 更新 node_outputs
        new_output = {self.node_id: {"response": result.content}}
        state["node_outputs"] = update_node_outputs(state["node_outputs"], new_output)
        return_state: ReturnTeamState = {
            "history": state.get("history", []) + [result],
            "messages": [result],
            "all_messages": state.get("all_messages", []) + [result],
            "node_outputs": state["node_outputs"],
        }
        return return_state

    def _retrieval_work(self, qry):
        # 创建和使用检索工具
        retriever = self.qdrant_store.retriever(self.user_id, self.kb_id)
        logger.info(f"Created retriever: {retriever}")
        retriever_tool = create_retriever_tool(retriever)
        logger.info(f"Created retriever tool: {retriever_tool}")

        # 使用检索工具
        result_string, docs = retriever_tool._run(qry)

        logger.info(f"使用检索工具Retriever tool result: {result_string[:100]}...")
        return result_string
