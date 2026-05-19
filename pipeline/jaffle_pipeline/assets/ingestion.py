"""Ingestion assets: CSV → DuckDB `raw` schema.

Two kinds of assets:

1. **Daily-partitioned facts** — `raw_orders`, `raw_order_items`. Each
   partition loads only that day's rows from the pre-generated CSV. Re-running
   the same partition deletes-and-replaces that day's rows (idempotent).

2. **Full-refresh dimensions** — `raw_customers`, `raw_products`, `raw_stores`,
   `raw_supplies`. These don't carry a date and are refreshed in full on each
   run. They're modeled as non-partitioned assets that depend on the partitioned
   ones via the daily schedule.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from dagster import (
    AssetExecutionContext,
    DailyPartitionsDefinition,
    MaterializeResult,
    MetadataValue,
    asset,
)
from dagster_duckdb import DuckDBResource

from jaffle_pipeline.paths import DATA_START_DATE, JAFGEN_OUTPUT

daily_partitions = DailyPartitionsDefinition(start_date=DATA_START_DATE)


def _csv_path(name: str) -> Path:
    return JAFGEN_OUTPUT / name


def _ensure_raw_schema(duckdb: DuckDBResource) -> None:
    with duckdb.get_connection() as con:
        con.execute("create schema if not exists raw")


def _load_full_csv(
    context: AssetExecutionContext,
    duckdb: DuckDBResource,
    csv_name: str,
    table_name: str,
) -> MaterializeResult:
    """Replace a `raw.<table>` from a CSV (used for dim-style tables)."""
    _ensure_raw_schema(duckdb)
    path = _csv_path(csv_name)
    if not path.exists():
        raise FileNotFoundError(
            f"{csv_name} not found at {path}. "
            "Run `uv run python -m jaffle_pipeline.jafgen_runner` first."
        )
    with duckdb.get_connection() as con:
        con.execute(f"drop table if exists raw.{table_name}")
        con.execute(
            f"create table raw.{table_name} as "
            f"select * from read_csv_auto('{path}', header=true)"
        )
        row_count = con.execute(f"select count(*) from raw.{table_name}").fetchone()[0]
    context.log.info(f"Loaded {row_count:,} rows into raw.{table_name}")
    return MaterializeResult(
        metadata={
            "rows": MetadataValue.int(row_count),
            "source_csv": MetadataValue.path(str(path)),
        }
    )


def _load_partition(
    context: AssetExecutionContext,
    duckdb: DuckDBResource,
    csv_name: str,
    table_name: str,
    date_column: str | None = "ordered_at",
    join_via_orders: bool = False,
) -> MaterializeResult:
    """Append a single day's rows to `raw.<table>`, idempotently.

    `date_column` is the column on the CSV (or on raw_orders, if joined) used
    to filter the partition. `join_via_orders=True` is used for order_items,
    which has no date column of its own.
    """
    _ensure_raw_schema(duckdb)
    partition_date = context.partition_key  # ISO yyyy-mm-dd
    path = _csv_path(csv_name)
    if not path.exists():
        raise FileNotFoundError(
            f"{csv_name} not found at {path}. "
            "Run `uv run python -m jaffle_pipeline.jafgen_runner` first."
        )

    with duckdb.get_connection() as con:
        # Idempotent table creation: read schema from CSV but no rows.
        con.execute(
            f"create table if not exists raw.{table_name} as "
            f"select * from read_csv_auto('{path}', header=true) where 1=0"
        )
        # Ensure the partition column we'll use for delete exists.
        con.execute(
            f"alter table raw.{table_name} add column if not exists "
            f"_partition_date date"
        )

        # Build the filter.
        if join_via_orders:
            orders_csv = _csv_path("raw_orders.csv")
            stage_sql = f"""
                with day_orders as (
                    select id as order_id
                    from read_csv_auto('{orders_csv}', header=true)
                    where cast(ordered_at as date) = date '{partition_date}'
                )
                select t.*, date '{partition_date}' as _partition_date
                from read_csv_auto('{path}', header=true) t
                inner join day_orders d on d.order_id = t.order_id
            """
        else:
            stage_sql = f"""
                select t.*, date '{partition_date}' as _partition_date
                from read_csv_auto('{path}', header=true) t
                where cast(t.{date_column} as date) = date '{partition_date}'
            """

        # Delete-then-insert for idempotency.
        con.execute(
            f"delete from raw.{table_name} where _partition_date = date '{partition_date}'"
        )
        con.execute(f"insert into raw.{table_name} {stage_sql}")
        row_count = con.execute(
            f"select count(*) from raw.{table_name} "
            f"where _partition_date = date '{partition_date}'"
        ).fetchone()[0]

    context.log.info(
        f"Loaded {row_count:,} rows into raw.{table_name} for {partition_date}"
    )
    return MaterializeResult(
        metadata={
            "rows": MetadataValue.int(row_count),
            "partition": MetadataValue.text(partition_date),
        }
    )


# ----------------------------- partitioned -------------------------------- #

@asset(
    name="raw_orders",
    key_prefix=["raw"],
    group_name="ingestion",
    partitions_def=daily_partitions,
    compute_kind="duckdb",
)
def raw_orders(context: AssetExecutionContext, duckdb: DuckDBResource):
    return _load_partition(
        context, duckdb, "raw_orders.csv", "raw_orders", date_column="ordered_at"
    )


@asset(
    name="raw_items",
    key_prefix=["raw"],
    group_name="ingestion",
    partitions_def=daily_partitions,
    deps=[raw_orders],
    compute_kind="duckdb",
)
def raw_items(context: AssetExecutionContext, duckdb: DuckDBResource):
    # jafgen names this file raw_items.csv (not raw_order_items.csv)
    return _load_partition(
        context,
        duckdb,
        "raw_items.csv",
        "raw_items",
        join_via_orders=True,
    )


# ----------------------------- dimensions --------------------------------- #

@asset(name="raw_customers", key_prefix=["raw"], group_name="ingestion", compute_kind="duckdb")
def raw_customers(context: AssetExecutionContext, duckdb: DuckDBResource):
    return _load_full_csv(context, duckdb, "raw_customers.csv", "raw_customers")


@asset(name="raw_products", key_prefix=["raw"], group_name="ingestion", compute_kind="duckdb")
def raw_products(context: AssetExecutionContext, duckdb: DuckDBResource):
    return _load_full_csv(context, duckdb, "raw_products.csv", "raw_products")


@asset(name="raw_stores", key_prefix=["raw"], group_name="ingestion", compute_kind="duckdb")
def raw_stores(context: AssetExecutionContext, duckdb: DuckDBResource):
    return _load_full_csv(context, duckdb, "raw_stores.csv", "raw_stores")


@asset(name="raw_supplies", key_prefix=["raw"], group_name="ingestion", compute_kind="duckdb")
def raw_supplies(context: AssetExecutionContext, duckdb: DuckDBResource):
    return _load_full_csv(context, duckdb, "raw_supplies.csv", "raw_supplies")


partitioned_ingestion_assets = [raw_orders, raw_items]
dim_ingestion_assets = [raw_customers, raw_products, raw_stores, raw_supplies]
ingestion_assets = partitioned_ingestion_assets + dim_ingestion_assets
