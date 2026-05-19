"""Shared filesystem paths for the pipeline."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = REPO_ROOT / "data"
JAFGEN_OUTPUT = DATA_DIR / "jafgen_output"
DUCKDB_PATH = DATA_DIR / "jaffle.duckdb"

DBT_PROJECT_DIR = REPO_ROOT / "dbt"
DBT_PROFILES_DIR = REPO_ROOT / "dbt"

WEB_PUBLIC_DIR = REPO_ROOT / "web" / "public"
ELEMENTARY_OUTPUT = WEB_PUBLIC_DIR / "elementary"

DATA_START_DATE = "2022-01-01"
