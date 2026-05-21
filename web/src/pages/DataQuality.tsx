import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";

interface DQSummary {
  total: number;
  passed: number;
  warned: number;
  failed: number;
  pass_rate: number;
}

interface DQTable {
  table: string;
  tests: number;
  passed: number;
  warned: number;
  failed: number;
  score: "green" | "amber" | "red";
  description: string;
}

interface DQFailure {
  schema: string;
  table: string;
  column: string | null;
  test: string;
  description: string | null;
  status: string;
  detected_at: string | null;
}

interface DQFreshness {
  source: string;
  status: string;
  max_loaded_at: string | null;
  lag_seconds: number | null;
}

interface DataQualityResponse {
  available: boolean;
  last_run?: string;
  summary?: DQSummary;
  tables?: DQTable[];
  failures?: DQFailure[];
  freshness?: DQFreshness[];
}

function ScoreDot({ score }: { score: "green" | "amber" | "red" }) {
  const color =
    score === "green"
      ? "var(--signal-pos)"
      : score === "amber"
      ? "var(--accent)"
      : "var(--signal-neg)";
  return (
    <span
      className="dq-dot"
      style={{ background: color }}
      aria-label={score}
    />
  );
}

function formatLastRun(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatLag(seconds: number): string {
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

export default function DataQuality() {
  const { data, isLoading, error } = useApi<DataQualityResponse>(
    "/api/app/data-quality"
  );

  const header = (
    <header className="dash-head">
      <div>
        <div className="eyebrow-num">
          <span className="idx">05</span>
          <span>Data quality</span>
        </div>
        <h1>What is broken right now?</h1>
        <div className="sub">
          Elementary test results, refreshed every dbt build.
        </div>
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <main className="dash">
        {header}
        <p className="dq-loading">Loading...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="dash">
        {header}
        <p className="dq-loading" style={{ color: "var(--signal-neg)" }}>
          Failed to load data quality status.
        </p>
      </main>
    );
  }

  if (!data.available) {
    return (
      <main className="dash">
        {header}
        <div className="chart-card" style={{ maxWidth: 600 }}>
          <div className="chart-body">
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink-2)", margin: 0 }}>
              Elementary tests have not been materialized in this database yet.
              Run{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                dbt build
              </code>{" "}
              to populate the elementary schema, then re-trigger the Dagster
              pipeline.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { summary, tables = [], failures = [], freshness = [] } = data;
  const unhealthy = summary!.failed + summary!.warned;

  return (
    <main className="dash">
      <header className="dash-head">
        <div>
          <div className="eyebrow-num">
            <span className="idx">05</span>
            <span>Data quality</span>
          </div>
          <h1>What is broken right now?</h1>
          <div className="sub">
            Elementary test results, refreshed every dbt build.
          </div>
        </div>
        <div className="right">
          <span>Pass rate</span>
          <span className="big">{summary!.pass_rate}%</span>
          {data.last_run && (
            <span>Last run {formatLastRun(data.last_run)}</span>
          )}
        </div>
      </header>

      {/* Summary strip */}
      <div className="kpis dq-summary-strip">
        <div className="kpi">
          <div className="lab">Tests run</div>
          <div className="val">{summary!.total}</div>
        </div>
        <div className="kpi">
          <div className="lab">Passing</div>
          <div className="val dq-val-pos">{summary!.passed}</div>
        </div>
        <div className="kpi">
          <div className="lab">Failing / warned</div>
          <div
            className="val"
            style={{
              color:
                summary!.failed > 0
                  ? "var(--signal-neg)"
                  : summary!.warned > 0
                  ? "var(--accent)"
                  : "var(--ink-3)",
            }}
          >
            {unhealthy}
          </div>
        </div>
      </div>

      {/* Trust grid — analytics layer */}
      {tables.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 32 }}>
          <div className="chart-head">
            <div className="title-block">
              <div className="eyebrow">
                <span className="idx">—</span> Analytics layer
              </div>
              <h3>Table trust scores</h3>
            </div>
          </div>
          <div className="dq-trust-grid">
            {tables.map((t) => (
              <div key={t.table} className={`dq-trust-card dq-trust-${t.score}`}>
                <div className="dq-trust-header">
                  <ScoreDot score={t.score} />
                  <span className="dq-trust-name">{t.table}</span>
                </div>
                <div className="dq-trust-desc">{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failures */}
      <div className="chart-card" style={{ marginBottom: 32 }}>
        <div className="chart-head">
          <div className="title-block">
            <div className="eyebrow">
              <span className="idx">—</span> Latest run
            </div>
            <h3>Test failures</h3>
          </div>
          {failures.length > 0 && (
            <div className="meta">
              <span className="big" style={{ color: "var(--signal-neg)" }}>
                {failures.length}
              </span>
              <span>issues</span>
            </div>
          )}
        </div>
        <div className="chart-body">
          {failures.length === 0 ? (
            <p className="dq-empty">
              <ScoreDot score="green" />
              No failures in the latest run.
            </p>
          ) : (
            <div className="dq-failure-list">
              {failures.map((f, i) => (
                <div key={i} className="dq-failure-row">
                  <div className="dq-failure-meta">
                    <ScoreDot score={f.status === "warn" ? "amber" : "red"} />
                    <span className="dq-failure-loc">
                      {f.schema}.{f.table}
                      {f.column ? `.${f.column}` : ""}
                    </span>
                    <span className="dq-failure-test">{f.test}</span>
                  </div>
                  {f.description && (
                    <div className="dq-failure-desc">{f.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Source freshness */}
      <div className="chart-card" style={{ marginBottom: 40 }}>
        <div className="chart-head">
          <div className="title-block">
            <div className="eyebrow">
              <span className="idx">—</span> Sources
            </div>
            <h3>Source freshness</h3>
          </div>
        </div>
        <div className="chart-body">
          {freshness.length === 0 ? (
            <p className="dq-empty" style={{ color: "var(--ink-3)" }}>
              Source freshness checks are not configured. Add{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                freshness:
              </code>{" "}
              blocks to staging sources.yml to enable per-source lag tracking.
            </p>
          ) : (
            <div className="dq-freshness-table">
              <div className="dq-freshness-hdr">
                <span>Source</span>
                <span>Last loaded</span>
                <span>Lag</span>
                <span>Status</span>
              </div>
              {freshness.map((f) => (
                <div key={f.source} className="dq-freshness-row">
                  <span className="dq-freshness-source">{f.source}</span>
                  <span>{f.max_loaded_at ?? "—"}</span>
                  <span>{f.lag_seconds != null ? formatLag(f.lag_seconds) : "—"}</span>
                  <span className="dq-freshness-status">
                    <ScoreDot
                      score={
                        f.status === "pass"
                          ? "green"
                          : f.status === "warn"
                          ? "amber"
                          : "red"
                      }
                    />
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="dq-footer">
        <a
          href="/elementary/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
        >
          View full Elementary report
        </a>
        <Link className="btn btn-ghost btn-sm" to="/">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
