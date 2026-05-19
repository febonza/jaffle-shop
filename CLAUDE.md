# CLAUDE.md — Project orientation

Read this before doing anything. Goal: get a future Claude session up to speed without re-reading the whole repo.

## What this project is

A portfolio project showing an **end-to-end analytics stack** on synthetic Jaffle Shop data: jafgen → DuckDB (raw) → dbt (Kimball star) → Elementary tests → FastAPI → React dashboard. Daily Dagster schedule simulates fresh data arriving each morning. Designed to be polished, public-facing, and deployable to a Hostinger VPS.

## Layout (top-level)

```
design/                      Bonzanini Consulting design system — DO NOT modify
pipeline/jaffle_pipeline/    Dagster: ingestion, dbt_assets, schedule, jafgen_runner
api/jaffle_api/              FastAPI app (read-only DuckDB → JSON)
dbt/                         dbt project named "jaffle" — staging/intermediate/marts/snapshots
web/                         Vite + React + TS dashboard (Recharts)
scripts/                     bootstrap helpers (dim_date, data-model HTML)
docs/                        data-model.html, data-dictionary.md
data/                        gitignored — jafgen CSVs, jaffle.duckdb
```

## How to run things

Run all commands from the **repo root** (where `pyproject.toml` lives), not from inside `dbt/`.

| Command | What it does |
|---|---|
| `uv sync --extra dev` | Install Python + dev deps |
| `uv run python scripts/build_dim_date_seed.py` | (Re)generate dim_date.csv — 15-year calendar |
| `uv run python -m jaffle_pipeline.jafgen_runner --years 5` | One-time backfill; shifts dates to start 2022-01-01 |
| `uv run python scripts/load_raw.py` | Bootstrap: loads ALL raw CSVs into DuckDB at once (first-time only) |
| `uv run dbt deps --project-dir dbt --profiles-dir dbt` | Install dbt packages |
| `uv run dbt build --project-dir dbt --profiles-dir dbt` | Full dbt build: seed, run, snapshot, test |
| `uv run python scripts/build_data_model_html.py` | Render docs/data-model.html from dbt manifest |
| `uv run dagster dev` | Dagster UI at localhost:3000 |
| `uv run uvicorn jaffle_api.main:app --port 8001 --reload` | FastAPI at localhost:8001 |
| `cd web && npm install && npm run dev` | React app at localhost:5174 (proxies /api → :8001) |

## Where the data lives

- **`data/jaffle.duckdb`** — single-file warehouse, gitignored.
- **Schemas:**
  - `raw` — CSVs landed by Dagster ingestion (partitioned by `ordered_at::date`).
  - `staging` — dbt staging (1:1 with sources, light cleaning).
  - `intermediate` — dbt intermediates (joins, business logic).
  - `analytics` — dbt marts (Kimball facts/dims). **What the API reads.**
  - `elementary` — Elementary metadata.

## Data strategy — important context

- **jafgen is dormant** (last release April 2022). It's non-idempotent: every run produces different customers/orders. There is no `--start-date` flag.
- **We pre-generate once and replay.** `jafgen_runner.py` runs `jafgen 5` once, then shifts every `ordered_at` / `opened_at` so the series starts at **2022-01-01**. CSVs are written to `data/jafgen_output/`.
- **Daily pipeline** is real: Dagster's ingestion assets are `DailyPartitionsDefinition`-partitioned. The schedule fires at 05:00 and materializes yesterday's partition (filters the pre-generated CSV to that day).
- **Re-run any date:** use the Dagster UI partition picker, or `dagster job backfill --partitions 2025-03-04`. The plan called this out explicitly — see plan file at `/Users/bonza/.claude/plans/i-want-to-build-kind-badger.md`.

## Design constraints

The `design/` folder is the visual source of truth. Read `design/README.md` once per session. Hard rules:

- **No emoji. Anywhere.** Including code comments, commit messages, UI.
- **No gradients, no glass, no blur.** Paper brand.
- **Copper accent (`#C8632C`) used sparingly** — < 5% of any screen.
- **Sentence case** in UI (except wordmark + uppercase eyebrows).
- **No "we"** — first-person `I` only (solo brand).
- **Tabular nums** on all numeric data (`font-family: JetBrains Mono` for stats).
- Editorial type: Fraunces serif headlines, Inter UI/body, JetBrains Mono numerals.

## Documentation contract — marts columns

Every column in `models/marts/**/*.yml` must include where applicable:

```
**Grain:** ...
**Represents:** ...
**Used by:** ...
**Business rules:** ...
**Trade-offs:** ...
**Excludes:** ...
**Includes:** ...
**AI workflow context:** ...
```

Staging/intermediate models get lighter docs. Don't skip the marts docs — they're a portfolio deliverable.

## Snapshots

Active from day one (`snap_customers`, `snap_products`). Run as part of `dbt build`. Expose SCD-2 attributes via `dim_customers` / `dim_products` (`valid_from`, `valid_to`, `is_current`).

## Git remote

Pushes go to **https://github.com/febonza/jaffle-shop** via the **personal** GitHub account. The machine has multiple accounts — verify with `git remote -v` and `gh auth status` before pushing.

## Known caveats

- **jafgen is unmaintained** — pinned to 0.4.14, if it breaks on Python 3.13+ stay on 3.10–3.12.
- **No refunds/returns** in jafgen schema. Doc blocks should call this out where revenue is computed.
- **Margin requires a BOM seed** — the synthetic `seeds/sku_supplies_bom.csv` maps SKUs to supplies; without it `cogs_usd` / `margin_usd` are unavailable.
- **`/churn` and `/ltv`** are placeholder pages. The marts for them aren't built yet.

## Open work (not yet built)

- CI pipeline (`.github/workflows/ci.yml`) — deferred.
- VPS deployment (`scripts/deploy.sh`, `docs/deploy.md`) — deferred.
- `/churn` analytics page — placeholder.
- `/ltv` analytics page — placeholder.
- Failure sensor (Slack/file log) on Dagster assets.

## Tool conventions

- **Python deps:** `uv` only. Don't use pip/poetry/conda.
- **Lint:** `ruff check .` and `sqlfluff lint dbt/models`.
- **Pre-commit:** runs ruff + sqlfluff + yamllint + prettier on staged files.
- **Tests:** `pytest pipeline/tests api/tests` and `dbt test`.
