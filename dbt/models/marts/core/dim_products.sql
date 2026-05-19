{{ config(materialized='table') }}

with snap as (
    select * from {{ ref('snap_products') }}
),

cost as (
    select
        product_sku,
        sum(supply_cost_usd) as unit_cost_usd
    from {{ ref('stg_jaffle__supplies') }}
    group by 1
),

final as (
    select
        {{ dbt_utils.generate_surrogate_key(['s.product_sku', 's.dbt_valid_from']) }} as product_key,
        s.product_sku,
        s.product_name,
        s.product_type,
        s.list_price_usd,
        c.unit_cost_usd,
        case
            when c.unit_cost_usd is null or s.list_price_usd = 0 then null
            else round((s.list_price_usd - c.unit_cost_usd) / s.list_price_usd, 4)
        end as gross_margin_pct,
        s.dbt_valid_from   as valid_from,
        s.dbt_valid_to     as valid_to,
        case when s.dbt_valid_to is null then true else false end as is_current
    from snap s
    left join cost c on c.product_sku = s.product_sku
)

select * from final
