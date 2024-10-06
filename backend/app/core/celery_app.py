import logging
import os

from celery import Celery

from app.core.config import settings

# 配置基本日志
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

os.environ["HUGGINGFACE_HUB_CACHE"] = os.path.join(os.getcwd(), "fastembed_cache")
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"


celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    # broker="redis://localhost:6379/0",
    backend=settings.CELERY_RESULT_BACKEND,
    # backend="redis://localhost:6379/0",
    include=["app.tasks.tasks"],
)

celery_app.conf.update(
    result_expires=3600,
)

celery_app.conf.task_routes = {"app.worker.celery_worker.*": "main-queue"}
celery_app.conf.update(task_track_started=True)

# 配置 Celery 日志
celery_app.conf.update(
    worker_hijack_root_logger=False,
    worker_log_format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    worker_task_log_format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@celery_app.task(acks_late=True)
def test_celery(word: str) -> str:
    logging.info(f"Test task received: {word}")
    return f"test task return {word}"
