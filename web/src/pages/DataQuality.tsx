import { Link } from "react-router-dom";

export default function DataQuality() {
  return (
    <div className="stub-page">
      <div className="stub-card">
        <div className="badge">Placeholder · WIP</div>
        <div className="eyebrow-num">
          <span className="idx">05</span>
          <span>Data quality</span>
        </div>
        <h1>Data quality</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 19, color: "var(--ink-2)", marginBottom: 22 }}>
          A live read of what's broken in the pipeline, right now.
        </p>
        <p>
          Stubbed. The Elementary tests are running on every dbt build — I just haven't built the
          mirror UI yet. The plan is to surface freshness, anomaly checks, and schema-drift alerts
          in one place so the dashboard's numbers earn trust.
        </p>
        <ul className="checklist">
          <li className="done">Elementary integrated, anomaly tests pass on all fact tables.</li>
          <li className="done">dbt source freshness checks running daily.</li>
          <li>Pull Elementary run results into a history table.</li>
          <li>Render freshness + row-count status per source, hourly buckets.</li>
          <li>Schema-drift alerts on column add/drop.</li>
          <li>Single trust score per fact table — green/amber/red, plain English.</li>
        </ul>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
            Target: end June 2026
          </span>
          <Link className="btn btn-ghost btn-sm" to="/">Back to dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
