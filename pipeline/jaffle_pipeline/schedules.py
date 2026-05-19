"""Daily schedule. Fires at 05:00 local, targeting yesterday's partition."""

from __future__ import annotations

from dagster import AssetSelection, build_schedule_from_partitioned_job, define_asset_job

from jaffle_pipeline.assets.ingestion import daily_partitions

daily_ingestion_job = define_asset_job(
    name="daily_refresh",
    selection=AssetSelection.all(),
    partitions_def=daily_partitions,
)

daily_schedule = build_schedule_from_partitioned_job(
    daily_ingestion_job,
    hour_of_day=5,
    minute_of_hour=0,
    name="daily_5am_local",
)
