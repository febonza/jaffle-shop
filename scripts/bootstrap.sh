#!/usr/bin/env bash
# One-time setup on a fresh VPS (or after wiping the warehouse volume).
# Run before `docker compose up -d`.
# Re-running wipes jafgen_output and the DuckDB file — only do this on a clean deploy.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Building Python image..."
docker compose build pipeline

echo "==> Generating 5 years of synthetic data (jafgen)..."
docker compose run --rm pipeline python -m jaffle_pipeline.jafgen_runner --years 5

echo "==> Bootstrapping raw schema..."
docker compose run --rm pipeline python scripts/load_raw.py

echo "==> Installing dbt packages..."
docker compose run --rm pipeline dbt deps --project-dir dbt --profiles-dir dbt

echo "==> Running full dbt build (seed -> run -> snapshot -> test)..."
docker compose run --rm pipeline dbt build --project-dir dbt --profiles-dir dbt

echo ""
echo "Bootstrap complete. Run: docker compose up -d"
