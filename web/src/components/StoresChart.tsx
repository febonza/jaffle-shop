import { useApi } from "../hooks/useApi";
import type { StoresResponse } from "../api/types";
import { formatUsdCompact } from "../lib/format";
import type { Period } from "../api/types";

const ACCENT = "#C8632C";
const INK = "#111111";

export default function StoresChart({ period }: { period: Period }) {
  const { data, isLoading } = useApi<StoresResponse>(`/api/app/stores?period=${period}`);

  if (isLoading || !data) {
    return (
      <div className="chart-card">
        <div className="chart-head">
          <div className="title-block">
            <div className="eyebrow"><span className="idx">04</span><span>Location performance</span></div>
            <h3>Revenue by store</h3>
          </div>
        </div>
        <div className="chart-body" style={{ minHeight: 200 }} />
      </div>
    );
  }

  const max = data.stores.length ? data.stores[0].revenue : 1;

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">04</span><span>Location performance</span></div>
          <h3>Revenue by store</h3>
        </div>
        <div className="meta">
          <span className="big">{data.stores.length} stores</span>
          {data.stores.length >= 2 && (
            <span>Top 2 = {data.top2_share_pct.toFixed(0)}% of revenue</span>
          )}
        </div>
      </div>
      <div className="chart-body">
        <div className="stores">
          {data.stores.map((s, i) => (
            <div className="store" key={s.store_id}>
              <span className="rank">{String(i + 1).padStart(2, "0")}</span>
              <span className="name">
                {s.store_name}
                <small>{s.orders.toLocaleString()} orders · AOV ${s.aov.toFixed(2)}</small>
              </span>
              <span className="bar-cell">
                <span className="bar" style={{
                  width: `${(s.revenue / max) * 100}%`,
                  background: i === 0 ? ACCENT : INK,
                }} />
              </span>
              <span className="val">{formatUsdCompact(s.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
