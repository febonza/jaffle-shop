import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { useApi } from "../hooks/useApi";
import type { OrderSizeResponse } from "../api/types";
import { formatCompact } from "../lib/format";
import type { Period } from "../api/types";

const ACCENT = "#C8632C";
const INK = "#111111";
const INK_3 = "#55534E";
const RULE_SOFT = "rgba(17,17,17,0.10)";

function binForAov(aov: number): string {
  if (aov < 10) return "0–10";
  if (aov < 20) return "10–20";
  if (aov < 30) return "20–30";
  if (aov < 40) return "30–40";
  if (aov < 60) return "40–60";
  if (aov < 80) return "60–80";
  if (aov < 120) return "80–120";
  return "120+";
}

export default function OrderSizeChart({ period, stores }: { period: Period; stores: string[] }) {
  const storesParam = stores.length && !stores.includes("all") ? `&stores=${stores.join(",")}` : "";
  const { data, isLoading } = useApi<OrderSizeResponse>(`/api/app/order-size?period=${period}${storesParam}`);

  if (isLoading || !data) {
    return (
      <div className="chart-card">
        <div className="chart-head">
          <div className="title-block">
            <div className="eyebrow"><span className="idx">05</span><span>Order distribution</span></div>
            <h3>Order size distribution</h3>
          </div>
        </div>
        <div className="chart-body" style={{ height: 240 }} />
      </div>
    );
  }

  const total = data.bins.reduce((s, b) => s + b.count, 0);
  const aovBin = binForAov(data.aov);

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">05</span><span>Order distribution</span></div>
          <h3>Order size distribution</h3>
        </div>
        <div className="meta">
          <span className="big">${data.aov.toFixed(2)}</span>
          <span>Avg order value</span>
        </div>
      </div>
      <div className="chart-body" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.bins} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={RULE_SOFT} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: INK }} tick={{ fill: INK_3, fontSize: 10 }} interval={0} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={formatCompact} width={40} tick={{ fill: INK_3, fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgba(17,17,17,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as OrderSizeResponse["bins"][0];
                return (
                  <div className="rt-tip">
                    <div className="rt-label">Order size · {d.label}</div>
                    <div className="rt-row"><span className="rt-key">Orders</span><span className="rt-val">{d.count.toLocaleString()}</span></div>
                    <div className="rt-row"><span className="rt-key">Share</span><span className="rt-val">{total ? ((d.count / total) * 100).toFixed(1) : 0}%</span></div>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={40} isAnimationActive={false}>
              {data.bins.map((b) => (
                <Cell key={b.bin} fill={b.bin === aovBin ? ACCENT : INK} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
