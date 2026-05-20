import { Link } from "react-router-dom";

export default function Ltv() {
  return (
    <div className="stub-page">
      <div className="stub-card">
        <div className="badge">Placeholder · WIP</div>
        <div className="eyebrow-num">
          <span className="idx">03</span>
          <span>Lifetime value</span>
        </div>
        <h1>LTV</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 19, color: "var(--ink-2)", marginBottom: 22 }}>
          Customer lifetime value, by cohort and segment.
        </p>
        <p>
          Stubbed out. The dashboard's pumping live data, but this view is still on the bench.
          I want to ship it with proper P50/P90 curves, not a half-baked single line.
        </p>
        <ul className="checklist">
          <li className="done">Define LTV at the contribution-margin grain, not revenue.</li>
          <li className="done">Build cohort customer-revenue table in dbt (fct_customer_revenue_cohort).</li>
          <li>Render P50 / P90 / P99 curves, monthly granularity, 24 months out.</li>
          <li>Payback-window callouts by acquisition channel.</li>
          <li>Segment toggle: new vs. returning vs. VIP.</li>
          <li>Export-to-CSV from each chart.</li>
        </ul>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
            Target: late June 2026
          </span>
          <Link className="btn btn-ghost btn-sm" to="/">Back to dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
