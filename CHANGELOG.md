# Changelog

Notable changes to the Jaffle Shop portfolio project, newest first.

---

## 2026-05-21

### Data quality page (Elementary integration)

- Built the `/data-quality` page replacing the stub: live Elementary test results, per-table trust scores, test failure list, source freshness status, and a link to the full Elementary HTML report.
- Added `GET /api/app/data-quality` endpoint reading from `jaffle.elementary.*` tables.
- Removed the WIP badge from the Data quality nav link.
- Added D-1 source freshness check on `raw_orders` (warn after 25h, error after 49h).
- Deleted 17 stale pre-compiled `.js` files from `web/src/` — Vite now compiles from `.tsx` throughout.

### Infrastructure fix

- Fixed `dbt_invocations` query in the data-quality endpoint to skip invocations with no test results (e.g., `dbt source freshness` runs).

---

## Earlier work

See `git log` for history prior to this changelog.
