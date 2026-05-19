{# SCD-2 snapshot of product attributes. Source data is stable, but if list
   prices or product types change in jafgen (or in any replacement source),
   the change is versioned here. #}

{% snapshot snap_products %}

{{
    config(
      target_schema='snapshots',
      unique_key='product_sku',
      strategy='check',
      check_cols=['product_name', 'product_type', 'list_price_usd']
    )
}}

select
    product_sku,
    product_name,
    product_type,
    list_price_usd
from {{ ref('stg_jaffle__products') }}

{% endsnapshot %}
