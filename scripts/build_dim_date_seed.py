"""Generate dbt/seeds/dim_date.csv covering 2022-01-01 → 2036-12-31.

Run once at setup (and any time the schema changes). dbt seed picks it up
from there; the daily pipeline never regenerates this.
"""

from __future__ import annotations

import csv
from datetime import date, timedelta
from pathlib import Path

import holidays

START = date(2022, 1, 1)
END = date(2036, 12, 31)

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = REPO_ROOT / "dbt" / "seeds" / "dim_date.csv"

EPOCH = date(1970, 1, 1)


def daterange(start: date, end: date):
    cursor = start
    one_day = timedelta(days=1)
    while cursor <= end:
        yield cursor
        cursor += one_day


def build_rows():
    us_holidays = holidays.UnitedStates(years=range(START.year, END.year + 1))
    for d in daterange(START, END):
        iso_year, iso_week, iso_weekday = d.isocalendar()
        # ISO weekday: Mon=1..Sun=7. Convert to Sun=0..Sat=6 for a "standard" view.
        py_weekday = d.weekday()  # Mon=0..Sun=6
        is_weekend = py_weekday >= 5
        is_holiday = d in us_holidays
        holiday_name = us_holidays.get(d, "")
        # Simple fiscal calendar: matches calendar year. Override here if needed.
        fiscal_year = d.year
        fiscal_quarter = (d.month - 1) // 3 + 1
        yield {
            "date_day": d.isoformat(),
            "date_key": int(d.strftime("%Y%m%d")),
            "year": d.year,
            "quarter": (d.month - 1) // 3 + 1,
            "month": d.month,
            "month_name": d.strftime("%B"),
            "month_short": d.strftime("%b"),
            "day_of_month": d.day,
            "day_of_year": int(d.strftime("%j")),
            "day_of_week": py_weekday,
            "day_name": d.strftime("%A"),
            "day_short": d.strftime("%a"),
            "iso_year": iso_year,
            "iso_week": iso_week,
            "iso_weekday": iso_weekday,
            "week_of_year": int(d.strftime("%U")),
            "is_weekend": int(is_weekend),
            "is_us_holiday": int(is_holiday),
            "holiday_name": holiday_name,
            "fiscal_year": fiscal_year,
            "fiscal_quarter": fiscal_quarter,
            "days_since_epoch": (d - EPOCH).days,
            "first_day_of_month": d.replace(day=1).isoformat(),
        }


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    rows = list(build_rows())
    fieldnames = list(rows[0].keys())
    with OUTPUT.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows):,} rows to {OUTPUT.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
