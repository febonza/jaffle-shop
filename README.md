# Jaffle Shop Portfolio

End-to-end analytics portfolio on synthetic Jaffle Shop data.
**Dagster** orchestrates a daily pipeline that lands CSVs into **DuckDB**, builds a Kimball star schema with **dbt**, tests it with **Elementary**, and serves it through a **FastAPI** backend to a multi-page **React** site styled with the Bonzanini Consulting design system.

**Site:** `/` editorial landing → `/app` live dashboard (KPIs, revenue race, categories, products, stores, order-size) → `/ltv` `/churn` `/data-quality` work-in-progress stubs.

## Stack

| Layer | Tool |
|---|---|
| Data generator | [`jafgen`](https://github.com/dbt-labs/jaffle-shop-generator) (pinned 0.4.14) |
| Warehouse | DuckDB |
| Transform | dbt-core + `dbt-duckdb` |
| Orchestration | Dagster |
| Observability | Elementary |
| Python | `uv`-managed, Python 3.10+ |
| API | FastAPI |
| Web | Vite + React + TypeScript, Recharts |
| Hosting | Hostinger VPS (Caddy reverse-proxy) |

## Quickstart

Run all commands from the **repo root** (where `pyproject.toml` lives).

```bash
# 1. Install Python deps
uv sync --extra dev

# 2. Generate 15-year dim_date seed CSV
uv run python scripts/build_dim_date_seed.py

# 3. One-time jafgen backfill — generates 5y of data, shifts to start 2022-01-01
uv run python -m jaffle_pipeline.jafgen_runner --years 5

# 4. Bootstrap: load all raw CSVs into DuckDB at once (first-time only)
#    After this, the Dagster daily schedule handles incremental loads.
uv run python scripts/load_raw.py

# 5. dbt — install packages, build all models + run all tests
uv run dbt deps   --project-dir dbt --profiles-dir dbt
uv run dbt build  --project-dir dbt --profiles-dir dbt

# 6. Generate the standalone data-model HTML
uv run python scripts/build_data_model_html.py

# 7. Dagster UI (localhost:3000) — daily schedule + asset lineage
uv run dagster dev

# 8. FastAPI (localhost:8001) — runs against the same DuckDB file
uv run uvicorn jaffle_api.main:app --port 8001 --reload

# 9. Web (localhost:5174) — Vite dev server, proxies /api → :8001
cd web && npm install && npm run dev
```

See [CLAUDE.md](CLAUDE.md) for project conventions and orientation.

## Layout

```
design/      — Bonzanini design system (untouched; source of truth for visual style)
pipeline/    — Dagster project
api/         — FastAPI backend
dbt/         — dbt project (jaffle)
web/         — Vite + React dashboard
scripts/     — bootstrap helpers
docs/        — data model HTML, data dictionary
data/        — DuckDB + generated CSVs (gitignored)
```
