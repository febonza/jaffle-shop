{{ config(materialized='table') }}

{# Daily revenue rolled up by store. Supports the /app dashboard endpoints
   that need to filter by date range and store. #}

with orders as (
    select * from {{ ref('fct_orders') }}
),

by_day_store as (
    select
        ordered_date,
        store_key,
        count(*)                        as orders,
        sum(order_total_usd)            as gmv_usd,
        sum(subtotal_usd)               as subtotal_usd,
        sum(tax_usd)                    as tax_usd,
        sum(item_count)                 as item_count,
        count(distinct customer_key)    as unique_customers
    from orders
    group by 1, 2
)

select
    b.ordered_date,
    s.store_id,
    s.store_name,
    b.store_key,
    b.orders,
    b.gmv_usd,
    b.subtotal_usd,
    b.tax_usd,
    b.item_count,
    b.unique_customers
from by_day_store b
join {{ ref('dim_stores') }} s on s.store_key = b.store_key
