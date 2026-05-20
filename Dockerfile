FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_NO_CACHE=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends tini git \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.6 /uv /usr/local/bin/uv

RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home /app --shell /usr/sbin/nologin app

WORKDIR /app

# Deps layer — only rebuilds when pyproject.toml or uv.lock changes
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev

# Put the venv on PATH so entry-points (dbt, dagster-daemon, uvicorn, etc.) are available
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/api:/app/pipeline"

COPY api/        ./api/
COPY pipeline/   ./pipeline/
COPY dbt/        ./dbt/
COPY scripts/    ./scripts/
COPY workspace.yaml ./workspace.yaml

# Install dbt packages and generate the manifest so @dbt_assets can load at startup
RUN dbt deps --project-dir dbt --profiles-dir dbt \
    && dbt parse --project-dir dbt --profiles-dir dbt --target ci

# Pre-create mount points so named volumes attach with correct ownership
RUN mkdir -p /app/data/jafgen_output /app/web/public/elementary /dagster_home \
    && chown -R app:app /app /dagster_home

USER app

ENTRYPOINT ["/usr/bin/tini", "--"]
