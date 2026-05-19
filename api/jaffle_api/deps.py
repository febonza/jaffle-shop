"""DuckDB connection dependency.

Opens read-only so a parallel `dbt build` or Dagster run can write to the same
file without contention. The connection is created per request (DuckDB
read-only handles are cheap to open) — the alternative of a long-lived shared
connection caches the catalog and misses dbt-written changes until the API
restarts.
"""

from __future__ import annotations

import os
from collections.abc import Iterator
from pathlib import Path

import duckdb

DEFAULT_DB = Path(__file__).resolve().parents[2] / "data" / "jaffle.duckdb"

DUCKDB_PATH = Path(os.environ.get("JAFFLE_DUCKDB_PATH", str(DEFAULT_DB)))


def get_conn() -> Iterator[duckdb.DuckDBPyConnection]:
    if not DUCKDB_PATH.exists():
        raise RuntimeError(
            f"DuckDB file not found at {DUCKDB_PATH}. "
            "Run the Dagster pipeline (or `dbt build`) first."
        )
    con = duckdb.connect(str(DUCKDB_PATH), read_only=True)
    try:
        yield con
    finally:
        con.close()
