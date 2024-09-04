from collections.abc import Callable
from typing import Any
import os
import pymupdf  # type: ignore[import-untyped]
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from langchain_community.document_loaders import WebBaseLoader
from app.core.config import settings
from app.core.graph.rag.qdrant_retriever import QdrantRetriever


class QdrantStore:
    """
    A class to handle uploading and searching documents in a Qdrant vector store.
    """

    collection_name = settings.QDRANT_COLLECTION
    url = settings.QDRANT_URL

    def __init__(self) -> None:
        self.client = self._create_collection()

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

        self.client.add(
            collection_name=self.collection_name,
            documents=doc_texts,
            metadata=metadata,
        )

        callback() if callback else None

    def _create_collection(self) -> QdrantClient:
        """
        Creates a collection in Qdrant if it does not already exist, configured for hybrid search.

        The collection uses both dense and sparse vector models. Returns an instance of the Qdrant client.

        Returns:
            QdrantClient: An instance of the Qdrant client.
        """
        client = QdrantClient(
            url=self.url, api_key=settings.QDRANT_SERVICE_API_KEY, prefer_grpc=True
        )
        client.set_model(settings.DENSE_EMBEDDING_MODEL)
        client.set_sparse_model(settings.SPARSE_EMBEDDING_MODEL)

        if not client.collection_exists(self.collection_name):
            client.create_collection(
                collection_name=self.collection_name,
                vectors_config=client.get_fastembed_vector_params(),
                sparse_vectors_config=client.get_fastembed_sparse_vector_params(),
            )
        return client

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
        """
        Creates a VectorStoreRetriever that retrieves results containing the specified user_id and upload_id in the metadata.

        Args:
            user_id (int): Filters the retriever results to only include those belonging to this user.
            upload_id (int): Filters the retriever results to only include those from this upload ID.

        Returns:
            VectorStoreRetriever: A VectorStoreRetriever instance.
        """
        retriever = QdrantRetriever(
            client=self.client,
            collection_name=self.collection_name,
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
        return retriever

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
        search_results = self.client.query(
            collection_name=self.collection_name,
            query_text=query,
            query_filter=rest.Filter(
                must=[
                    rest.FieldCondition(
                        key="user_id",
                        match=rest.MatchValue(value=user_id),
                    ),
                    rest.FieldCondition(
                        key="upload_id",
                        match=rest.MatchAny(any=upload_ids),
                    ),
                ],
            ),
        )
        documents: list[Document] = []
        for result in search_results:
            document = Document(
                page_content=result.document,
                metadata={"score": result.score},
            )
            documents.append(document)
        return documents
