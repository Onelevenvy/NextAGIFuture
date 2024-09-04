from io import BytesIO

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import Upload, UploadCreate, UploadStatus
from app.tests.utils.utils import random_lower_string


def create_upload(db: Session, user_id: int) -> Upload:
    upload_data = {
        "name": random_lower_string(),
        "description": random_lower_string(),
        "owner_id": user_id,
    }
    upload = Upload.model_validate(
        UploadCreate(**upload_data),
        update={
            "owner_id": user_id,
            "status": UploadStatus.COMPLETED,
        },
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload


def test_read_uploads(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_upload(db, 1)
    response = client.get(
        f"{settings.API_V1_STR}/uploads", headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "data" in data


def test_read_uploads_status_filter(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    # Create in progress upload
    upload = create_upload(db, 1)
    upload.status = UploadStatus.IN_PROGRESS
    db.add(upload)
    db.commit()

    response = client.get(
        f"{settings.API_V1_STR}/uploads",
        headers=superuser_token_headers,
        params={"status": UploadStatus.IN_PROGRESS.value},
    )
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "data" in data
    assert all(upload["status"] == UploadStatus.IN_PROGRESS for upload in data["data"])


def test_create_upload(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    # Create mock PDF file data
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n"
    file = BytesIO(pdf_content)
    file.name = "test_file.pdf"

    data = {
        "name": random_lower_string(),
        "description": random_lower_string(),
        "chunk_size": str(1024),
        "chunk_overlap": str(256),
    }

    files = {"file": (file.name, file, "application/pdf")}

    response = client.post(
        f"{settings.API_V1_STR}/uploads",
        headers=superuser_token_headers,
        data=data,
        files=files,
    )

    assert response.status_code == 200
    json_response = response.json()
    assert "id" in json_response
    assert json_response["name"] == data["name"]
    assert json_response["description"] == data["description"]


def test_update_upload(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    upload = create_upload(db, 1)
    data = {
        "name": random_lower_string(),
        "description": random_lower_string(),
    }
    response = client.put(
        f"{settings.API_V1_STR}/uploads/{upload.id}",
        headers=superuser_token_headers,
        data=data,
    )
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["name"] == data["name"]
    assert json_response["description"] == data["description"]


def test_delete_upload(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    upload = create_upload(db, 1)
    upload_id = upload.id

    response = client.delete(
        f"{settings.API_V1_STR}/uploads/{upload.id}",
        headers=superuser_token_headers,
    )

    assert response.status_code == 200
    json_response = response.json()
    assert json_response["message"] == "Upload deleted successfully"

    # Check that upload does not exist in db anymore
    db.expire_all()
    deleted_upload = db.get(Upload, upload_id)
    assert deleted_upload and deleted_upload.status == UploadStatus.IN_PROGRESS
