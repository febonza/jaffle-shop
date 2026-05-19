with source as (
    select * from {{ source('raw', 'raw_stores') }}
),

renamed as (
    select
        id::varchar                          as store_id,
        nullif(trim(name), '')               as store_name,
        cast(opened_at as timestamp)         as opened_at,
        cast(opened_at as date)              as opened_date,
        tax_rate::decimal(5, 4)              as tax_rate
    from source
)

select * from renamed
