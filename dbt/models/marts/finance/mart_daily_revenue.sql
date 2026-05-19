{{ config(materialized='table') }}

{# Daily revenue rollup powering the Overview revenue-over-time chart. #}

with orders as (
    select * from {{ ref('fct_orders') }}
),

by_day as (
    select
        ordered_date,
        count(*)                                       as orders,
        sum(order_total_usd)                           as gmv_usd,
        sum(subtotal_usd)                              as subtotal_usd,
        sum(tax_usd)                                   as tax_usd,
        count(distinct customer_key)                   as unique_customers
    from orders
    group by 1
),

with_calendar as (
    select
        d.date_day                  as ordered_date,
        coalesce(b.orders, 0)       as orders,
        coalesce(b.gmv_usd, 0)      as gmv_usd,
        coalesce(b.subtotal_usd, 0) as subtotal_usd,
        coalesce(b.tax_usd, 0)      as tax_usd,
        coalesce(b.unique_customers, 0) as unique_customers
    from {{ ref('dim_dates') }} d
    left join by_day b on b.ordered_date = d.date_day
    where d.date_day between (select min(ordered_date) from by_day)
                         and (select max(ordered_date) from by_day)
)

select * from with_calendar
