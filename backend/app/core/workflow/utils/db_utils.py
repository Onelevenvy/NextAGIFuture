from contextlib import contextmanager
from typing import Callable, TypeVar

from sqlmodel import Session

from app.core.db import engine

T = TypeVar("T")


@contextmanager
def get_db_session():
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def db_operation(operation: Callable[[Session], T]) -> T:
    """
    执行数据库操作的辅助函数。

    :param operation: 一个接受 Session 作为参数并返回结果的函数。
    :return: 操作的结果。
    """
    with get_db_session() as session:
        return operation(session)


# 示例用法
def get_all_models_helper():
    from app.curd.models import get_all_models

    return db_operation(get_all_models)


def get_models_by_provider_helper(provider_id: int):
    from app.curd.models import get_models_by_provider

    return db_operation(lambda session: get_models_by_provider(session, provider_id))


# 可以根据需要添加更多辅助函数
