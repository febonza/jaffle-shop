{# Standard dbt-Labs schema override: use the custom schema name verbatim
   (no prefix with the target schema). This lets us route models to
   staging/intermediate/analytics by their +schema config. #}
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- set default_schema = target.schema -%}
    {%- if custom_schema_name is none -%}
        {{ default_schema }}
    {%- else -%}
        {{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}
