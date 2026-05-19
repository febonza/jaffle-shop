{# Aggregates per-customer behaviour from the full order history.
   Used directly by snap_customers (which captures changes in customer_segment)
   and by dim_customers downstream. #}

with customers as (
    select * from {{ ref('stg_jaffle__customers') }}
),

orders as (
    select * from {{ ref('int_orders__enriched') }}
),

per_customer as (
    select
        customer_id,
        min(ordered_at)                    as first_order_at,
        max(ordered_at)                    as last_order_at,
        cast(min(ordered_at) as date)      as first_order_date,
        cast(max(ordered_at) as date)      as last_order_date,
        count(*)                           as lifetime_orders,
        sum(order_total_usd)               as lifetime_revenue_usd,
        avg(order_total_usd)               as avg_order_value_usd
    from orders
    group by 1
),

joined as (
    select
        c.customer_id,
        c.customer_name,
        pc.first_order_at,
        pc.last_order_at,
        pc.first_order_date,
        pc.last_order_date,
        coalesce(pc.lifetime_orders, 0)               as lifetime_orders,
        coalesce(pc.lifetime_revenue_usd, 0)::decimal(12, 2) as lifetime_revenue_usd,
        pc.avg_order_value_usd
    from customers c
    left join per_customer pc using (customer_id)
)

select
    *,
    case
        when lifetime_orders = 0 then 'inactive'
        when lifetime_orders >= 20 or lifetime_revenue_usd >= 500 then 'vip'
        when lifetime_orders >= 5 then 'returning'
        else 'new'
    end as customer_segment,
    case
        when lifetime_orders = 0 then false
        when last_order_at >= current_timestamp - interval 90 day then true
        else false
    end as is_active
from joined
