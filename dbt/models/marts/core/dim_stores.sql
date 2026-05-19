{{ config(materialized='table') }}

select
    {{ dbt_utils.generate_surrogate_key(['store_id']) }} as store_key,
    store_id,
    store_name,
    opened_at,
    opened_date,
    tax_rate
from {{ ref('stg_jaffle__stores') }}
