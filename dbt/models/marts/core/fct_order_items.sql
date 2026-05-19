{{
  config(
    materialized='incremental',
    unique_key='order_item_id',
    incremental_strategy='delete+insert',
    on_schema_change='sync_all_columns'
  )
}}

with items as (
    select * from {{ ref('stg_jaffle__order_items') }}
),

orders as (
    select * from {{ ref('int_orders__enriched') }}

    {% if is_incremental() %}
        where ordered_at >= (select coalesce(max(ordered_at), '1900-01-01') from {{ this }})
    {% endif %}
),

products as (
    select product_key, product_sku, list_price_usd, unit_cost_usd
    from {{ ref('dim_products') }}
    where is_current
),

customers as (
    select customer_key, customer_id
    from {{ ref('dim_customers') }}
    where is_current
),

stores as (
    select store_key, store_id
    from {{ ref('dim_stores') }}
),

final as (
    select
        i.order_item_id,
        i.order_id,
        o.ordered_at,
        o.ordered_date,
        cast(strftime(o.ordered_date, '%Y%m%d') as integer) as date_key,
        p.product_key,
        c.customer_key,
        s.store_key,
        1                                          as quantity,
        p.list_price_usd                           as gross_revenue_usd,
        coalesce(p.unit_cost_usd, 0)               as cogs_usd,
        p.list_price_usd - coalesce(p.unit_cost_usd, 0) as margin_usd
    from items i
    inner join orders o on o.order_id = i.order_id
    left join products p on p.product_sku = i.product_sku
    left join customers c on c.customer_id = o.customer_id
    left join stores s on s.store_id = o.store_id
)

select * from final
