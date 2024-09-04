#! /usr/bin/env bash

# Let the DB start
python backend/app/backend_pre_start.py

# Run migrations
alembic upgrade head

# Create initial data in DB
python backend/app/initial_data.py
