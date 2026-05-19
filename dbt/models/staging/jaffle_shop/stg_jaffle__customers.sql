with source as (
    select * from {{ source('raw', 'raw_customers') }}
),

renamed as (
    select
        id::varchar              as customer_id,
        nullif(trim(name), '')   as customer_name
    from source
)

select * from renamed
