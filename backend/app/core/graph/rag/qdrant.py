import os
from collections.abc import Callable
from typing import Any
from langchain_community.embeddings import HuggingFaceEmbeddings
import pymupdf  # type: ignore[import-untyped]
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient, models
from qdrant_client.http import models as rest
from qdrant_client.http.exceptions import UnexpectedResponse

from langchain_community.vectorstores import Qdrant
from app.core.config import settings
from app.core.graph.rag.qdrant_retriever import QdrantRetriever
from app.core.graph.rag.embeddings import get_embedding_model
import logging

# 获取特定于此模块的日志记录器
logger = logging.getLogger(__name__)

class QdrantStore:
    """
    A class to handle uploading and searching documents in a Qdrant vector store.
    """

    collection_name = settings.QDRANT_COLLECTION
    url = settings.QDRANT_URL

    def __init__(self) -> None:
        logger.info("Initializing QdrantStore")
        self.client = QdrantClient(
            url=self.url, api_key=settings.QDRANT_SERVICE_API_KEY, prefer_grpc=True
        )
        try:
            logger.info(f"Attempting to get embedding model: {settings.EMBEDDING_MODEL}")
            self.embeddings = get_embedding_model(settings.EMBEDDING_MODEL)
            logger.info(f"Embeddings model initialized: {type(self.embeddings)}")
        except Exception as e:
            logger.error(f"Failed to initialize embeddings model: {e}", exc_info=True)
            logger.warning("Falling back to HuggingFaceEmbeddings")
            try:
                self.embeddings = HuggingFaceEmbeddings(
                    model_name=settings.DENSE_EMBEDDING_MODEL,
                    model_kwargs={"device": "cpu"}
                )
                logger.info(f"Fallback embeddings model initialized: {type(self.embeddings)}")
            except Exception as e2:
                logger.error(f"Failed to initialize fallback embeddings model: {e2}", exc_info=True)
                self.embeddings = None
        
        if self.embeddings is None:
            logger.error("Embeddings model is None. This will cause issues.")
        else:
            self._create_or_update_collection()

    def _create_or_update_collection(self) -> None:
        try:
            collection_info = self.client.get_collection(self.collection_name)
            existing_dim = collection_info.config.params.vectors.size
            new_dim = self.embeddings.dimension

            if existing_dim != new_dim:
                logger.warning(f"Existing collection dimension ({existing_dim}) does not match new embedding dimension ({new_dim}). Recreating collection.")
                self.client.delete_collection(self.collection_name)
                self._create_collection()
            else:
                logger.info(f"Collection {self.collection_name} exists with correct dimension.")
        except Exception as e:
            if "Collection `kb_uploads` doesn't exist" in str(e):
                logger.info(f"Collection {self.collection_name} does not exist. Creating new collection.")
                self._create_collection()
            else:
                logger.error(f"Unexpected error when checking collection: {e}")
                raise

    def _create_collection(self) -> None:
        try:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.embeddings.dimension, distance=models.Distance.COSINE
                ),
            )
            logger.info(f"Created new collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            raise

    def add(
        self,
        file_path: str,
        upload_id: int,
        user_id: int,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        callback: Callable[[], None] | None = None,
    ) -> None:
        """
        Uploads a PDF document to the Qdrant vector store after converting it to markdown and splitting into chunks.

        Args:
            upload_name (str): The name of the upload (PDF file path).
            user_id (int): The ID of the user uploading the document.
            chunk_size (int, optional): The size of each text chunk. Defaults to 500.
            chunk_overlap (int, optional): The overlap size between chunks. Defaults to 50.
        """
        if os.path.basename(file_path).endswith(".pdf"):
            doc = pymupdf.open(file_path)
        elif os.path.basename(file_path).endswith(".html"):
            loader = WebBaseLoader(file_path)
            doc = loader.load()
        else:
            raise ValueError("Unsupported file type")
        documents = [
            Document(
                page_content=page.get_text().encode("utf8"),
                metadata={"user_id": user_id, "upload_id": upload_id},
            )
            for page in doc
        ]
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        docs = text_splitter.split_documents(documents)

        doc_texts: list[str] = []
        metadata: list[dict[Any, Any]] = []
        for doc in docs:
            doc_texts.append(doc.page_content)
            metadata.append(doc.metadata)

        if isinstance(self.embeddings, HuggingFaceEmbeddings):
            self.client.add(
                collection_name=self.collection_name,
                documents=doc_texts,
                metadata=metadata,
            )
        else:
            qdrant = Qdrant(
                client=self.client,
                collection_name=self.collection_name,
                embeddings=self.embeddings,
            )
            qdrant.add_texts(doc_texts, metadatas=metadata)

        callback() if callback else None

    def delete(self, upload_id: int, user_id: int) -> None:
        """Delete points from collection where upload_id and user_id in metadata matches."""
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=rest.FilterSelector(
                filter=rest.Filter(
                    must=[
                        rest.FieldCondition(
                            key="user_id",
                            match=rest.MatchValue(value=user_id),
                        ),
                        rest.FieldCondition(
                            key="upload_id",
                            match=rest.MatchValue(value=upload_id),
                        ),
                    ]
                )
            ),
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
        """Delete and re-upload the new PDF document to the Qdrant vector store"""
        self.delete(user_id, upload_id)
        self.add(file_path, upload_id, user_id, chunk_size, chunk_overlap)
        callback() if callback else None

    def retriever(self, user_id: int, upload_id: int) -> QdrantRetriever:
        return QdrantRetriever(
            client=self.client,
            collection_name=self.collection_name,
            embeddings=self.embeddings,
            search_kwargs=rest.Filter(
                must=[
                    rest.FieldCondition(
                        key="user_id",
                        match=rest.MatchValue(value=user_id),
                    ),
                    rest.FieldCondition(
                        key="upload_id",
                        match=rest.MatchValue(value=upload_id),
                    ),
                ],
            ),
        )

    def search(self, user_id: int, upload_ids: list[int], query: str) -> list[Document]:
        """
        Performs a similarity search in the Qdrant vector store for a given query, filtered by user ID and upload names.

        Args:
            user_id (str): The ID of the user performing the search.
            upload_names (list[str]): A list of upload names to filter the search.
            query (str): The search query.

        Returns:
            List[Document]: A list of documents matching the search criteria.
        """
        qdrant = Qdrant(
            client=self.client,
            collection_name=self.collection_name,
            embeddings=self.embeddings,
        )
        filter_condition = {
            "must": [
                {"key": "user_id", "match": {"value": user_id}},
                {"key": "upload_id", "match": {"any": upload_ids}},
            ]
        }
        return qdrant.similarity_search(query, filter=filter_condition)