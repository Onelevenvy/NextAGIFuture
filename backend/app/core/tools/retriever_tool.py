from typing import Annotated, Literal

from langchain_core.documents import Document
from langchain_core.prompts import BasePromptTemplate, PromptTemplate, format_document
from langchain_core.retrievers import BaseRetriever
from langchain_core.tools import BaseTool


class RetrieverTool(BaseTool):
    name: str = "KnowledgeBase"
    description: str = "Query documents for answers."
    response_format: Literal["content", "content_and_artifact"] = "content_and_artifact"

    retriever: BaseRetriever
    document_prompt: BasePromptTemplate | PromptTemplate  # type: ignore [type-arg]
    document_separator: str

    def _run(
        self, query: Annotated[str, "query to look up in retriever"]
    ) -> tuple[str, list[Document]]:
        """Retrieve documents from knowledge base."""
        docs = self.retriever.invoke(query, config={"callbacks": self.callbacks})
        result_string = self.document_separator.join(
            [format_document(doc, self.document_prompt) for doc in docs]
        )
        return result_string, docs


def create_retriever_tool(
    retriever: BaseRetriever,
    document_prompt: BasePromptTemplate | None = None,  # type: ignore [type-arg]
    document_separator: str = "\n\n",
) -> BaseTool:
    document_prompt = document_prompt or PromptTemplate.from_template("{page_content}")

    return RetrieverTool(
        retriever=retriever,
        document_prompt=document_prompt,
        document_separator=document_separator,
    )
