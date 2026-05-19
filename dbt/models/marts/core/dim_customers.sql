{{ config(materialized='table') }}

{# SCD-2 customer dimension. Pulls from snap_customers (sources rolling
   computed attributes from int_customers__lifetime_metrics) and exposes
   dbt-standard SCD-2 columns. #}

with snap as (
    select * from {{ ref('snap_customers') }}
),

final as (
    select
        {{ dbt_utils.generate_surrogate_key(['customer_id', 'dbt_valid_from']) }} as customer_key,
        customer_id,
        customer_name,
        customer_segment,
        is_active,
        lifetime_orders,
        lifetime_revenue_usd,
        first_order_date,
        last_order_date,
        dbt_valid_from   as valid_from,
        dbt_valid_to     as valid_to,
        case when dbt_valid_to is null then true else false end as is_current
    from snap
)

select * from final
