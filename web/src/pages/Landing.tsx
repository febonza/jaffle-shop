import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      {/* ============= HERO ============= */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="eyebrow-num">
              <span className="idx">01</span>
              <span>Portfolio · 2026</span>
            </div>
            <h1 className="display">
              An end-to-end<br />analytics rebuild,<br />on synthetic data.
            </h1>
            <p className="lede">
              I took the Jaffle Shop dataset and ran it end-to-end: orchestration,
              warehouse, transformations, tests, an API, and a clean reporting front-end.
              This site is the front-end. Open the dashboard, or read the notes below.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" to="/app">Open the dashboard →</Link>
              <a className="btn btn-ghost" href="#architecture">How it was built</a>
            </div>
          </div>
          <aside className="hero-side">
            <dl>
              <dt>Author</dt><dd>Felipe Bonzanini</dd>
              <dt>Built</dt><dd>Apr — May 2026</dd>
              <dt>Status</dt><dd><span style={{ color: "var(--signal-pos)" }}>●</span> Dashboard live</dd>
              <dt>Dataset</dt><dd>Jaffle Shop · synthetic</dd>
              <dt>Stack</dt><dd>Dagster · DuckDB · dbt · FastAPI · React</dd>
              <dt>Source</dt>
              <dd>
                <a href="https://github.com/febonza/jaffle-shop" target="_blank" rel="noreferrer">
                  github.com/febonza/jaffle-shop
                </a>
              </dd>
            </dl>
          </aside>
        </div>
      </section>

      {/* ============= ABOUT ============= */}
      <section className="section" id="about">
        <div className="section-head">
          <div>
            <div className="eyebrow-num"><span className="idx">02</span><span>About the project</span></div>
            <h2>What this is, and why it exists.</h2>
          </div>
          <div className="lede">
            <p>
              Most analytics portfolios are a notebook with a bar chart. I wanted something
              closer to what I actually build for clients — a real pipeline, real tests,
              a real semantic layer, and a reporting surface someone could hand to a CFO.
            </p>
            <p>
              Jaffle Shop is the canonical fake dataset in the dbt ecosystem: orders, customers,
              and payments for a fictional sandwich chain. It's small enough to keep the focus
              on the system, not the data — which is the point.
            </p>
          </div>
        </div>

        <ul className="dataset-facts">
          <li><span className="k">Dataset</span><span className="v">Jaffle Shop — synthetic retail data, public</span></li>
          <li>
            <span className="k">Volume</span>
            <span className="v">
              <span className="accent">~1.7M</span> orders · <span className="accent">~3K</span> customers · <span className="accent">6</span> stores · 5 years of history
            </span>
          </li>
          <li><span className="k">Grain</span><span className="v">Daily order-line at source, modeled into a Kimball star</span></li>
          <li><span className="k">Refresh</span><span className="v">Daily at 05:00 UTC via Dagster sensor</span></li>
          <li><span className="k">Numbers</span><span className="v">Synthetic data. Don't use these for a board meeting.</span></li>
        </ul>
      </section>

      {/* ============= ARCHITECTURE (dark) ============= */}
      <section className="section dark" id="architecture">
        <div className="inner">
          <div className="section-head">
            <div>
              <div className="eyebrow-num"><span className="idx">03</span><span>Architecture</span></div>
              <h2>How the data gets from CSV to chart.</h2>
            </div>
            <div className="lede">
              <p>
                Six stages, each owned by one tool that's good at one thing.
                Nothing exotic — this is the same shape I deploy for retail clients,
                shrunk to fit a personal project.
              </p>
            </div>
          </div>

          <div className="arch-flow">
            {[
              { n: "01", role: "Orchestrate", tool: "Dagster", desc: "Daily sensor lands raw CSVs into the lake. Asset-first orchestration, lineage out of the box.", arrow: true, logo: "/assets/logos/dagster-cropped.svg" },
              { n: "02", role: "Store", tool: "DuckDB", desc: "Single-file warehouse for the staging + mart layers. Embedded, fast, free.", arrow: true, logo: "/assets/logos/duckdb-cropped.svg" },
              { n: "03", role: "Transform", tool: "dbt", desc: "Kimball star schema — dim_customer, dim_product, dim_store, fct_orders.", arrow: true, logo: "/assets/logos/dbt.svg" },
              { n: "04", role: "Test", tool: "Elementary", desc: "Anomaly detection + freshness + schema tests. Results feed the /data-quality page.", arrow: true, logo: "/assets/logos/elementary-cropped.svg" },
              { n: "05", role: "Serve", tool: "FastAPI", desc: "Thin read-only API on top of DuckDB marts. One endpoint per chart, cached for a minute.", arrow: true, logo: "/assets/logos/fastapi-cropped.svg" },
              { n: "06", role: "Render", tool: "React", desc: "This site. Recharts for the viz, Bonzanini Consulting design system for everything else.", arrow: false, logo: "/assets/logos/react-cropped.svg" },
            ].map((step) => (
              <div className="arch-step" key={step.n}>
                {step.arrow && <div className="step-arrow">→</div>}
                <span className="step-n">{step.n}</span>
                <span className="step-role">{step.role}</span>
                {step.logo
                  ? <img className="step-logo" src={step.logo} alt={step.tool} />
                  : <h3 className="step-tool">{step.tool}</h3>
                }
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= SCOPE ============= */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow-num"><span className="idx">04</span><span>Scope</span></div>
            <h2>What's in, and what isn't.</h2>
          </div>
          <div className="lede">
            <p>
              A portfolio piece, not a production system. I made deliberate cuts where
              the next 80% of the work wouldn't have taught me anything new. Those are
              listed on the right — and they're honest.
            </p>
          </div>
        </div>

        <div className="scope">
          <div>
            <h3>In scope</h3>
            <ul>
              {[
                "Daily ingest of raw Jaffle Shop CSVs into a versioned lake.",
                "Full dbt project — staging, intermediate, marts — with refs and tests.",
                "Kimball star schema covering orders, customers, products, stores.",
                "Elementary checks: freshness, row-count anomaly, schema drift.",
                "Read-only FastAPI with simple LRU caching.",
                "This dashboard plus three deep-dive reports.",
              ].map((item) => (
                <li key={item}><span className="marker">+</span><span>{item}</span></li>
              ))}
            </ul>
          </div>
          <div className="out">
            <h3>Out of scope</h3>
            <ul>
              {[
                "Authentication, multi-tenancy, role-based access.",
                "A real semantic layer (Cube, MetricFlow). Mart tables are the contract.",
                "CI/CD beyond a github action that runs dbt build on PR.",
                "Real-time / streaming. Daily batch only.",
                "Reverse-ETL or activation. Numbers stay in the warehouse.",
                "ML / forecasting. Trend lines are descriptive only.",
              ].map((item) => (
                <li key={item}><span className="marker">−</span><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============= STACK ============= */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow-num"><span className="idx">05</span><span>Tech stack</span></div>
            <h2>What's under the hood.</h2>
          </div>
          <div className="lede">
            <p>
              Boring, on purpose. Every choice here is something I'd be comfortable
              defending at a Tuesday architecture review.
            </p>
          </div>
        </div>

        <div className="stack">
          {[
            { group: "Orchestration", items: [["Dagster", "asset-based, daily sensor"], ["uv", "python env + lock"]] },
            { group: "Warehouse", items: [["DuckDB 1.0", "embedded analytics db"], ["Parquet", "raw + staging files"]] },
            { group: "Modeling", items: [["dbt-core 1.8", "~40 models, Kimball star"], ["SQLFluff", "lint on PR"], ["Elementary", "data tests + observability"]] },
            { group: "Backend", items: [["FastAPI", "read-only mart API"], ["Pydantic v2", "contracts + validation"]] },
            { group: "Frontend", items: [["React 18", "TanStack Router + SWR"], ["Recharts", "data viz"], ["Vite", "build · GitHub Pages"]] },
          ].map((g) => (
            <div className="stack-group" key={g.group}>
              <h4>{g.group}</h4>
              <ul>
                {g.items.map(([name, detail]) => (
                  <li key={name}>{name}<small>{detail}</small></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============= REPORTS ============= */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow-num"><span className="idx">06</span><span>The reports</span></div>
            <h2>Four surfaces, one warehouse.</h2>
          </div>
          <div className="lede">
            <p>
              The dashboard is the front door. The other three reports zoom in
              on the questions a retail operator actually asks about a customer
              base: who comes back, who walks away, can I trust the numbers.
            </p>
          </div>
        </div>

        <div className="reports">
          <Link className="report-card" to="/app">
            <div className="meta">
              <span className="badge live">Live</span>
              <span>/app · YTD overview</span>
            </div>
            <h3>Dashboard</h3>
            <p>YTD metrics, cumulative race vs. prior year, product mix, store performance, order distribution.</p>
            <span className="report-arrow">Open report →</span>
          </Link>

          <Link className="report-card" to="/ltv">
            <div className="meta">
              <span className="badge wip">Planned</span>
              <span>/ltv · Lifetime value</span>
            </div>
            <h3>LTV</h3>
            <p>Cohort-based contribution margin curves. P50 / P90. Payback windows by channel and segment.</p>
            <span className="report-arrow">Open report →</span>
          </Link>

          <Link className="report-card" to="/churn">
            <div className="meta">
              <span className="badge wip">Planned</span>
              <span>/churn · Customer churn</span>
            </div>
            <h3>Churn</h3>
            <p>Lapsed-customer detection on rolling windows. Pre-churn behavior signals, win-back candidate lists.</p>
            <span className="report-arrow">Open report →</span>
          </Link>

          <Link className="report-card" to="/data-quality">
            <div className="meta">
              <span className="badge wip">Planned</span>
              <span>/data-quality · Pipeline health</span>
            </div>
            <h3>Data quality</h3>
            <p>Live mirror of the Elementary report — freshness, schema drift, anomaly alerts on every fact table.</p>
            <span className="report-arrow">Open report →</span>
          </Link>
        </div>
      </section>

      {/* ============= AUTHOR + CHANGELOG ============= */}
      <section className="section">
        <div className="author-row">
          <div className="author">
            <div className="eyebrow-num"><span className="idx">07</span><span>About me</span></div>
            <h2 style={{
              fontFamily: "var(--font-serif)", fontSize: 42, fontWeight: 400,
              letterSpacing: "-0.02em", lineHeight: 1.0, margin: "16px 0 24px",
              color: "var(--ink)", maxWidth: "18ch",
            }}>
              Felipe Bonzanini.
            </h2>
            <p>
              Fractional analytics leader. Eight years deep in Looker — the rest in dbt,
              warehouse engineering, and dragging retail data teams out of dashboards
              that no one trusts. This project is the closest I get to a public résumé.
            </p>
            <p>
              If you have a Looker instance that's slowing your team down — or a stack
              that's mostly held together by one tired analyst — I fix that.
            </p>
            <div className="author-meta">
              <a href="mailto:felipe@bonzanini.consulting">felipe@bonzanini.consulting</a>
              <span style={{ color: "var(--ink-4)" }}>·</span>
              <a href="https://linkedin.com/in/felipebonzanini" target="_blank" rel="noreferrer">LinkedIn</a>
              <span style={{ color: "var(--ink-4)" }}>·</span>
              <a href="https://github.com/febonza" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>

          <div>
            <div className="eyebrow-num" style={{ marginBottom: 18 }}><span className="idx">08</span><span>Changelog</span></div>
            <div className="changelog">
              {[
                { date: "May 20, 2026", ver: "v0.5.0", note: "Responsive layout across all pages. Tech stack logos in the architecture section." },
                { date: "May 20, 2026", ver: "v0.4.2", note: "Dashboard goes live — five KPIs, hero race, four deep-dive charts." },
                { date: "May 12, 2026", ver: "v0.4.0", note: "FastAPI ships. React app wired to live mart endpoints." },
                { date: "May 03, 2026", ver: "v0.3.0", note: "Elementary integrated, anomaly tests pass on all fact tables." },
                { date: "Apr 24, 2026", ver: "v0.2.0", note: "dbt project complete — 40 models, full lineage, Kimball star." },
                { date: "Apr 12, 2026", ver: "v0.1.0", note: "Dagster repo bootstrapped, raw CSVs landing in DuckDB nightly." },
              ].map((entry) => (
                <div className="entry" key={entry.ver}>
                  <span className="date">{entry.date}</span>
                  <span className="ver">{entry.ver}</span>
                  <span className="note">{entry.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
