from sqlmodel import Session, select
from app.models import Skill

def get_tool_credentials(db: Session, tool_name: str) -> dict:
    skill = db.exec(select(Skill).where(Skill.name == tool_name)).first()
    if skill and skill.credentials:
        return skill.credentials
    return {}
