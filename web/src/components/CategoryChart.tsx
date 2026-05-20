import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { useApi } from "../hooks/useApi";
import type { CategoriesResponse } from "../api/types";
import { formatUsdCompact } from "../lib/format";
import type { Period } from "../api/types";

const ACCENT = "#C8632C";
const INK = "#111111";
const INK_3 = "#55534E";
const RULE_SOFT = "rgba(17,17,17,0.10)";

export default function CategoryChart({ period, stores }: { period: Period; stores: string[] }) {
  const storesParam = stores.length && !stores.includes("all") ? `&stores=${stores.join(",")}` : "";
  const { data, isLoading } = useApi<CategoriesResponse>(`/api/app/categories?period=${period}${storesParam}`);

  if (isLoading || !data) {
    return (
      <div className="chart-card">
        <div className="chart-head">
          <div className="title-block">
            <div className="eyebrow"><span className="idx">02</span><span>Product mix</span></div>
            <h3>Revenue by category</h3>
          </div>
        </div>
        <div className="chart-body" style={{ height: 260 }} />
      </div>
    );
  }

  const sorted = [...data.categories].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">02</span><span>Product mix</span></div>
          <h3>Revenue by category</h3>
        </div>
        <div className="meta">
          <span className="big">{formatUsdCompact(data.total_revenue)}</span>
          <span>{period.toUpperCase()} across {sorted.length} categories</span>
        </div>
      </div>
      <div className="chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={RULE_SOFT} vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: INK }} interval={0} tick={{ fill: INK_3, fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={formatUsdCompact} width={50} tick={{ fill: INK_3, fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgba(17,17,17,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as CategoriesResponse["categories"][0];
                return (
                  <div className="rt-tip">
                    <div className="rt-label">{d.name}</div>
                    <div className="rt-row"><span className="rt-key">Revenue</span><span className="rt-val">{formatUsdCompact(d.revenue)}</span></div>
                    <div className="rt-row"><span className="rt-key">% of total</span><span className="rt-val">{d.share_pct.toFixed(1)}%</span></div>
                    {d.yoy_pct != null && (
                      <div className="rt-row">
                        <span className="rt-key">YoY</span>
                        <span className={`rt-delta ${d.yoy_pct >= 0 ? "pos" : "neg"}`}>
                          {d.yoy_pct >= 0 ? "+" : ""}{d.yoy_pct.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="revenue" radius={[2, 2, 0, 0]} maxBarSize={48} isAnimationActive={false}>
              {sorted.map((c, i) => (
                <Cell key={c.name} fill={i === 0 ? ACCENT : INK} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
