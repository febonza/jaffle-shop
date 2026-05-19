with source as (
    select * from {{ source('raw', 'raw_items') }}
),

renamed as (
    select
        id::varchar         as order_item_id,
        order_id::varchar   as order_id,
        sku::varchar        as product_sku
    from source
)

select * from renamed
