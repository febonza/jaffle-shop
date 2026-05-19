{{
  config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='delete+insert',
    on_schema_change='sync_all_columns'
  )
}}

with orders as (
    select * from {{ ref('int_orders__enriched') }}

    {% if is_incremental() %}
        where ordered_at >= (select coalesce(max(ordered_at), '1900-01-01') from {{ this }})
    {% endif %}
),

customers as (
    select customer_key, customer_id
    from {{ ref('dim_customers') }}
    where is_current
),

products as (
    select product_key, product_sku
    from {{ ref('dim_products') }}
    where is_current
),

stores as (
    select store_key, store_id
    from {{ ref('dim_stores') }}
),

final as (
    select
        o.order_id,
        o.ordered_at,
        o.ordered_date,
        cast(strftime(o.ordered_date, '%Y%m%d') as integer) as date_key,
        c.customer_key,
        s.store_key,
        o.subtotal_usd,
        o.tax_usd,
        o.order_total_usd,
        o.item_count
    from orders o
    left join customers c on c.customer_id = o.customer_id
    left join stores s on s.store_id = o.store_id
)

select * from final
