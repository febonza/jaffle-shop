import { useState, useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceDot,
} from "recharts";
import { useApi } from "../hooks/useApi";
import type { RevenueRaceResponse } from "../api/types";
import { formatUsdCompact } from "../lib/format";
import type { Period } from "../api/types";

const ACCENT = "#C8632C";
const INK_3 = "#55534E";
const INK = "#111111";
const RULE_SOFT = "rgba(17,17,17,0.10)";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function RTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rt-tip">
      <div className="rt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="rt-row">
          <span className="rt-key">
            <span className="swatch" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="rt-val">{p.value == null ? "—" : formatUsdCompact(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function HeroChart({ period, stores }: { period: Period; stores: string[] }) {
  const storesParam = stores.length && !stores.includes("all")
    ? `&stores=${stores.join(",")}`
    : "";
  const { data, isLoading } = useApi<RevenueRaceResponse>(
    `/api/app/revenue-race?period=${period}${storesParam}`
  );
  const [mode, setMode] = useState<"cumul" | "weekly">("cumul");

  const chartData = useMemo(() => {
    if (!data) return [];
    let lastMonth = -1;
    return data.weeks.map((w) => {
      const monthIdx = Math.min(11, Math.floor((w.week - 1) / (52 / 12)));
      const showLabel = monthIdx !== lastMonth;
      if (showLabel) lastMonth = monthIdx;
      return {
        week: w.week,
        label: showLabel ? MONTH_LABELS[monthIdx] : "",
        curr: mode === "cumul" ? w.curr_cumul : w.curr_weekly,
        prev: mode === "cumul" ? w.prev_cumul : w.prev_weekly,
      };
    });
  }, [data, mode]);

  if (isLoading || !data) {
    return (
      <section className="hero-chart">
        <div className="chart-head">
          <div className="title-block">
            <div className="eyebrow"><span className="idx">01</span><span>Revenue performance</span></div>
            <h3>Cumulative revenue, this year vs. last</h3>
          </div>
        </div>
        <div className="chart-body" style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)" }}>Loading.</span>
        </div>
      </section>
    );
  }

  const { curr_ytd, prev_same_point, prev_full_year } = data.summary;
  const lift = prev_same_point ? ((curr_ytd - prev_same_point) / prev_same_point) * 100 : 0;
  const lastCurrWeek = data.weeks.filter((w) => w.curr_cumul != null).slice(-1)[0];

  return (
    <section className="hero-chart">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">01</span><span>Revenue performance</span></div>
          <h3>Cumulative revenue, this year vs. last</h3>
        </div>
        <div className="meta" style={{ textAlign: "right" }}>
          <span className="big">{formatUsdCompact(curr_ytd)}</span>
          <span style={{ color: lift >= 0 ? "var(--signal-pos)" : "var(--signal-neg)" }}>
            {lift >= 0 ? "+" : ""}{lift.toFixed(1)}% vs. same point last year
          </span>
          <div style={{ marginTop: 8 }}>
            <div className="toggles">
              <button aria-pressed={mode === "cumul"} onClick={() => setMode("cumul")}>Cumulative</button>
              <button aria-pressed={mode === "weekly"} onClick={() => setMode("weekly")}>Weekly</button>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-body" style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="currFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.18" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={RULE_SOFT} vertical={false} />
            <XAxis
              dataKey="label" tickLine={false} axisLine={{ stroke: INK }}
              interval={0} tick={{ fill: INK_3, fontSize: 11 }}
            />
            <YAxis
              tickLine={false} axisLine={false}
              tickFormatter={formatUsdCompact} width={60}
              tick={{ fill: INK_3, fontSize: 11 }}
            />
            <Tooltip content={<RTip />} cursor={{ stroke: INK, strokeDasharray: "2 3", strokeWidth: 1 }} />
            <Area
              type="monotone" dataKey="prev" name="Last year"
              stroke={INK_3} strokeWidth={1.25} strokeDasharray="3 3"
              fill="none" dot={false} isAnimationActive={false}
            />
            <Area
              type="monotone" dataKey="curr" name="This year"
              stroke={ACCENT} strokeWidth={2}
              fill="url(#currFill)" dot={false} isAnimationActive={false}
            />
            {mode === "cumul" && lastCurrWeek && (
              <ReferenceDot
                x={chartData[lastCurrWeek.week - 1]?.label || ""}
                y={lastCurrWeek.curr_cumul ?? 0}
                r={4} fill={ACCENT} stroke={INK} strokeWidth={1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        padding: "10px 22px 16px", borderTop: "1px solid var(--rule-soft)",
        display: "flex", gap: 24, fontFamily: "var(--font-mono)", fontSize: 11, color: INK_3,
      }}>
        <span>
          <span style={{ display: "inline-block", width: 12, height: 2, background: ACCENT, verticalAlign: "middle", marginRight: 6 }} />
          This year
        </span>
        <span>
          <span style={{ display: "inline-block", width: 14, height: 0, borderTop: `1px dashed ${INK_3}`, verticalAlign: "middle", marginRight: 6 }} />
          Last year same-day
        </span>
        <span style={{ marginLeft: "auto" }}>
          Last year closed at <strong style={{ color: INK }}>{formatUsdCompact(prev_full_year)}</strong>
        </span>
      </div>
    </section>
  );
}
