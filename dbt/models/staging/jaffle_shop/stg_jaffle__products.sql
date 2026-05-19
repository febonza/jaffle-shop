with source as (
    select * from {{ source('raw', 'raw_products') }}
),

renamed as (
    select
        sku::varchar                       as product_sku,
        nullif(trim(name), '')             as product_name,
        nullif(trim(type), '')             as product_type,
        price::decimal(12, 2) / 100.0      as list_price_usd,
        description                        as description
    from source
)

select * from renamed
