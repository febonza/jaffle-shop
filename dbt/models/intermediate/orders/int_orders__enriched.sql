with orders as (
    select * from {{ ref('stg_jaffle__orders') }}
),

items as (
    select
        order_id,
        count(*) as item_count
    from {{ ref('stg_jaffle__order_items') }}
    group by 1
),

joined as (
    select
        o.order_id,
        o.customer_id,
        o.store_id,
        o.ordered_at,
        o.ordered_date,
        o.subtotal_usd,
        o.tax_usd,
        o.order_total_usd,
        coalesce(i.item_count, 0) as item_count
    from orders o
    left join items i using (order_id)
)

select * from joined
