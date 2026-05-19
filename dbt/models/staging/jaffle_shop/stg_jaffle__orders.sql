with source as (
    select * from {{ source('raw', 'raw_orders') }}
),

renamed as (
    select
        id::varchar                              as order_id,
        customer::varchar                        as customer_id,
        store_id::varchar                        as store_id,
        cast(ordered_at as timestamp)            as ordered_at,
        cast(ordered_at as date)                 as ordered_date,
        subtotal::decimal(12, 2) / 100.0         as subtotal_usd,
        tax_paid::decimal(12, 2) / 100.0         as tax_usd,
        order_total::decimal(12, 2) / 100.0      as order_total_usd
    from source
    where ordered_at is not null
)

select * from renamed
