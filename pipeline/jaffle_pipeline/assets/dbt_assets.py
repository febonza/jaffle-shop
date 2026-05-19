"""dbt → Dagster asset bridge."""

from __future__ import annotations

from pathlib import Path

from dagster import AssetExecutionContext
from dagster_dbt import DbtCliResource, DbtProject, dbt_assets

from jaffle_pipeline.paths import DBT_PROJECT_DIR

dbt_project = DbtProject(project_dir=Path(DBT_PROJECT_DIR))
dbt_project.prepare_if_dev()


@dbt_assets(manifest=dbt_project.manifest_path)
def jaffle_dbt(context: AssetExecutionContext, dbt: DbtCliResource):
    yield from dbt.cli(["build"], context=context).stream()
