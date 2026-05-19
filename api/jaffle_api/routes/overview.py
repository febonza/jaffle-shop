"""Overview-page endpoints. Thin SQL wrappers over `analytics.*` marts."""

from __future__ import annotations

from typing import Annotated

import duckdb
from fastapi import APIRouter, Depends, Query

from jaffle_api.deps import get_conn

router = APIRouter(prefix="/overview", tags=["overview"])


@router.get("/kpis")
def kpis(
    window: Annotated[int, Query(ge=1, le=3650, description="Lookback window in days")] = 90,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    """Headline KPIs for the window ending at the latest order date in the warehouse."""
    sql = """
        with bounds as (
            select max(ordered_date) as max_date from analytics.fct_orders
        ),
        windowed as (
            select o.*
            from analytics.fct_orders o, bounds b
            where o.ordered_date > b.max_date - $window::integer
        ),
        new_customers as (
            select count(*) as n
            from analytics.dim_customers c, bounds b
            where c.is_current
              and c.first_order_date > b.max_date - $window::integer
        )
        select
            (select coalesce(sum(order_total_usd), 0) from windowed) as gmv,
            (select count(*) from windowed) as orders,
            (select n from new_customers) as new_customers,
            (select coalesce(avg(order_total_usd), 0) from windowed) as aov,
            (select max_date from bounds) as as_of_date
    """
    row = con.execute(sql, {"window": window}).fetchone()
    return {
        "window_days": window,
        "as_of_date": str(row[4]) if row[4] else None,
        "gmv_usd": float(row[0]),
        "orders": int(row[1]),
        "new_customers": int(row[2]),
        "aov_usd": float(row[3]),
    }


@router.get("/revenue-series")
def revenue_series(
    window: Annotated[int, Query(ge=7, le=3650)] = 365,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    sql = """
        with bounds as (select max(ordered_date) as max_date from analytics.fct_orders)
        select
            ordered_date::varchar as date,
            gmv_usd,
            orders
        from analytics.mart_daily_revenue m, bounds b
        where m.ordered_date > b.max_date - $window::integer
          and m.ordered_date <= b.max_date
        order by m.ordered_date
    """
    rows = con.execute(sql, {"window": window}).fetchall()
    return [
        {"date": r[0], "gmv_usd": float(r[1]), "orders": int(r[2])}
        for r in rows
    ]


@router.get("/top-products")
def top_products(
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    window: Annotated[int, Query(ge=1, le=3650)] = 90,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    sql = """
        with bounds as (select max(ordered_date) as max_date from analytics.fct_orders),
        items as (
            select
                i.product_key,
                sum(i.gross_revenue_usd) as revenue,
                count(*) as units
            from analytics.fct_order_items i, bounds b
            where i.ordered_date > b.max_date - $window::integer
            group by 1
        )
        select
            p.product_sku,
            p.product_name,
            p.product_type,
            i.revenue,
            i.units
        from items i
        join analytics.dim_products p on p.product_key = i.product_key
        order by i.revenue desc
        limit $limit::integer
    """
    rows = con.execute(sql, {"window": window, "limit": limit}).fetchall()
    return [
        {
            "product_sku": r[0],
            "product_name": r[1],
            "product_type": r[2],
            "revenue_usd": float(r[3]),
            "units": int(r[4]),
        }
        for r in rows
    ]


@router.get("/stores")
def stores(
    window: Annotated[int, Query(ge=1, le=3650)] = 90,
    con: duckdb.DuckDBPyConnection = Depends(get_conn),
):
    sql = """
        with bounds as (select max(ordered_date) as max_date from analytics.fct_orders)
        select
            s.store_id,
            s.store_name,
            coalesce(sum(o.order_total_usd), 0) as revenue,
            count(o.order_id) as orders
        from analytics.dim_stores s
        left join analytics.fct_orders o
            on o.store_key = s.store_key
            and o.ordered_date > (select max_date from bounds) - $window::integer
        group by 1, 2
        order by revenue desc
    """
    rows = con.execute(sql, {"window": window}).fetchall()
    return [
        {
            "store_id": r[0],
            "store_name": r[1],
            "revenue_usd": float(r[2]),
            "orders": int(r[3]),
        }
        for r in rows
    ]
