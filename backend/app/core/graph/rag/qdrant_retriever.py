from langchain_community.vectorstores import Qdrant
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_core.embeddings import Embeddings
from qdrant_client import QdrantClient, models
from app.core.config import settings
from app.core.graph.rag.embeddings import get_embedding_model

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
    embeddings: Embeddings

    def __init__(
        self,
        client: QdrantClient,
        collection_name: str,
        embeddings: Embeddings,
        search_kwargs: models.Filter | None = None,
        k: int = 5
    ):
        super().__init__()
        self.client = client
        self.collection_name = collection_name
        self.search_kwargs = search_kwargs
        self.k = k
        self.embeddings = embeddings

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> list[Document]:
        qdrant = Qdrant(
            client=self.client,
            collection_name=self.collection_name,
            embeddings=self.embeddings,
        )
        return qdrant.similarity_search(query, filter=self.search_kwargs, k=self.k)
