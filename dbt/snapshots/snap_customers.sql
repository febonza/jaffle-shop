{# SCD-2 snapshot of the customer's computed attributes. The source data is
   stable, but `customer_segment` and `is_active` are computed from rolling
   order behaviour — so as more orders land, customers move between segments
   and this snapshot captures those transitions. #}

{% snapshot snap_customers %}

{{
    config(
      target_schema='snapshots',
      unique_key='customer_id',
      strategy='check',
      check_cols=['customer_segment', 'is_active', 'customer_name']
    )
}}

select
    customer_id,
    customer_name,
    customer_segment,
    is_active,
    lifetime_orders,
    lifetime_revenue_usd,
    first_order_date,
    last_order_date
from {{ ref('int_customers__lifetime_metrics') }}

{% endsnapshot %}
