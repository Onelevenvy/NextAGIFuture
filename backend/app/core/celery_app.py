import os

from celery import Celery

from app.core.config import settings

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
