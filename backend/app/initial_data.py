import sys

sys.path.append("./")

import logging

from sqlmodel import Session

from app.core.db import engine, init_db, init_modelprovider_model_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    with Session(engine) as session:
        init_db(session)
        # init_modelprovider_model_db(session)


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
