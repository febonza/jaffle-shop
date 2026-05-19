{% macro create_schemas_if_not_exists(schemas) %}
  {% if execute %}
    {% for schema in schemas %}
      {% set sql %}
        create schema if not exists {{ schema }}
      {% endset %}
      {% do run_query(sql) %}
    {% endfor %}
  {% endif %}
{% endmacro %}
