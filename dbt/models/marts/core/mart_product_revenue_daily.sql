{{ config(materialized='table') }}

{# Daily product revenue at the date × store × product grain.
   Supports the category chart and top-products chart on /app. #}

with items as (
    select * from {{ ref('fct_order_items') }}
),

products as (
    select product_key, product_name, product_type
    from {{ ref('dim_products') }}
    where is_current
),

stores as (
    select store_key, store_id, store_name
    from {{ ref('dim_stores') }}
),

by_day_store_product as (
    select
        i.ordered_date,
        i.store_key,
        i.product_key,
        count(*)                    as units,
        sum(i.gross_revenue_usd)    as gross_revenue_usd,
        sum(i.cogs_usd)             as cogs_usd,
        sum(i.margin_usd)           as margin_usd
    from items i
    group by 1, 2, 3
)

select
    b.ordered_date,
    s.store_id,
    s.store_name,
    b.store_key,
    p.product_name,
    p.product_type,
    b.product_key,
    b.units,
    b.gross_revenue_usd,
    b.cogs_usd,
    b.margin_usd
from by_day_store_product b
join products p on p.product_key = b.product_key
join stores s on s.store_key = b.store_key
