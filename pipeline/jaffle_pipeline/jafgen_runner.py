"""One-time backfill driver for jafgen.

Why this exists: jafgen generates synthetic data starting from its own hardcoded
date (around 2016). For a portfolio that spans 2022 → present, we run jafgen
once, find the earliest `ordered_at` in the output, and shift every timestamp
forward so the series starts on `DATA_START_DATE` (2022-01-01).

The output lands in `data/jafgen_output/` and is read by the Dagster ingestion
assets, which filter it down to the requested daily partition.

Usage:
    uv run python -m jaffle_pipeline.jafgen_runner --years 5

Re-running wipes and regenerates `data/jafgen_output/`. Because jafgen is
non-idempotent, the customer/store UUIDs WILL be different each run; dbt
snapshots will see a discontinuity. If you've already built the warehouse,
nuke the .duckdb file too.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

from jaffle_pipeline.paths import DATA_START_DATE, JAFGEN_OUTPUT

# Columns to shift, by table. Anything not listed is left alone.
DATE_COLUMNS: dict[str, list[str]] = {
    "raw_orders.csv": ["ordered_at"],
    "raw_stores.csv": ["opened_at"],
    "raw_tweets.csv": ["tweeted_at"],
}

# Tables we care about. jafgen emits other files (e.g., tweets); we keep them
# but date-shift the ones that need it.
EXPECTED_FILES = [
    "raw_customers.csv",
    "raw_orders.csv",
    "raw_items.csv",  # jafgen names this raw_items, not raw_order_items
    "raw_products.csv",
    "raw_stores.csv",
    "raw_supplies.csv",
]


def run_jafgen(years: int, days: int, workdir: Path) -> None:
    """Invoke jafgen with the given duration; output lands in `workdir`."""
    workdir.mkdir(parents=True, exist_ok=True)
    cmd = ["jafgen", str(years)]
    if days:
        cmd += ["--days", str(days)]
    print(f"Running: {' '.join(cmd)}  (cwd={workdir})")
    result = subprocess.run(cmd, cwd=workdir, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stdout)
        sys.stderr.write(result.stderr)
        raise RuntimeError(f"jafgen exited {result.returncode}")
    # jafgen writes to ./jaffle-data/ by default; flatten it.
    nested = workdir / "jaffle-data"
    if nested.exists():
        for f in nested.iterdir():
            shutil.move(str(f), workdir / f.name)
        nested.rmdir()


def find_min_ordered_at(workdir: Path) -> datetime:
    orders_path = workdir / "raw_orders.csv"
    if not orders_path.exists():
        raise FileNotFoundError(f"jafgen did not produce {orders_path}")
    df = pd.read_csv(orders_path, usecols=["ordered_at"], parse_dates=["ordered_at"])
    return df["ordered_at"].min().to_pydatetime()


def shift_csv(path: Path, columns: list[str], shift: timedelta) -> None:
    df = pd.read_csv(path)
    for col in columns:
        if col not in df.columns:
            print(f"  skipping missing column {col} in {path.name}")
            continue
        # jafgen emits ISO8601 with or without microseconds — use ISO8601 parser.
        df[col] = pd.to_datetime(df[col], format="ISO8601") + shift
    df.to_csv(path, index=False)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--years", type=int, default=5)
    parser.add_argument("--days", type=int, default=0)
    parser.add_argument(
        "--start-date",
        type=str,
        default=DATA_START_DATE,
        help=f"Earliest date in the shifted output (default: {DATA_START_DATE})",
    )
    args = parser.parse_args()

    target_start = datetime.fromisoformat(args.start_date)

    # Wipe & regenerate.
    if JAFGEN_OUTPUT.exists():
        shutil.rmtree(JAFGEN_OUTPUT)
    JAFGEN_OUTPUT.mkdir(parents=True)

    run_jafgen(years=args.years, days=args.days, workdir=JAFGEN_OUTPUT)

    # Compute shift from the earliest ordered_at.
    raw_min = find_min_ordered_at(JAFGEN_OUTPUT)
    shift = target_start - raw_min
    print(f"Shifting all timestamps by {shift.days:+d} days "
          f"({raw_min.date()} → {target_start.date()})")

    for filename, columns in DATE_COLUMNS.items():
        path = JAFGEN_OUTPUT / filename
        if not path.exists():
            print(f"  {filename} not produced — skipping")
            continue
        shift_csv(path, columns, shift)
        print(f"  shifted {filename}")

    # Sanity report.
    df = pd.read_csv(JAFGEN_OUTPUT / "raw_orders.csv", parse_dates=["ordered_at"])
    print(
        f"\nDone. {len(df):,} orders span "
        f"{df['ordered_at'].min().date()} → {df['ordered_at'].max().date()}"
    )
    print(f"Output: {JAFGEN_OUTPUT}")


if __name__ == "__main__":
    main()
