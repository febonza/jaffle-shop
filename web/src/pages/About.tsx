import { Link } from "react-router-dom";

const GITHUB = "https://github.com/febonza/jaffle-shop";
const LINKEDIN = "https://linkedin.com/in/felipebonzanini";

const ARCH_STEPS = [
  { n: "01", role: "Orchestrate", tool: "Dagster", logo: "/assets/logos/dagster.svg", desc: "Daily sensor lands raw CSVs into the lake. Asset-first orchestration, lineage out of the box." },
  { n: "02", role: "Store", tool: "DuckDB", logo: "/assets/logos/duckdb.svg", desc: "Single-file warehouse for staging + mart layers. Embedded, fast, free." },
  { n: "03", role: "Transform", tool: "dbt", logo: "/assets/logos/dbt.svg", desc: "Kimball star schema — dim_customer, dim_product, dim_store, fct_orders." },
  { n: "04", role: "Test", tool: "Elementary", logo: "/assets/logos/elementary.svg", desc: "Anomaly detection, freshness, schema drift. Results feed the data-quality page." },
  { n: "05", role: "Serve", tool: "FastAPI", logo: "/assets/logos/fastapi.svg", desc: "Thin read-only API on top of DuckDB marts. One endpoint per chart, cached for a minute." },
  { n: "06", role: "Render", tool: "React", logo: "/assets/logos/react.svg", desc: "This site. Recharts for the viz, Bonzanini Consulting design system for everything else." },
];

const INCLUDED = [
  ["Daily ingest", "of raw Jaffle Shop CSVs into a versioned lake."],
  ["Full dbt project", "— staging, intermediate, marts. ~40 models with refs and tests."],
  ["Kimball star schema", "covering orders, customers, products, stores."],
  ["Elementary checks", "— freshness, row-count anomaly, schema drift."],
  ["Read-only FastAPI", "with simple LRU caching."],
  ["This dashboard", "plus three planned deep-dive reports (LTV, churn, data quality)."],
];

const OUT_OF_SCOPE = [
  ["Auth", ", multi-tenancy, role-based access."],
  ["A real semantic layer", "(Cube, MetricFlow). Mart tables are the contract."],
  ["CI/CD", "beyond a GitHub action that runs dbt build on PR."],
  ["Streaming.", "Daily batch only."],
  ["Reverse-ETL", "or activation. Numbers stay in the warehouse."],
  ["ML / forecasting.", "Trend lines are descriptive only."],
];

export default function About() {
  return (
    <main className="about">
      {/* ============= MASTHEAD ============= */}
      <section className="about-masthead">
        <div>
          <div className="eyebrow-num">
            <span className="idx">01</span>
            <span>About this dashboard · 2026</span>
          </div>
          <h1>An end-to-end analytics rebuild, on synthetic data.</h1>
          <p className="lede">
            I took the Jaffle Shop dataset and ran it end-to-end — orchestration, warehouse,
            transformations, tests, an API, and a clean reporting front-end. The dashboard is
            the front-end. This page is the receipts.
          </p>
          <div className="cta-row">
            <Link className="btn-dark" to="/">
              Open the dashboard <span aria-hidden="true">→</span>
            </Link>
            <a className="btn-quiet" href={GITHUB} target="_blank" rel="noreferrer">
              View source on GitHub →
            </a>
          </div>
        </div>

        <dl className="fact-rail">
          <dt>Author</dt>
          <dd>Felipe Bonzanini</dd>
          <dt>Built</dt>
          <dd>Apr — May 2026</dd>
          <dt>Status</dt>
          <dd>
            <span className="live-dot" />
            Dashboard live
          </dd>
          <dt>Dataset</dt>
          <dd>Jaffle Shop · synthetic retail</dd>
          <dt>Volume</dt>
          <dd>
            <span className="mono">~1.2M orders · ~42K customers · 6 stores</span>
          </dd>
          <dt>Refresh</dt>
          <dd>
            <span className="mono">daily · 06:00 UTC</span>
          </dd>
          <dt>Version</dt>
          <dd>
            <span className="mono">v0.4.2 · May 20, 2026</span>
          </dd>
        </dl>
      </section>

      {/* ============= ARCHITECTURE STRIP ============= */}
      <div className="section-label">
        <div className="left">
          <span className="num">02</span>
          <h2>How the data gets from CSV to chart.</h2>
        </div>
        <div className="right">Six stages · one tool per job</div>
      </div>

      <div className="arch-strip">
        {ARCH_STEPS.map((step) => (
          <div className="arch-cell" key={step.n}>
            <span className="step-n">{step.n}</span>
            <span className="step-role">{step.role}</span>
            <div className="logo-box">
              <img src={step.logo} alt={step.tool} />
            </div>
            <p className="step-desc">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* ============= LOWER TRIPTYCH ============= */}
      <div className="about-grid">
        <div className="col">
          <h3>
            What's included <span className="count">/ 6</span>
          </h3>
          <ul>
            {INCLUDED.map(([bold, rest]) => (
              <li key={bold}>
                <span className="marker">+</span>
                <span>
                  <b>{bold}</b> {rest}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col">
          <h3>
            Out of scope <span className="count">/ 6</span>
          </h3>
          <ul>
            {OUT_OF_SCOPE.map(([bold, rest]) => (
              <li className="out" key={bold}>
                <span className="marker">−</span>
                <span>
                  <b>{bold}</b> {rest}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col author-col">
          <h3>About me</h3>
          <div className="name">Felipe Bonzanini</div>
          <p>
            Fractional analytics leader. Eight years deep in Looker — the rest in dbt,
            warehouse engineering, and dragging retail data teams out of dashboards no one
            trusts.
          </p>
          <p>
            If your Looker is slowing your team down, or your stack is held together by one
            tired analyst, I fix that.
          </p>
          <div className="contact">
            <div className="row">
              <span className="label">Email</span>
              <a href="mailto:felipe@bonzanini.consulting">felipe@bonzanini.consulting</a>
            </div>
            <div className="row">
              <span className="label">LinkedIn</span>
              <a href={LINKEDIN} target="_blank" rel="noreferrer">
                linkedin.com/in/felipebonzanini
              </a>
            </div>
            <div className="row">
              <span className="label">Source</span>
              <a href={GITHUB} target="_blank" rel="noreferrer">
                github.com/febonza/jaffle-shop
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============= BOTTOM CTA ============= */}
      <div className="about-footer-cta">
        <div className="left">
          <span className="small">The point of all this</span>
          <span className="big">
            Open the dashboard and see whether the numbers tell a coherent story.
          </span>
        </div>
        <Link className="btn-accent" to="/">
          Open the dashboard <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
