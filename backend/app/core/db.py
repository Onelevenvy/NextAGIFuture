import os

from sqlalchemy import text
from sqlmodel import Session, create_engine, select

from app.core.config import settings
from app.core.tools import managed_tools
from app.curd import users
from app.models import Skill, User, UserCreate


def get_url():
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "evoagi123456")
    server = os.getenv("POSTGRES_SERVER", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "evoagi")
    return f"postgresql+psycopg://{user}:{password}@{server}:{port}/{db}"


engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
# engine = create_engine(get_url())


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # from app.core.engine import engine
    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = users.create_user(session=session, user_create=user_in)

    existing_skills = session.exec(select(Skill)).all()
    existing_skills_dict = {skill.name: skill for skill in existing_skills}

    current_skill_names = set(managed_tools.keys())

    # Add or update skills in the database
    for skill_name, skill_info in managed_tools.items():

        if skill_name in existing_skills_dict:
            existing_skill = existing_skills_dict[skill_name]

            if (
                existing_skill.description != skill_info.description
                or existing_skill.display_name != skill_info.display_name
            ):

                # Update the existing skill's description
                existing_skill.description = skill_info.description
                existing_skill.display_name = skill_info.display_name
                session.add(existing_skill)  # Mark the modified object for saving
        else:
            new_skill = Skill(
                name=skill_name,
                description=skill_info.description,
                managed=True,
                owner_id=user.id,
                display_name=skill_info.display_name,
            )
            session.add(new_skill)  # Prepare new skill for addition to the database

    # Delete skills that are no longer in the current code and are managed
    for skill_name in existing_skills_dict:
        if (
            skill_name not in current_skill_names
            and existing_skills_dict[skill_name].managed
        ):
            skill_to_delete = existing_skills_dict[skill_name]
            session.delete(skill_to_delete)

    session.commit()


def init_modelprovider_model_db(session: Session) -> None:
    # Insert or update ModelProvider data
    model_provider_sql = """
    INSERT INTO ModelProvider (id, provider_name, base_url, api_key, icon, description)
    VALUES
        (4, 'openai', 'fakeurl', 'fakeapikey', 'string', 'open ai'),
        (1, 'Ollama', 'fakeurl', 'fakeapikey', 'string', 'string fake'),
        (2, 'Siliconflow', 'fakeurl', 'fakeapikey', 'string', 'siliconflow'),
        (3, 'zhipuai', 'https://open.bigmodel.cn/api/paas/v4', 'fakeapikey', 'zhipuai', '智谱AI')
    ON CONFLICT (id) DO NOTHING;
    """

    # Insert Models data
    models_sql = """
    INSERT INTO Models (id, ai_model_name, provider_id)
    VALUES
        (1, 'gpt4', 4),
        (2, 'gpt4o', 4),
        (3, 'gpt4o-mini', 4),
        (4, 'llama3.1:8b', 1),
        (5, 'Qwen/Qwen2-7B-Instruct', 2),
        (6, 'glm-4', 3),
        (7, 'glm-4-0520', 3),
        (8, 'glm-4-flash', 3)
    ON CONFLICT (id) DO NOTHING;
    """

    # Execute the SQL statements
    session.exec(text(model_provider_sql))
    session.exec(text(models_sql))
    session.commit()
