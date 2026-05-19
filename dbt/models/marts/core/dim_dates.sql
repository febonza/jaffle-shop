{{ config(materialized='view') }}

{# Thin view over the dim_date seed so downstream models reference a
   model (queryable via ref()) rather than a seed directly. #}

select * from {{ ref('dim_date') }}
