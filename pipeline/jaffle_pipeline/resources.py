"""Dagster resources: DuckDB connection, dbt resource."""

from __future__ import annotations

from dagster_dbt import DbtCliResource
from dagster_duckdb import DuckDBResource

from jaffle_pipeline.paths import DBT_PROFILES_DIR, DBT_PROJECT_DIR, DUCKDB_PATH

duckdb_resource = DuckDBResource(database=str(DUCKDB_PATH))

dbt_resource = DbtCliResource(
    project_dir=str(DBT_PROJECT_DIR),
    profiles_dir=str(DBT_PROFILES_DIR),
)
