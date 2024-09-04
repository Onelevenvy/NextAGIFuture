import json

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import Skill, SkillCreate
from app.tests.utils.utils import random_lower_string

valid_tool_definition = json.loads(
    json.dumps(
        {
            "function": {
                "name": "getWeatherForecast",
                "description": "Fetches the weather forecast for a given location based on latitude and longitude.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "latitude": {
                            "type": "number",
                            "description": "Latitude of the location",
                        },
                        "longitude": {
                            "type": "number",
                            "description": "Longitude of the location",
                        },
                        "current": {
                            "type": "string",
                            "description": "Current weather parameters to fetch",
                            "enum": ["temperature_2m,wind_speed_10m"],
                        },
                    },
                    "required": ["latitude", "longitude"],
                },
            },
            "url": "https://api.open-meteo.com/v1/forecast",
            "method": "GET",
            "headers": {"Content-Type": "application/json"},
        }
    )
)


def create_skill(db: Session, user_id: int) -> Skill:
    skill_data = {
        "name": random_lower_string(),
        "description": random_lower_string(),
        "managed": False,
        "tool_definition": valid_tool_definition,
        "owner_id": user_id,
    }
    skill = Skill.model_validate(
        SkillCreate(**skill_data), update={"owner_id": user_id}
    )
    db.add(skill)
    db.commit()
    return skill


def test_read_skills(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_skill(db, 1)
    response = client.get(
        f"{settings.API_V1_STR}/skills", headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "data" in data


def test_read_skill(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    skill = create_skill(db, 1)
    response = client.get(
        f"{settings.API_V1_STR}/skills/{skill.id}", headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == skill.name
    assert data["description"] == skill.description
    assert data["managed"] == skill.managed
    assert data["tool_definition"] == skill.tool_definition


def test_create_skill(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    skill_data = {
        "name": random_lower_string(),
        "description": random_lower_string(),
        "tool_definition": valid_tool_definition,
    }
    response = client.post(
        f"{settings.API_V1_STR}/skills",
        json=skill_data,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == skill_data["name"]
    assert data["description"] == skill_data["description"]
    assert data["tool_definition"] == skill_data["tool_definition"]


def test_create_skill_with_invalid_tool_definition(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    skill_data = {
        "name": random_lower_string(),
        "description": random_lower_string(),
        "tool_definition": {"hello": "world"},
    }
    response = client.post(
        f"{settings.API_V1_STR}/skills",
        json=skill_data,
        headers=superuser_token_headers,
    )
    assert response.status_code == 400


def test_update_skill(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    skill = create_skill(db, 1)
    updated_skill_data = {"name": random_lower_string()}
    response = client.put(
        f"{settings.API_V1_STR}/skills/{skill.id}",
        json=updated_skill_data,
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == updated_skill_data["name"]


def test_update_skill_with_invalid_tool_definition(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    skill = create_skill(db, 1)
    updated_skill_data = {"tool_definition": {"hello": "world"}}
    response = client.put(
        f"{settings.API_V1_STR}/skills/{skill.id}",
        json=updated_skill_data,
        headers=superuser_token_headers,
    )
    assert response.status_code == 400


def test_delete_skill(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    skill = create_skill(db, 1)
    response = client.delete(
        f"{settings.API_V1_STR}/skills/{skill.id}", headers=superuser_token_headers
    )
    assert response.status_code == 200
