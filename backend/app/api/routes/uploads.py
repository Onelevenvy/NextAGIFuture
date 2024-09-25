import os
import shutil
import uuid
from datetime import datetime
from tempfile import NamedTemporaryFile
from typing import IO, Annotated, Any

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlalchemy import ColumnElement
from sqlmodel import and_, func, select
from starlette import status

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models import (
    Message,
    Upload,
    UploadCreate,
    UploadOut,
    UploadsOut,
    UploadStatus,
    UploadUpdate,
)
from app.tasks.tasks import add_upload, edit_upload, remove_upload

router = APIRouter()


async def valid_content_length(
    content_length: int = Header(..., le=settings.MAX_UPLOAD_SIZE),
) -> int:
    return content_length


def save_file_if_within_size_limit(file: UploadFile, file_size: int) -> IO[bytes]:
    """
    Check if the uploaded file size is smaller than the specified file size.
    This is to restrict an attacker from sending a valid Content-Length header and a
    body bigger than what the app can take.
    If the file size exceeds the limit, raise an HTTP 413 error. Otherwise, save the file
    to a temporary location and return the temporary file.

    Args:
        file (UploadFile): The file uploaded by the user.
        file_size (int): The file size in bytes.

    Raises:
        HTTPException: If the file size exceeds the maximum allowed size.

    Returns:
        IO: A temporary file containing the uploaded data.
    """
    # Check file size
    real_file_size = 0
    temp: IO[bytes] = NamedTemporaryFile(delete=False)
    for chunk in file.file:
        real_file_size += len(chunk)
        if real_file_size > file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Too large"
            )
        temp.write(chunk)
    temp.close()
    return temp


def move_upload_to_shared_folder(filename: str, temp_file_dir: str) -> str:
    """
    Move an uploaded file to a shared folder with a unique name and set its permissions.

    Args:
        filename (str): The original name of the uploaded file.
        temp_file_dir (str): The directory of the temporary file.

    Returns:
        str: The new file path in the shared folder.
    """
    file_name = f"{uuid.uuid4()}-{filename}"
    file_path = f"./app/{file_name}"
    shutil.move(temp_file_dir, file_path)
    os.chmod(file_path, 0o775)
    return file_path


@router.get("/", response_model=UploadsOut)
def read_uploads(
    session: SessionDep,
    current_user: CurrentUser,
    status: UploadStatus | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve uploads.
    """
    filters = []
    if status:
        filters.append(Upload.status == status)
    if not current_user.is_superuser:
        filters.append(Upload.owner_id == current_user.id)

    filter_conditions: ColumnElement[bool] | bool = and_(*filters) if filters else True

    count_statement = select(func.count()).select_from(Upload).where(filter_conditions)
    statement = select(Upload).where(filter_conditions).offset(skip).limit(limit)

    count = session.exec(count_statement).one()
    uploads = session.exec(statement).all()

    return UploadsOut(data=uploads, count=count)


@router.post("/", response_model=UploadOut)
def create_upload(
    session: SessionDep,
    current_user: CurrentUser,
    name: Annotated[str, Form()],
    description: Annotated[str, Form()],
    file: UploadFile,
    chunk_size: Annotated[int, Form(ge=0)],
    chunk_overlap: Annotated[int, Form(ge=0)],
    file_size: int = Depends(valid_content_length),
) -> Any:
    """Create upload"""
    if file.content_type not in ["application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid document type")

    temp_file = save_file_if_within_size_limit(file, file_size)
    upload = Upload.model_validate(
        UploadCreate(name=name, description=description),
        update={"owner_id": current_user.id, "status": UploadStatus.IN_PROGRESS},
    )
    session.add(upload)
    session.commit()

    try:
        # To appease type-checking. This should never happen.
        if current_user.id is None or upload.id is None:
            raise HTTPException(
                status_code=500, detail="Failed to retrieve user and upload ID"
            )

        if not file.filename or not isinstance(temp_file.name, str):
            raise HTTPException(status_code=500, detail="Failed to upload file")

        file_path = move_upload_to_shared_folder(file.filename, temp_file.name)
        add_upload.delay(
            file_path, upload.id, current_user.id, chunk_size, chunk_overlap
        )
    except Exception as e:
        session.delete(upload)
        session.commit()
        raise e

    return upload


@router.put("/{id}", response_model=UploadOut)
def update_upload(
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    name: str | None = Form(None),
    description: str | None = Form(None),
    chunk_size: Annotated[int, Form(ge=0)] | None = Form(None),
    chunk_overlap: Annotated[int, Form(ge=0)] | None = Form(None),
    file: UploadFile | None = File(None),
    file_size: int = Depends(valid_content_length),
) -> Any:
    """Update upload"""
    upload = session.get(Upload, id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    if not current_user.is_superuser and upload.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data: dict[str, str | datetime] = {}
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description
    if update_data:
        update_data["last_modified"] = datetime.now()
        update_dict = UploadUpdate(**update_data).model_dump(exclude_unset=True)
        upload.sqlmodel_update(update_dict)
        session.add(upload)

    if file:
        if file.content_type not in ["application/pdf"]:
            raise HTTPException(status_code=400, detail="Invalid document type")
        temp_file = save_file_if_within_size_limit(file, file_size)
        if upload.owner_id is None:
            raise HTTPException(status_code=500, detail="Failed to retrieve owner ID")
        if chunk_overlap is None or chunk_size is None:
            raise HTTPException(
                status_code=400,
                detail="If file is provided, chunk size and chunk overlap must be provided.",
            )

        # Set upload status to in progress
        upload.status = UploadStatus.IN_PROGRESS
        session.add(upload)
        session.commit()

        if not file.filename or not isinstance(temp_file.name, str):
            raise HTTPException(status_code=500, detail="Failed to upload file")

        file_path = move_upload_to_shared_folder(file.filename, temp_file.name)
        edit_upload.delay(file_path, id, upload.owner_id, chunk_size, chunk_overlap)

    session.commit()
    session.refresh(upload)
    return upload


@router.delete("/{id}")
def delete_upload(session: SessionDep, current_user: CurrentUser, id: int) -> Message:
    upload = session.get(Upload, id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    if not current_user.is_superuser and upload.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    try:
        # Set upload status to in progress
        upload.status = UploadStatus.IN_PROGRESS
        session.add(upload)
        session.commit()

        if upload.owner_id is None:
            raise HTTPException(status_code=500, detail="Failed to retrieve owner ID")

        remove_upload.delay(id, upload.owner_id)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete upload") from e

    return Message(message="Upload deleted successfully")
