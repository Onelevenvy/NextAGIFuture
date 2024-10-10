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
    def __init__(self, node_id: str, input_schema: str):
        self.node_id = node_id
        self.input_schema = input_schema
        self.qdrant_store = QdrantStore()
    async def work(self, state: TeamState, config: RunnableConfig) -> ReturnTeamState:
       
        # 创建和使用检索工具
        retriever = self.qdrant_store.retriever(user_id, upload_id)
        logger.info(f"Created retriever: {retriever}")
        retriever_tool = create_retriever_tool(retriever)
        logger.info(f"Created retriever tool: {retriever_tool}")

        # 使用检索工具
        result, docs = retriever_tool._run(query)

        logger.info(f"使用检索工具Retriever tool result: {result[:100]}...")
        return result