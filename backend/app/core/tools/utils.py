from sqlmodel import select
from app.models import Skill
from app.core.database import get_session


def get_tool_credentials(tool_name: str) -> dict:
    with get_session() as session:
        skill = session.exec(select(Skill).where(Skill.display_name == tool_name)).first()
        if skill and skill.credentials:
            return skill.credentials
    return {}


def get_credential_value(tool_name: str, credential_key: str):
    def db_operation_func():
        credentials = get_tool_credentials(tool_name)
        return credentials.get(credential_key, {}).get("value", "")
    return db_operation_func
