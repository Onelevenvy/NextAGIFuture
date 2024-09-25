from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError
from sqlmodel import col, func, or_, select

from app.api.deps import CurrentUser, SessionDep
from app.core.tools.api_tool import ToolDefinition
from app.models import (
    Message,
    Skill,
    SkillCreate,
    SkillOut,
    SkillsOut,
    SkillUpdate,
    ToolDefinitionValidate,
)

router = APIRouter()


def validate_tool_definition(tool_definition: dict[str, Any]) -> ToolDefinition | None:
    """
    Validates the tool_definition.
    Raises an HTTPException with detailed validation errors if invalid.
    """
    try:
        return ToolDefinition.model_validate(tool_definition)
    except ValidationError as e:
        error_details = []
        for error in e.errors():
            loc = " -> ".join(map(str, error["loc"]))
            msg = error["msg"]
            error_details.append(f"Field '{loc}': {msg}")
        raise HTTPException(status_code=400, detail="; ".join(error_details))


@router.get("/", response_model=SkillsOut)
def read_skills(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve skills
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Skill)
        count = session.exec(count_statement).one()
        statement = (
            select(Skill).order_by(col(Skill.id).desc()).offset(skip).limit(limit)
        )

    else:
        count_statement = (
            select(func.count())
            .select_from(Skill)
            .where(or_(Skill.managed == True, Skill.owner_id == current_user.id))  # noqa: E712
        )
        count = session.exec(count_statement).one()

        statement = (
            select(Skill)
            .where(or_(Skill.managed == True, Skill.owner_id == current_user.id))  # noqa: E712
            .order_by(col(Skill.id).desc())
            .offset(skip)
            .limit(limit)
        )

    skills = session.exec(statement).all()

    return SkillsOut(data=skills, count=count)


@router.get("/{id}", response_model=SkillOut)
def read_skill(session: SessionDep, current_user: CurrentUser, id: int) -> Any:
    """
    Get skill by ID.
    """
    skill = session.get(Skill, id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    if not skill.managed and (skill.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return skill


@router.post("/", response_model=SkillOut)
def create_skill(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    skill_in: SkillCreate,
) -> Any:
    """
    Create new skill.
    """
    validate_tool_definition(skill_in.tool_definition)

    skill = Skill.model_validate(skill_in, update={"owner_id": current_user.id})
    session.add(skill)
    session.commit()
    session.refresh(skill)
    return skill


@router.put("/{id}", response_model=SkillOut)
def update_skill(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    skill_in: SkillUpdate,
) -> Any:
    """
    Update a skill.
    """
    skill = session.get(Skill, id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    if not current_user.is_superuser and (skill.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    if skill_in.tool_definition:
        validate_tool_definition(skill_in.tool_definition)

    update_dict = skill_in.model_dump(exclude_unset=True)
    skill.sqlmodel_update(update_dict)
    session.add(skill)
    session.commit()
    session.refresh(skill)
    return skill


@router.delete("/{id}")
def delete_skill(session: SessionDep, current_user: CurrentUser, id: int) -> Any:
    """
    Delete a skill.
    """
    skill = session.get(Skill, id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    if not current_user.is_superuser and (skill.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    if skill.managed:
        raise HTTPException(status_code=400, detail="Cannot delete managed skills")
    session.delete(skill)
    session.commit()
    return Message(message="Skill deleted successfully")


@router.post("/validate")
def validate_skill(tool_definition_in: ToolDefinitionValidate) -> Any:
    """
    Validate skill's tool definition.
    """
    try:
        validated_tool_definition = validate_tool_definition(
            tool_definition_in.tool_definition
        )
        return validated_tool_definition
    except HTTPException as e:
        raise HTTPException(status_code=400, detail=str(e.detail))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
