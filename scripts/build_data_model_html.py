"""Render docs/data-model.html from dbt's manifest.json.

Produces a brand-styled, standalone HTML page that visualizes the star schema:
  * Mermaid erDiagram of fct/dim relationships
  * Collapsible per-table panels with full column doc blocks
  * Imports the project's design tokens so it matches the rest of the site

Run AFTER `dbt build` (or `dbt parse` at minimum), which writes manifest.json.

    uv run python scripts/build_data_model_html.py
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST = REPO_ROOT / "dbt" / "target" / "manifest.json"
OUTPUT = REPO_ROOT / "docs" / "data-model.html"

# Hardcoded ERD relationships. Manifest-driven inference is brittle for the
# star schema; this list is the source of truth for the diagram.
RELATIONSHIPS: list[tuple[str, str, str, str]] = [
    # (left, right, cardinality, label)
    ("fct_orders", "dim_customers", "}o--||", "ordered by"),
    ("fct_orders", "dim_stores", "}o--||", "placed at"),
    ("fct_orders", "dim_dates", "}o--||", "on"),
    ("fct_order_items", "fct_orders", "}o--||", "belongs to"),
    ("fct_order_items", "dim_products", "}o--||", "for"),
    ("fct_order_items", "dim_customers", "}o--||", "by"),
    ("fct_order_items", "dim_stores", "}o--||", "at"),
    ("fct_order_items", "dim_dates", "}o--||", "on"),
]

TARGET_MODELS = {
    "fct_orders",
    "fct_order_items",
    "dim_customers",
    "dim_products",
    "dim_stores",
    "dim_dates",
    "mart_daily_revenue",
}


def load_manifest() -> dict:
    if not MANIFEST.exists():
        raise FileNotFoundError(
            f"manifest.json not found at {MANIFEST}. Run `dbt build` first."
        )
    return json.loads(MANIFEST.read_text())


def gather_models(manifest: dict) -> dict[str, dict]:
    """Return {model_name: node_dict} for our target marts."""
    out: dict[str, dict] = {}
    for _node_id, node in manifest.get("nodes", {}).items():
        if node.get("resource_type") != "model":
            continue
        if node.get("name") in TARGET_MODELS:
            out[node["name"]] = node
    return out


def render_mermaid_erd(models: dict[str, dict]) -> str:
    lines = ["erDiagram"]
    # Tables with their columns (Mermaid syntax)
    for name, node in models.items():
        cols = node.get("columns", {})
        if not cols:
            lines.append(f"    {name} {{")
            lines.append("        none none")
            lines.append("    }")
            continue
        lines.append(f"    {name} {{")
        for col_name, _col in list(cols.items())[:8]:
            # Mermaid tolerates simple identifiers only.
            safe = re.sub(r"[^A-Za-z0-9_]", "_", col_name)
            lines.append(f"        column {safe}")
        if len(cols) > 8:
            lines.append(f"        column _and_{len(cols) - 8}_more")
        lines.append("    }")
    # Relationships
    for left, right, card, label in RELATIONSHIPS:
        if left in models and right in models:
            lines.append(f'    {left} {card} {right} : "{label}"')
    return "\n".join(lines)


def render_column_row(col_name: str, col: dict) -> str:
    desc = (col.get("description") or "").strip()
    tests = col.get("data_tests") or col.get("tests") or []
    test_names = []
    for t in tests:
        if isinstance(t, str):
            test_names.append(t)
        elif isinstance(t, dict):
            test_names.extend(t.keys())
    test_html = (
        f'<span class="col-tests">{", ".join(html.escape(t) for t in test_names)}</span>'
        if test_names
        else ""
    )
    desc_html = (
        f'<div class="col-desc">{html.escape(desc).replace(chr(10), "<br>")}</div>'
        if desc
        else '<div class="col-desc muted">No description.</div>'
    )
    return f"""
    <details class="col">
      <summary>
        <code>{html.escape(col_name)}</code>
        {test_html}
      </summary>
      {desc_html}
    </details>
    """


def render_table_panel(name: str, node: dict) -> str:
    desc = (node.get("description") or "").strip()
    cols = node.get("columns", {})
    schema = node.get("schema", "")
    cols_html = "".join(render_column_row(n, c) for n, c in cols.items())
    desc_html = html.escape(desc).replace("\n", "<br>") if desc else "No description."
    return f"""
    <article class="table-panel" id="{html.escape(name)}">
      <header>
        <div class="eyebrow">{html.escape(schema)}</div>
        <h2><code>{html.escape(name)}</code></h2>
        <p class="lede">{desc_html}</p>
      </header>
      <div class="cols">
        {cols_html}
      </div>
    </article>
    """


HTML_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Jaffle Shop — Data model</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="../design/colors_and_type.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    body {{ padding: 0; }}
    .container {{ max-width: 1200px; margin: 0 auto; padding: var(--s-9) var(--s-7); }}
    h1.display {{ margin-bottom: var(--s-5); }}
    .erd {{
      border: 1px solid var(--border-strong);
      padding: var(--s-7);
      margin: var(--s-7) 0;
      background: var(--paper-2);
      overflow-x: auto;
    }}
    .erd svg {{ display: block; margin: 0 auto; }}
    .table-panel {{
      border-top: 1px solid var(--border-strong);
      padding: var(--s-7) 0;
    }}
    .table-panel header h2 {{ margin: var(--s-3) 0; }}
    .table-panel header h2 code {{ font-size: var(--fs-h3); }}
    .table-panel .lede {{ max-width: 720px; }}
    .cols {{ margin-top: var(--s-6); }}
    details.col {{
      border-bottom: 1px solid var(--rule-soft);
      padding: var(--s-3) 0;
    }}
    details.col summary {{
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--s-4);
      list-style: none;
    }}
    details.col summary::-webkit-details-marker {{ display: none; }}
    details.col summary code {{
      font-size: var(--fs-body);
      color: var(--fg);
    }}
    .col-tests {{
      font-size: var(--fs-xs);
      color: var(--fg-muted);
      font-family: var(--font-mono);
    }}
    .col-desc {{
      padding: var(--s-4) 0 var(--s-3);
      color: var(--fg-2);
      max-width: 760px;
      line-height: 1.55;
    }}
    .toc {{
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-3);
      margin: var(--s-5) 0;
    }}
    .toc a {{
      font-size: var(--fs-xs);
      padding: var(--s-2) var(--s-3);
      border: 1px solid var(--border-strong);
      text-decoration: none;
      font-family: var(--font-mono);
    }}
  </style>
</head>
<body>
  <main class="container">
    <div class="eyebrow">Data model</div>
    <h1 class="display">Jaffle Shop — Kimball star.</h1>
    <p class="lede" style="max-width: 720px;">
      The marts layer is a classic dimensional model. Two facts (orders, order items) joined to four
      dimensions (customers, products, stores, dates). Click any column for the doc block.
    </p>

    <div class="toc">
      {toc_links}
    </div>

    <section class="erd">
      <pre class="mermaid">{mermaid_src}</pre>
    </section>

    {table_panels}
  </main>

  <script>
    mermaid.initialize({{
      startOnLoad: true,
      theme: 'base',
      themeVariables: {{
        primaryColor: '#F5F1EA',
        primaryTextColor: '#111111',
        primaryBorderColor: '#111111',
        lineColor: '#111111',
        fontFamily: 'JetBrains Mono, monospace',
      }},
    }});
  </script>
</body>
</html>
"""


def main() -> None:
    manifest = load_manifest()
    models = gather_models(manifest)
    if not models:
        raise RuntimeError(
            "No target marts found in manifest. Did you run `dbt build`? "
            f"Looked for: {sorted(TARGET_MODELS)}"
        )

    mermaid_src = render_mermaid_erd(models)
    table_panels = "\n".join(
        render_table_panel(name, models[name]) for name in sorted(models)
    )
    toc_links = "\n".join(
        f'<a href="#{html.escape(name)}"><code>{html.escape(name)}</code></a>'
        for name in sorted(models)
    )

    out = HTML_TEMPLATE.format(
        mermaid_src=mermaid_src,
        table_panels=table_panels,
        toc_links=toc_links,
    )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(out)
    print(f"Wrote {OUTPUT.relative_to(REPO_ROOT)} ({len(out):,} bytes, {len(models)} tables)")


if __name__ == "__main__":
    main()
