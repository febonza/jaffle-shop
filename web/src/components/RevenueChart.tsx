import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenuePoint } from "../api/types";
import { formatUsdCompact } from "../lib/format";

const INK = "#111111";
const COPPER = "#C8632C";
const RULE = "rgba(17,17,17,0.12)";
const PAPER = "#F5F1EA";

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="copperFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COPPER} stopOpacity={0.18} />
              <stop offset="100%" stopColor={COPPER} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={RULE} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={INK}
            tick={{ fontFamily: "JetBrains Mono", fontSize: 11, fill: INK }}
            tickLine={false}
            axisLine={{ stroke: INK }}
            minTickGap={48}
          />
          <YAxis
            stroke={INK}
            tick={{ fontFamily: "JetBrains Mono", fontSize: 11, fill: INK }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatUsdCompact(v as number)}
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: PAPER,
              border: `1px solid ${INK}`,
              borderRadius: 2,
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
            }}
            labelStyle={{ color: INK, fontWeight: 600 }}
            formatter={(v: number) => [formatUsdCompact(v), "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="gmv_usd"
            stroke={COPPER}
            strokeWidth={1.5}
            fill="url(#copperFade)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
