from typing import List, Callable
from langchain_community.document_loaders import PyMuPDFLoader, WebBaseLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance

from app.core.config import settings
from app.core.graph.rag.embeddings import get_embedding_model

import logging

logger = logging.getLogger(__name__)


class QdrantStore:
    def __init__(self) -> None:
        self.collection_name = settings.QDRANT_COLLECTION
        self.url = settings.QDRANT_URL
        self.embedding_model = get_embedding_model(settings.EMBEDDING_MODEL)

        logger.info(f"Initializing QdrantStore with URL: {self.url}")

        self.client = QdrantClient(
            url=self.url, api_key=settings.QDRANT_SERVICE_API_KEY, prefer_grpc=False
        )
        logger.info("QdrantClient initialized successfully")

        self.vector_store = QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embedding_model,
        )

    def add(
        self,
        file_path: str,
        upload_id: int,
        user_id: int,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        callback: Callable[[], None] | None = None,
    ) -> None:
        if file_path.endswith(".pdf"):
            loader = PyMuPDFLoader(file_path)
        elif file_path.endswith(".html"):
            loader = WebBaseLoader(file_path)
        else:
            raise ValueError("Unsupported file type")

        documents = loader.load()
        for doc in documents:
            doc.metadata.update({"user_id": user_id, "upload_id": upload_id})

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        docs = text_splitter.split_documents(documents)

        self.vector_store.add_documents(docs)

        if callback:
            callback()

    def delete(self, upload_id: int, user_id: int) -> None:
        self.vector_store.delete(
            filter={
                "must": [
                    {"key": "user_id", "match": {"value": user_id}},
                    {"key": "upload_id", "match": {"value": upload_id}},
                ]
            }
        )

    def update(
        self,
        file_path: str,
        upload_id: int,
        user_id: int,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        callback: Callable[[], None] | None = None,
    ) -> None:
        self.delete(upload_id, user_id)
        self.add(file_path, upload_id, user_id, chunk_size, chunk_overlap)
        if callback:
            callback()

    def retriever(self, user_id: int, upload_id: int):
        return self.vector_store.as_retriever(
            search_kwargs={
                "filter": {
                    "must": [
                        {"key": "user_id", "match": {"value": user_id}},
                        {"key": "upload_id", "match": {"value": upload_id}},
                    ]
                }
            }
        )

    def search(self, user_id: int, upload_ids: List[int], query: str) -> List[Document]:
        return self.vector_store.similarity_search(
            query,
            filter={
                "must": [
                    {"key": "user_id", "match": {"value": user_id}},
                    {"key": "upload_id", "match": {"any": upload_ids}},
                ]
            },
            k=4,
        )
