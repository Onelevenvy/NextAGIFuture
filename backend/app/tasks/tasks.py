import os
import logging

from sqlmodel import Session

from app.core.celery_app import celery_app
from app.core.db import engine
from app.core.rag.qdrant import QdrantStore
from app.models import Upload, UploadStatus

logger = logging.getLogger(__name__)


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
            logger.info(f"Upload {upload_id} completed successfully")
        except Exception as e:
            logger.error(f"add_upload failed: {e}", exc_info=True)
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
            qdrant_store = QdrantStore()
            logger.info("QdrantStore initialized successfully")
            qdrant_store.update(
                file_path, upload_id, user_id, chunk_size, chunk_overlap
            )
            upload.status = UploadStatus.COMPLETED
            session.add(upload)
            session.commit()
            logger.info(f"Upload {upload_id} updated successfully")
        except Exception as e:
            logger.error(f"Error in edit_upload task: {e}", exc_info=True)
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
            logger.warning(
                f"Upload not found in database for upload_id: {upload_id}, user_id: {user_id}"
            )
            return

        try:
            qdrant_store = QdrantStore()
            deletion_successful = qdrant_store.delete(upload_id, user_id)

            if deletion_successful or not deletion_successful:
                # 无论删除是否成功，我们都从数据库中删除上传记录
                session.delete(upload)
                session.commit()
                logger.info(f"Upload {upload_id} removed from database successfully")
            else:
                logger.warning(
                    f"Failed to delete documents from Qdrant for upload_id: {upload_id}, user_id: {user_id}"
                )
                upload.status = UploadStatus.FAILED
                session.add(upload)
                session.commit()
        except Exception as e:
            logger.error(
                f"remove_upload failed for upload_id: {upload_id}, user_id: {user_id}. Error: {str(e)}",
                exc_info=True,
            )
            upload.status = UploadStatus.FAILED
            session.add(upload)
            session.commit()
