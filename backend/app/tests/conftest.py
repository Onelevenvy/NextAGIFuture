from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete, insert

from app.core.config import settings
from app.core.db import engine, init_db
from app.core.security import get_password_hash
from app.main import app
from app.models import Checkpoint, Member, Skill, Team, Thread, Upload, User
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils.utils import get_superuser_token_headers


@pytest.fixture(scope="module", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        yield session

        deleteCheckpoint = delete(Checkpoint)
        session.exec(deleteCheckpoint)  # type: ignore[call-overload]

        deleteThread = delete(Thread)
        session.exec(deleteThread)  # type: ignore[call-overload]

        deleteSkill = delete(Skill)
        session.exec(deleteSkill)  # type: ignore[call-overload]

        deleteUpload = delete(Upload)
        session.exec(deleteUpload)  # type: ignore[call-overload]

        deleteMember = delete(Member)
        session.exec(deleteMember)  # type: ignore[call-overload]

        deleteTeam = delete(Team)
        session.exec(deleteTeam)  # type: ignore[call-overload]

        deleteUser = delete(User)
        session.exec(deleteUser)  # type: ignore[call-overload]

        insertSuperuser = insert(User).values(
            id=1,
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            is_superuser=True,
        )
        session.exec(insertSuperuser)  # type: ignore[call-overload]

        session.commit()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )
