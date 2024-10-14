import os
import importlib
from sqlalchemy import text, func
from sqlmodel import Session, create_engine, select

from app.core.config import settings
from app.core.tools import managed_tools
from app.curd import users
from app.models import Skill, User, UserCreate, ModelProvider, Models
from app.core.model_providers.model_provider_manager import model_provider_manager


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
def print_skills_info(session: Session) -> None:
        print("\nSkills Information:")
        skills = session.exec(select(Skill).order_by(Skill.id)).all()
        for skill in skills:
            print(f"Skill: {skill.name} (ID: {skill.id})")
            print(f"  Display Name: {skill.display_name}")
            print(f"  Description: {skill.description}")
            print(f"  Managed: {'Yes' if skill.managed else 'No'}")
            print(f"  Owner ID: {skill.owner_id}")
            if skill.input_parameters:
                print("  Input Parameters:")
                for param, param_type in skill.input_parameters.items():
                    print(f"    - {param}: {param_type}")
            print()

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
                or existing_skill.input_parameters
                != skill_info.input_parameters  # 检查输入参数是否变化
            ):
                # Update the existing skill's description and input parameters
                existing_skill.description = skill_info.description
                existing_skill.display_name = skill_info.display_name
                existing_skill.input_parameters = (
                    skill_info.input_parameters
                )  # 更新输入参数
                session.add(existing_skill)  # Mark the modified object for saving
        else:
            new_skill = Skill(
                name=skill_name,
                description=skill_info.description,
                managed=True,
                owner_id=user.id,
                display_name=skill_info.display_name,
                input_parameters=skill_info.input_parameters,  # 保存输入参数
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

        # 打印 skills 信息
    print_skills_info(session)

    

def init_modelprovider_model_db(session: Session) -> None:
    # 获取所有提供商配置
    providers = model_provider_manager.get_all_providers()
    
    # 按照提供商名称排序，确保处理顺序一致
    for provider_name in sorted(providers.keys()):
        provider_data = providers[provider_name]
        
        # 查找现有的提供商记录
        db_provider = session.exec(select(ModelProvider).where(ModelProvider.provider_name == provider_data['provider_name'])).first()
        
        if db_provider:
            # 更新提供商信息，但保留现有的 API 密钥和基础 URL
            db_provider.icon = provider_data['icon']
            db_provider.description = provider_data['description']
            # 注意：我们不更新 api_key 和 base_url，因为它们可能已被用户修改
        else:
            # 如果提供商不存在，创建新记录
            db_provider = ModelProvider(
                provider_name=provider_data['provider_name'],
                base_url=provider_data['base_url'],
                api_key=provider_data['api_key'],
                icon=provider_data['icon'],
                description=provider_data['description']
            )
            session.add(db_provider)
        
        session.flush()  # 确保 provider_id 已生成
        
        # 获取该提供商支持的模型
        supported_models = set(model_provider_manager.get_supported_models(provider_name))
        
        # 获取数据库中该提供商现有的模型
        existing_models = set(model.ai_model_name for model in session.exec(select(Models).where(Models.provider_id == db_provider.id)))
        
        # 添加新模型
        for model_name in sorted(supported_models - existing_models):
            new_model = Models(ai_model_name=model_name, provider_id=db_provider.id)
            session.add(new_model)
        
        # 删除不再支持的模型
        for model_name in sorted(existing_models - supported_models):
            session.exec(select(Models).where(Models.ai_model_name == model_name, Models.provider_id == db_provider.id)).delete()
    
    session.commit()

    # 打印当前数据库状态，用于验证
    providers = session.exec(select(ModelProvider).order_by(ModelProvider.id)).all()
    for provider in providers:
        print(f"Provider: {provider.provider_name} (ID: {provider.id})")
        print(f"  Base URL: {provider.base_url}")
        print(f"  API Key: {'*' * len(provider.api_key)}")  # 出于安全考虑，不打印实际的 API 密钥
        models = session.exec(select(Models).where(Models.provider_id == provider.id).order_by(Models.id)).all()
        for model in models:
            print(f"  - Model: {model.ai_model_name} (ID: {model.id})")

