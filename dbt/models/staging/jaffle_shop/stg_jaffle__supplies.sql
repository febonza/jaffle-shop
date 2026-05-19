with source as (
    select * from {{ source('raw', 'raw_supplies') }}
),

renamed as (
    select
        id::varchar                        as supply_id,
        sku::varchar                       as product_sku,
        nullif(trim(name), '')             as supply_name,
        cost::decimal(12, 2) / 100.0       as supply_cost_usd,
        cast(perishable as boolean)        as is_perishable
    from source
)

select * from renamed
