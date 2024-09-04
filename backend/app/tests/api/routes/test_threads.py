from datetime import datetime

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import Team, TeamCreate, Thread, ThreadCreate
from app.tests.utils.utils import random_lower_string


def create_team(db: Session, user_id: int) -> Team:
    team_data = {
        "name": random_lower_string(),
        "description": None,
        "workflow": "sequential",  # assuming a valid workflow
        "owner_id": user_id,
    }
    team = Team.model_validate(TeamCreate(**team_data), update={"owner_id": user_id})  # noqa: F821
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def create_thread(db: Session, team_id: int | None) -> Thread:
    thread_data = {"query": random_lower_string()}
    thread = Thread.model_validate(
        ThreadCreate(**thread_data),
        update={"team_id": team_id, "updated_at": datetime.now()},
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread


def test_read_threads(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    team = create_team(db, 1)
    create_thread(db, team.id)
    response = client.get(
        f"{settings.API_V1_STR}/teams/{team.id}/threads",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "data" in data


# TODO: Need to create checkpoint or else error due to last_checkpoint not existing
# def test_read_thread(
#     client: TestClient, superuser_token_headers: dict[str, str], db: Session
# ) -> None:
#     team = create_team(db, 1)
#     thread = create_thread(db, team.id)
#     response = client.get(
#         f"{settings.API_V1_STR}/teams/{team.id}/threads/{thread.id}",
#         headers=superuser_token_headers,
#     )
#     assert response.status_code == 200
#     data = response.json()
#     assert data["query"] == thread.query
#     assert "last_checkpoint" in data


def test_create_thread(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    team = create_team(db, 1)
    thread_data = {
        "query": random_lower_string(),
    }
    response = client.post(
        f"{settings.API_V1_STR}/teams/{team.id}/threads",
        json=thread_data,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == thread_data["query"]


def test_update_thread(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    team = create_team(db, 1)
    thread = create_thread(db, team.id)
    updated_thread_data = {
        "query": random_lower_string(),
    }
    response = client.put(
        f"{settings.API_V1_STR}/teams/{team.id}/threads/{thread.id}",
        json=updated_thread_data,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == updated_thread_data["query"]


def test_delete_thread(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    team = create_team(db, 1)
    thread = create_thread(db, team.id)
    response = client.delete(
        f"{settings.API_V1_STR}/teams/{team.id}/threads/{thread.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
