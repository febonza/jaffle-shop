import { Link } from "react-router-dom";

export default function Churn() {
  return (
    <div className="stub-page">
      <div className="stub-card">
        <div className="badge">Placeholder · WIP</div>
        <div className="eyebrow-num">
          <span className="idx">04</span>
          <span>Customer churn</span>
        </div>
        <h1>Churn</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 19, color: "var(--ink-2)", marginBottom: 22 }}>
          Who is walking away — and what they did before they did.
        </p>
        <p>
          Stubbed. I have the lapsed-customer logic running in dbt, but the front-end needs to do
          real work here: pre-churn behavior, win-back lists, not just one funnel chart.
          It'll get the time it deserves.
        </p>
        <ul className="checklist">
          <li className="done">Define churn as 90-day inactivity at the customer grain.</li>
          <li className="done">fct_customer_status_daily — daily snapshot of active/lapsed/churned.</li>
          <li>Pre-churn behavior heatmap (90 days before lapse).</li>
          <li>Win-back candidate list, sortable by historic AOV.</li>
          <li>Channel-level churn rate trend, MoM.</li>
          <li>Causal-ish: what changed about a customer in the 30 days before they left.</li>
        </ul>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
            Target: mid July 2026
          </span>
          <Link className="btn btn-ghost btn-sm" to="/app">Back to dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
