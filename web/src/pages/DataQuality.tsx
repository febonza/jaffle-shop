import Eyebrow from "../components/Eyebrow";

export default function DataQuality() {
  return (
    <>
      <section className="section">
        <Eyebrow number="06">Data quality</Eyebrow>
        <h1>Tests, freshness, and lineage.</h1>
        <p className="lede" style={{ maxWidth: 640, marginTop: 16 }}>
          The full Elementary report below runs after every dbt build. Failures
          surface here before they reach the dashboard. If the iframe is blank,
          run the Dagster <code>elementary_report</code> asset.
        </p>
      </section>
      <section className="section" style={{ padding: 0, border: "none" }}>
        <iframe
          src="/elementary/index.html"
          title="Elementary report"
          style={{
            width: "100%",
            height: "calc(100vh - 64px)",
            border: "1px solid var(--border-strong)",
            background: "var(--paper)",
          }}
        />
      </section>
    </>
  );
}
