"""App-dashboard endpoints. Serve /app page charts from analytics.* marts.

Period anchor: fixed at AS_OF (default 2026-05-20, override via JAFFLE_AS_OF env).
Warehouse holds data through 2026-12-30; anchoring prevents future rows leaking into
YTD/MTD windows.
"""

from __future__ import annotations

import os
from datetime import date, timedelta
from typing import Annotated

import duckdb
from fastapi import APIRouter, Depends, Query

from jaffle_api.deps import get_conn

router = APIRouter(prefix="/app", tags=["app"])

_DEFAULT_AS_OF = date(2026, 5, 20)


def _as_of() -> date:
    raw = os.environ.get("JAFFLE_AS_OF", "")
    if raw:
        try:
            return date.fromisoformat(raw)
        except ValueError:
            pass
    return _DEFAULT_AS_OF


def _period_bounds(period: str, as_of: date) -> tuple[date, date]:
    if period == "ytd":
        return date(as_of.year, 1, 1), as_of
    if period == "mtd":
        return date(as_of.year, as_of.month, 1), as_of
    if period == "qtd":
        q_start_month = ((as_of.month - 1) // 3) * 3 + 1
        return date(as_of.year, q_start_month, 1), as_of
    if period == "30d":
        return as_of - timedelta(days=29), as_of
    if period == "90d":
        return as_of - timedelta(days=89), as_of
    return date(as_of.year, 1, 1), as_of


def _prior_year_bounds(start: date, end: date) -> tuple[date, date]:
    return date(start.year - 1, start.month, start.day), date(end.year - 1, end.month, end.day)


def _store_filter(store_ids: list[str]) -> tuple[str, dict]:
    """Return a SQL fragment and params dict for an optional store filter."""
    if not store_ids:
        return "", {}
    return "and store_id = any($stores)", {"stores": store_ids}


def _query(con: duckdb.DuckDBPyConnection, sql: str, params: dict):
    return con.execute(sql, params)


@router.get("/store-list")
def store_list(con: duckdb.DuckDBPyConnection = Depends(get_conn)):
    """All stores — used to build the store-filter dropdown."""
    rows = con.execute(
        "select store_id, store_name from analytics.dim_stores order by store_name"
    ).fetchall()
    return [{"store_id": r[0], "store_name": r[1]} for r in rows]


@router.get("/kpis")
def kpis(
    period: Annotated[str, Query(pattern="^(ytd|mtd|qtd|30d|90d)$")] = "ytd",
    stores: Annotated[str | None, Query(description="Comma-separated store IDs, or omit for all")] = None,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    """Five headline KPIs with prior-year comparisons and 12-month sparklines."""
    as_of = _as_of()
    start, end = _period_bounds(period, as_of)
    py_start, py_end = _prior_year_bounds(start, end)
    store_ids = [s.strip() for s in stores.split(",")] if stores else []
    s_clause, s_params = _store_filter(store_ids)

    def rev_query(q_start: date, q_end: date) -> tuple:
        params = {"start": q_start, "end": q_end, **s_params}
        return _query(con, f"""
            select
                coalesce(sum(gmv_usd), 0),
                coalesce(sum(orders), 0),
                coalesce(sum(item_count), 0),
                coalesce(sum(gmv_usd) / nullif(sum(orders), 0), 0)
            from analytics.mart_store_revenue_daily
            where ordered_date between $start and $end
            {s_clause}
        """, params).fetchone()

    def cust_query(q_start: date, q_end: date) -> int:
        params = {"start": q_start, "end": q_end, **s_params}
        if store_ids:
            sql = """
                select count(distinct o.customer_key)
                from analytics.fct_orders o
                join analytics.dim_stores s on s.store_key = o.store_key
                where o.ordered_date between $start and $end
                and s.store_id = any($stores)
            """
        else:
            sql = """
                select count(distinct customer_key)
                from analytics.fct_orders
                where ordered_date between $start and $end
            """
        return _query(con, sql, params).fetchone()[0]

    curr = rev_query(start, end)
    prev = rev_query(py_start, py_end)
    active_cust = cust_query(start, end)
    prev_ac = cust_query(py_start, py_end)

    spark_rows = con.execute("""
        select
            date_trunc('month', ordered_date)::date as month,
            sum(gmv_usd)   as rev,
            sum(orders)    as ord
        from analytics.mart_store_revenue_daily
        where ordered_date between ($as_of - interval '11 months')::date and $as_of
        group by 1
        order by 1
    """, {"as_of": as_of}).fetchall()

    while len(spark_rows) < 12:
        spark_rows = [(None, 0, 0), *list(spark_rows)]
    spark_rows = spark_rows[-12:]

    items_per_order = float(curr[2]) / max(1, int(curr[1]))
    prev_items_per_order = float(prev[2]) / max(1, int(prev[1]))

    return {
        "as_of": str(as_of),
        "period": period,
        "kpis": [
            {"key": "rev", "label": "Revenue", "unit": period.upper(),
             "value": float(curr[0]), "prev_value": float(prev[0]), "format": "usd-compact",
             "spark": [float(r[1]) for r in spark_rows]},
            {"key": "orders", "label": "Orders", "unit": period.upper(),
             "value": int(curr[1]), "prev_value": int(prev[1]), "format": "int",
             "spark": [int(r[2]) for r in spark_rows]},
            {"key": "customers", "label": "Active customers", "unit": period.upper(),
             "value": int(active_cust), "prev_value": int(prev_ac), "format": "int",
             "spark": None},
            {"key": "aov", "label": "Avg order value", "unit": "",
             "value": round(float(curr[3]), 2), "prev_value": round(float(prev[3]), 2),
             "format": "usd-2", "spark": None},
            {"key": "items", "label": "Items per order", "unit": "",
             "value": round(items_per_order, 2), "prev_value": round(prev_items_per_order, 2),
             "format": "num-2", "spark": None},
        ],
    }


@router.get("/revenue-race")
def revenue_race(
    stores: Annotated[str | None, Query()] = None,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    """Weekly cumulative revenue — current year vs prior year."""
    as_of = _as_of()
    store_ids = [s.strip() for s in stores.split(",")] if stores else []
    s_clause, s_params = _store_filter(store_ids)

    def weekly(yr_start: date, yr_end: date) -> list:
        params = {"yr_start": yr_start, "yr_end": yr_end, **s_params}
        return _query(con, f"""
            select
                extract(week from ordered_date)::integer as wk,
                sum(gmv_usd)                             as gmv
            from analytics.mart_store_revenue_daily
            where ordered_date between $yr_start and $yr_end
            {s_clause}
            group by 1
            order by 1
        """, params).fetchall()

    curr_yr = as_of.year
    curr_rows = weekly(date(curr_yr, 1, 1), as_of)
    prev_rows = weekly(date(curr_yr - 1, 1, 1), date(curr_yr - 1, 12, 31))

    curr_map = {int(r[0]): float(r[1]) for r in curr_rows}
    prev_map = {int(r[0]): float(r[1]) for r in prev_rows}

    result = []
    cum_curr = 0.0
    cum_prev = 0.0
    for wk in range(1, 53):
        cw = curr_map.get(wk)
        pw = prev_map.get(wk, 0.0)
        cum_prev += pw
        if cw is not None:
            cum_curr += cw
        result.append({
            "week": wk,
            "curr_weekly": cw,
            "prev_weekly": pw if pw else None,
            "curr_cumul": cum_curr if cw is not None else None,
            "prev_cumul": cum_prev,
        })

    last_curr = next((r for r in reversed(result) if r["curr_cumul"] is not None), None)
    prev_at_same = result[last_curr["week"] - 1]["prev_cumul"] if last_curr else 0

    return {
        "as_of": str(as_of),
        "weeks": result,
        "summary": {
            "curr_ytd": last_curr["curr_cumul"] if last_curr else 0,
            "prev_same_point": prev_at_same,
            "prev_full_year": result[-1]["prev_cumul"],
        },
    }


@router.get("/categories")
def categories(
    period: Annotated[str, Query(pattern="^(ytd|mtd|qtd|30d|90d)$")] = "ytd",
    stores: Annotated[str | None, Query()] = None,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    """Revenue by product category with YoY comparison."""
    as_of = _as_of()
    start, end = _period_bounds(period, as_of)
    py_start, py_end = _prior_year_bounds(start, end)
    store_ids = [s.strip() for s in stores.split(",")] if stores else []
    s_clause, s_params = _store_filter(store_ids)

    def cat_query(q_start: date, q_end: date) -> list:
        params = {"start": q_start, "end": q_end, **s_params}
        return _query(con, f"""
            select product_type, sum(gross_revenue_usd) as rev
            from analytics.mart_product_revenue_daily
            where ordered_date between $start and $end
            {s_clause}
            group by 1
        """, params).fetchall()

    curr_rows = cat_query(start, end)
    prev_rows = cat_query(py_start, py_end)
    prev_map = {r[0]: float(r[1]) for r in prev_rows}
    total = sum(float(r[1]) for r in curr_rows)

    return {
        "period": period,
        "total_revenue": total,
        "categories": [
            {
                "name": r[0],
                "revenue": float(r[1]),
                "share_pct": round(float(r[1]) / total * 100, 1) if total else 0,
                "yoy_pct": round(
                    (float(r[1]) - prev_map[r[0]]) / prev_map[r[0]] * 100, 1
                ) if prev_map.get(r[0]) else None,
            }
            for r in sorted(curr_rows, key=lambda x: -x[1])
        ],
    }


@router.get("/products")
def products(
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    sort_by: Annotated[str, Query(pattern="^(rev|units)$")] = "rev",
    period: Annotated[str, Query(pattern="^(ytd|mtd|qtd|30d|90d)$")] = "ytd",
    stores: Annotated[str | None, Query()] = None,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    """Top products by revenue or units."""
    as_of = _as_of()
    start, end = _period_bounds(period, as_of)
    store_ids = [s.strip() for s in stores.split(",")] if stores else []
    s_clause, s_params = _store_filter(store_ids)
    order_col = "rev" if sort_by == "rev" else "units"

    rows = _query(con, f"""
        select
            product_name,
            product_type,
            sum(gross_revenue_usd) as rev,
            sum(units)             as units
        from analytics.mart_product_revenue_daily
        where ordered_date between $start and $end
        {s_clause}
        group by 1, 2
        order by {order_col} desc
        limit $limit
    """, {"start": start, "end": end, "limit": limit, **s_params}).fetchall()

    return {
        "period": period,
        "sort_by": sort_by,
        "products": [
            {"name": r[0], "category": r[1], "revenue": float(r[2]), "units": int(r[3])}
            for r in rows
        ],
    }


@router.get("/stores")
def stores(
    period: Annotated[str, Query(pattern="^(ytd|mtd|qtd|30d|90d)$")] = "ytd",
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    """Revenue and orders per store."""
    as_of = _as_of()
    start, end = _period_bounds(period, as_of)

    rows = con.execute("""
        select
            store_id,
            store_name,
            sum(gmv_usd) as rev,
            sum(orders)  as orders
        from analytics.mart_store_revenue_daily
        where ordered_date between $start and $end
        group by 1, 2
        order by rev desc
    """, {"start": start, "end": end}).fetchall()

    total = sum(float(r[2]) for r in rows)
    top2 = sum(float(r[2]) for r in rows[:2]) if len(rows) >= 2 else total

    return {
        "period": period,
        "total_revenue": total,
        "top2_share_pct": round(top2 / total * 100, 1) if total else 0,
        "stores": [
            {
                "store_id": r[0],
                "store_name": r[1],
                "revenue": float(r[2]),
                "orders": int(r[3]),
                "aov": round(float(r[2]) / max(1, int(r[3])), 2),
            }
            for r in rows
        ],
    }


@router.get("/data-quality")
def data_quality(con: duckdb.DuckDBPyConnection = Depends(get_conn)):
    """Elementary test results summary — powers the /data-quality page."""
    schema_exists = con.execute("""
        select count(*) from information_schema.tables
        where table_schema = 'elementary' and table_name = 'elementary_test_results'
    """).fetchone()[0]
    if not schema_exists:
        return {"available": False}

    inv_row = con.execute(
        """
        select i.invocation_id, i.generated_at
        from elementary.dbt_invocations i
        where exists (
            select 1 from elementary.elementary_test_results r
            where r.invocation_id = i.invocation_id
        )
        order by i.generated_at desc
        limit 1
        """
    ).fetchone()
    if not inv_row:
        return {"available": False}
    latest_inv, last_run_ts = inv_row[0], inv_row[1]

    summary = con.execute(
        """
        select
            count(*) as total,
            sum(case when status = 'pass' then 1 else 0 end) as passed,
            sum(case when status = 'warn' then 1 else 0 end) as warned,
            sum(case when status = 'fail' or status = 'error' then 1 else 0 end) as failed
        from elementary.elementary_test_results
        where invocation_id = $inv
        """,
        {"inv": latest_inv},
    ).fetchone()
    total, passed, warned, failed = [int(x) for x in summary]

    table_rows = con.execute(
        """
        select
            table_name,
            count(*) as tests,
            sum(case when status = 'pass' then 1 else 0 end) as passed,
            sum(case when status = 'warn' then 1 else 0 end) as warned,
            sum(case when status = 'fail' or status = 'error' then 1 else 0 end) as failed
        from elementary.elementary_test_results
        where invocation_id = $inv
          and schema_name = 'analytics'
        group by table_name
        order by table_name
        """,
        {"inv": latest_inv},
    ).fetchall()

    tables = []
    for row in table_rows:
        tname, t_tests, t_pass, t_warn, t_fail = row
        t_tests, t_pass, t_warn, t_fail = int(t_tests), int(t_pass), int(t_warn), int(t_fail)
        if t_fail > 0:
            score, desc = "red", f"{t_fail} failing"
        elif t_warn > 0:
            s = "s" if t_warn > 1 else ""
            score, desc = "amber", f"{t_warn} warning{s}, {t_pass} passing"
        else:
            s = "s" if t_tests != 1 else ""
            score, desc = "green", f"{t_tests} test{s}, all passing"
        tables.append({
            "table": tname,
            "tests": t_tests,
            "passed": t_pass,
            "warned": t_warn,
            "failed": t_fail,
            "score": score,
            "description": desc,
        })

    failure_rows = con.execute(
        """
        select schema_name, table_name, column_name, test_short_name,
               test_results_description, status, detected_at
        from elementary.elementary_test_results
        where invocation_id = $inv
          and status <> 'pass'
        order by detected_at desc
        limit 20
        """,
        {"inv": latest_inv},
    ).fetchall()

    failures = [
        {
            "schema": r[0],
            "table": r[1],
            "column": r[2],
            "test": r[3],
            "description": r[4],
            "status": r[5],
            "detected_at": r[6].isoformat() if r[6] else None,
        }
        for r in failure_rows
    ]

    freshness_rows = con.execute(
        "select unique_id, status, max_loaded_at, max_loaded_at_time_ago_in_s from elementary.dbt_source_freshness_results order by unique_id"
    ).fetchall()

    freshness = [
        {
            "source": r[0].split(".")[-1] if r[0] else "",
            "status": r[1],
            "max_loaded_at": r[2],
            "lag_seconds": float(r[3]) if r[3] is not None else None,
        }
        for r in freshness_rows
    ]

    return {
        "available": True,
        "last_run": last_run_ts.isoformat() if hasattr(last_run_ts, "isoformat") else str(last_run_ts),
        "summary": {
            "total": total,
            "passed": passed,
            "warned": warned,
            "failed": failed,
            "pass_rate": round(passed / total * 100, 1) if total else 0.0,
        },
        "tables": tables,
        "failures": failures,
        "freshness": freshness,
    }


@router.get("/order-size")
def order_size(
    period: Annotated[str, Query(pattern="^(ytd|mtd|qtd|30d|90d)$")] = "ytd",
    stores: Annotated[str | None, Query()] = None,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    """Order value distribution as a histogram."""
    as_of = _as_of()
    start, end = _period_bounds(period, as_of)
    store_ids = [s.strip() for s in stores.split(",")] if stores else []

    if store_ids:
        store_join = "join analytics.dim_stores s on s.store_key = o.store_key and s.store_id = any($stores)"
        params = {"start": start, "end": end, "stores": store_ids}
    else:
        store_join = ""
        params = {"start": start, "end": end}

    rows = _query(con, f"""
        select
            case
                when order_total_usd <  10  then '0–10'
                when order_total_usd <  20  then '10–20'
                when order_total_usd <  30  then '20–30'
                when order_total_usd <  40  then '30–40'
                when order_total_usd <  60  then '40–60'
                when order_total_usd <  80  then '60–80'
                when order_total_usd < 120  then '80–120'
                else '120+'
            end  as bin,
            count(*) as cnt
        from analytics.fct_orders o
        {store_join}
        where o.ordered_date between $start and $end
        group by 1
    """, params).fetchall()

    aov_row = _query(con, f"""
        select avg(order_total_usd)
        from analytics.fct_orders o
        {store_join}
        where o.ordered_date between $start and $end
    """, params).fetchone()

    bin_order = ["0–10", "10–20", "20–30", "30–40", "40–60", "60–80", "80–120", "120+"]
    count_map = {r[0]: int(r[1]) for r in rows}

    return {
        "period": period,
        "aov": round(float(aov_row[0]), 2) if aov_row and aov_row[0] else 0,
        "bins": [
            {"bin": b, "label": f"${b}", "count": count_map.get(b, 0)}
            for b in bin_order
        ],
    }
