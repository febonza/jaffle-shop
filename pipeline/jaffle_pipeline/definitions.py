"""Dagster entry point. Wires resources, assets, jobs, and schedules."""

from __future__ import annotations

from dagster import Definitions

from jaffle_pipeline.assets.dbt_assets import jaffle_dbt
from jaffle_pipeline.assets.elementary import elementary_freshness, elementary_report
from jaffle_pipeline.assets.ingestion import ingestion_assets
from jaffle_pipeline.resources import dbt_resource, duckdb_resource
from jaffle_pipeline.schedules import daily_ingestion_job, daily_schedule

defs = Definitions(
    assets=[*ingestion_assets, jaffle_dbt, elementary_freshness, elementary_report],
    resources={
        "duckdb": duckdb_resource,
        "dbt": dbt_resource,
    },
    jobs=[daily_ingestion_job],
    schedules=[daily_schedule],
)
