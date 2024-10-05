from typing import List, Callable
from langchain_community.document_loaders import PyMuPDFLoader, WebBaseLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from qdrant_client.models import VectorParams, Distance
import pymupdf
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

        self._initialize_vector_store()

    def _initialize_vector_store(self):
        try:
            collections = self.client.get_collections().collections
            if self.collection_name not in [collection.name for collection in collections]:
                logger.info(f"Creating new collection: {self.collection_name}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_model.dimension, distance=Distance.COSINE
                    ),
                )
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="user_id",
                    field_schema="integer",
                )
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="upload_id",
                    field_schema="integer",
                )
            else:
                logger.info(f"Using existing collection: {self.collection_name}")

            collection_info = self.client.get_collection(self.collection_name)
            logger.info(f"Collection info: {collection_info}")

            self.vector_store = QdrantVectorStore(
                client=self.client,
                collection_name=self.collection_name,
                embedding=self.embedding_model,
            )
        except Exception as e:
            logger.error(f"Error initializing vector store: {str(e)}", exc_info=True)
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
        if file_path.endswith(".pdf"):
            loader = PyMuPDFLoader(file_path)
        elif file_path.endswith(".html"):
            loader = WebBaseLoader(file_path)
        else:
            raise ValueError("Unsupported file type")

        documents = loader.load()
        for doc in documents:
            doc.metadata.update({"user_id": user_id, "upload_id": upload_id})
            logger.info(f"Document metadata: {doc.metadata}")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        docs = text_splitter.split_documents(documents)

        self.vector_store.add_documents(docs)

        if callback:
            callback()

    def delete(self, upload_id: int, user_id: int) -> bool:
        try:
            result = self.client.delete(
                collection_name=self.collection_name,
                points_selector=rest.Filter(
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
                )
            )
            logger.info(f"Delete operation result: {result}")
            return True
        except Exception as e:
            logger.error(f"Error deleting documents: {str(e)}", exc_info=True)
            return False

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

    def search(self, user_id: int, upload_ids: List[int], query: str) -> List[Document]:
        logger.info(f"Searching with query: '{query}' for user_id: {user_id}, upload_ids: {upload_ids}")
        
        query_vector = self.embedding_model.embed_query(query)
        
        filter_condition = {
            "must": [
                {"key": "metadata.user_id", "match": {"value": user_id}},
                {"key": "metadata.upload_id", "match": {"any": upload_ids}}
            ]
        }
        logger.info(f"Search filter condition: {filter_condition}")
        
        search_results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=filter_condition,
            limit=4
        )
        
        documents = [Document(page_content=result.payload.get('page_content', ''), metadata=result.payload.get('metadata', {})) for result in search_results]
        
        logger.info(f"Search results: {len(documents)} documents found")
        for doc in documents:
            logger.info(f"Document metadata: {doc.metadata}")
        
        return documents

    def retriever(self, user_id: int, upload_id: int):
        logger.info(f"Creating retriever for user_id: {user_id}, upload_id: {upload_id}")
        filter_condition = {
            "must": [
                {"key": "metadata.user_id", "match": {"value": user_id}},
                {"key": "metadata.upload_id", "match": {"value": upload_id}}
            ]
        }
        retriever = self.vector_store.as_retriever(
            search_kwargs={
                "filter": filter_condition,
                "k": 5
            },
            search_type="similarity",
        )
        logger.info(f"Retriever created: {retriever}")
        return retriever

    def debug_retriever(self, user_id: int, upload_id: int, query: str):
        logger.info(
            f"Debug retriever for user_id: {user_id}, upload_id: {upload_id}, query: '{query}'"
        )

        # 使用过滤器的搜索
        filtered_docs = self.search(user_id, [upload_id], query)
        logger.info(f"Filtered search found {len(filtered_docs)} documents")
        for doc in filtered_docs:
            logger.info(f"Filtered doc metadata: {doc.metadata}")

        # 不使用过滤器的搜索
        unfiltered_docs = self.vector_store.similarity_search(query, k=5)
        logger.info(f"Unfiltered search found {len(unfiltered_docs)} documents")

        # 打印所有文档的元数据
        for i, doc in enumerate(unfiltered_docs):
            logger.info(f"Unfiltered doc {i} metadata: {doc.metadata}")

        return filtered_docs

    def get_collection_info(self):
        collection_info = self.client.get_collection(self.collection_name)
        logger.info(f"Collection info: {collection_info}")
        return collection_info