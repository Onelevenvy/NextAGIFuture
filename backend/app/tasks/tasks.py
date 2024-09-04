import os

from sqlmodel import Session

from app.core.celery_app import celery_app
from app.core.db import engine
from app.core.graph.rag.qdrant import QdrantStore
from app.models import Upload, UploadStatus


@celery_app.task
def add_upload(
    file_path: str, upload_id: int, user_id: int, chunk_size: int, chunk_overlap: int
) -> None:
    with Session(engine) as session:
        upload = session.get(Upload, upload_id)
        if not upload:
            raise ValueError("Upload not found")
        try:
            QdrantStore().add(file_path, upload_id, user_id, chunk_size, chunk_overlap)
            upload.status = UploadStatus.COMPLETED
            session.add(upload)
            session.commit()
        except Exception as e:
            print(f"add_upload failed: {e}")
            upload.status = UploadStatus.FAILED
            session.add(upload)
            session.commit()
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)


@celery_app.task
def edit_upload(
    file_path: str, upload_id: int, user_id: int, chunk_size: int, chunk_overlap: int
) -> None:
    with Session(engine) as session:
        upload = session.get(Upload, upload_id)
        if not upload:
            raise ValueError("Upload not found")
        try:
            QdrantStore().update(
                file_path, upload_id, user_id, chunk_size, chunk_overlap
            )
            upload.status = UploadStatus.COMPLETED
            session.add(upload)
            session.commit()
        except Exception as e:
            print(f"edit_upload failed: {e}")
            upload.status = UploadStatus.FAILED
            session.add(upload)
            session.commit()
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)


@celery_app.task
def remove_upload(upload_id: int, user_id: int) -> None:
    with Session(engine) as session:
        upload = session.get(Upload, upload_id)
        if not upload:
            raise ValueError("Upload not found")
        try:
            QdrantStore().delete(upload_id, user_id)
            session.delete(upload)
            session.commit()
        except Exception as e:
            print(f"remove_upload failed: {e}")
