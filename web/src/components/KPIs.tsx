import { useApi } from "../hooks/useApi";
import type { KpisResponse } from "../api/types";
import { formatKpiValue, pctDelta, formatDelta } from "../lib/format";
import type { Period } from "../api/types";

const ACCENT = "var(--accent)";
const INK = "var(--ink)";
const PAPER_3 = "var(--paper-3)";

function Sparkline({ data, accent = false }: { data: number[]; accent?: boolean }) {
  const w = 92, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - 2 - ((v - min) / span) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lineColor = accent ? ACCENT : INK;
  const fillColor = accent ? "var(--accent-soft)" : PAPER_3;
  const areaPath = `M${pts[0]} L${pts.join(" L")} L${w - 1},${h - 1} L1,${h - 1} Z`;
  const linePath = `M${pts[0]} L${pts.join(" L")}`;
  const lastPt = pts[pts.length - 1].split(",");
  return (
    <svg width={w} height={h} className="spark" aria-hidden="true">
      <path d={areaPath} fill={fillColor} opacity="0.6" />
      <path d={linePath} stroke={lineColor} strokeWidth="1.25" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="2" fill={lineColor} />
    </svg>
  );
}

export default function KPIs({ period, stores }: { period: Period; stores: string[] }) {
  const storesParam = stores.length && !stores.includes("all")
    ? `&stores=${stores.join(",")}`
    : "";
  const { data, isLoading, error } = useApi<KpisResponse>(
    `/api/app/kpis?period=${period}${storesParam}`
  );

  if (isLoading) {
    return (
      <div className="kpis">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="kpi" key={i}>
            <div className="lab" style={{ height: 11, background: "var(--paper-3)", borderRadius: 2, width: 80 }} />
            <div className="val" style={{ height: 38, background: "var(--paper-3)", borderRadius: 2, marginTop: 8, width: 120 }} />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className="kpis">
      {data.kpis.map((k) => {
        const v = formatKpiValue(k.value, k.format);
        const d = pctDelta(k.value, k.prev_value);
        const pos = d >= 0;
        return (
          <div className="kpi" key={k.key}>
            <div className="lab">{k.label}{k.unit ? ` · ${k.unit}` : ""}</div>
            <div className="val">
              {v.whole}
              {v.unit && <span className="unit">{v.unit}</span>}
            </div>
            <div className={`delta ${pos ? "pos" : "neg"}`}>
              <span className="pct">{formatDelta(d)}</span>
              <span className="vs">vs. last year</span>
            </div>
            {k.spark && <Sparkline data={k.spark} accent={k.key === "rev"} />}
          </div>
        );
      })}
    </div>
  );
}
