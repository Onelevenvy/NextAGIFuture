from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from qdrant_client import QdrantClient, models


class QdrantRetriever(BaseRetriever):
    """
    Return a VectorStoreRetriever initialized from Qdrant VectorStore.

    Args:
        client (QdrantClient): The Qdrant client instance.
        collection_name (str): The name of the collection in Qdrant.
        search_kwargs (Optional[Dict]): Keyword arguments to pass to the
            search function. Can include:
                k: Number of documents to return (Default: 4)
                score_threshold: Minimum relevance threshold for
                    similarity_score_threshold
                fetch_k: Number of documents to pass to MMR algorithm (Default: 20)
                lambda_mult: Diversity of results returned by MMR;
                    1 for minimum diversity and 0 for maximum. (Default: 0.5)
                filter: Filter by document metadata
        k (int): Number of documents to return (Default: 5).

    Returns:
        VectorStoreRetriever: A retriever class for VectorStore.
    """

    client: QdrantClient
    collection_name: str
    search_kwargs: models.Filter | None = None
    k: int = 5

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> list[Document]:
        """
        Retrieve relevant documents from the Qdrant VectorStore.

        Args:
            query (str): The query text for retrieving documents.

        Returns:
            list[Document]: A list of relevant Document objects.
        """
        search_results = self.client.query(
            collection_name=self.collection_name,
            query_text=query,
            query_filter=self.search_kwargs,
        )
        documents: list[Document] = []
        for result in search_results:
            document = Document(
                page_content=result.document,
                metadata={"score": result.score},
                limit=self.k,
            )
            documents.append(document)
        return documents
