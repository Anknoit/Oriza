# file: alembic/env.py
import asyncio
import os
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy import engine_from_config
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from alembic import context

# this loads the logging config from alembic.ini
config = context.config
fileConfig(config.config_file_name)

# Try to read DB URL from environment (preferred).
DATABASE_URL = os.getenv("DATABASE_URL")

# If not set, fallback to app.db (which loads .env via python-dotenv)
if not DATABASE_URL:
    try:
        from app.db import DATABASE_URL as APP_DB_URL
        DATABASE_URL = APP_DB_URL
    except Exception:
        raise RuntimeError("DATABASE_URL not set and app.db not importable.")

# Import your models' Base metadata here
# Make sure the import path is correct relative to alembic/env.py
from app.models import Base  # noqa
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode (no DB connection)."""
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    """Run migrations in 'online' mode using AsyncEngine."""
    connectable = create_async_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
