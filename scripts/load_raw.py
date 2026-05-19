"""Load all jafgen CSVs into DuckDB raw schema in one shot.

This is the bootstrap alternative to running the Dagster pipeline for the first time.
Run this ONCE to seed the warehouse with full history; after that the Dagster daily
schedule handles incremental loads.

    uv run python scripts/load_raw.py
"""

from __future__ import annotations

from pathlib import Path

import duckdb

REPO_ROOT = Path(__file__).resolve().parent.parent
DUCKDB_PATH = REPO_ROOT / "data" / "jaffle.duckdb"
JAFGEN_OUTPUT = REPO_ROOT / "data" / "jafgen_output"

TABLES = {
    "raw_customers": "raw_customers.csv",
    "raw_orders": "raw_orders.csv",
    "raw_items": "raw_items.csv",
    "raw_products": "raw_products.csv",
    "raw_stores": "raw_stores.csv",
    "raw_supplies": "raw_supplies.csv",
}


def main() -> None:
    DUCKDB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect(str(DUCKDB_PATH))
    con.execute("create schema if not exists raw")
    for table, csv_file in TABLES.items():
        path = JAFGEN_OUTPUT / csv_file
        if not path.exists():
            print(f"  SKIP (not found): {path.name}")
            continue
        con.execute(f"drop table if exists raw.{table}")
        con.execute(
            f"create table raw.{table} as "
            f"select * from read_csv_auto('{path}', header=true)"
        )
        n = con.execute(f"select count(*) from raw.{table}").fetchone()[0]
        print(f"  raw.{table}: {n:,} rows")
    con.close()
    print(f"\nDone — {DUCKDB_PATH}")


if __name__ == "__main__":
    main()
