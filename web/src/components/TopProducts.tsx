import { useState } from "react";
import { useApi } from "../hooks/useApi";
import type { ProductsResponse } from "../api/types";
import { formatUsdCompact } from "../lib/format";
import type { Period } from "../api/types";

const ACCENT = "#C8632C";
const INK = "#111111";

export default function TopProducts({ period, stores }: { period: Period; stores: string[] }) {
  const [sortBy, setSortBy] = useState<"rev" | "units">("rev");
  const storesParam = stores.length && !stores.includes("all") ? `&stores=${stores.join(",")}` : "";
  const { data, isLoading } = useApi<ProductsResponse>(
    `/api/app/products?period=${period}&sort_by=${sortBy}&limit=10${storesParam}`
  );

  if (isLoading || !data) {
    return (
      <div className="chart-card">
        <div className="chart-head">
          <div className="title-block">
            <div className="eyebrow"><span className="idx">03</span><span>Best sellers</span></div>
            <h3>Top products</h3>
          </div>
        </div>
        <div className="chart-body" style={{ minHeight: 200 }} />
      </div>
    );
  }

  const max = data.products.length ? data.products[0][sortBy === "rev" ? "revenue" : "units"] : 1;

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">03</span><span>Best sellers</span></div>
          <h3>Top products</h3>
        </div>
        <div className="toggles">
          <button aria-pressed={sortBy === "rev"} onClick={() => setSortBy("rev")}>Revenue</button>
          <button aria-pressed={sortBy === "units"} onClick={() => setSortBy("units")}>Units</button>
        </div>
      </div>
      <div className="chart-body" style={{ paddingTop: 8 }}>
        <div className="toplist">
          <div className="row hdr">
            <span />
            <span>Product</span>
            <span style={{ justifyContent: "flex-end" }}>{sortBy === "rev" ? "Revenue" : "Units"}</span>
            <span />
          </div>
          {data.products.map((p, i) => {
            const val = sortBy === "rev" ? p.revenue : p.units;
            const pct = (val / max) * 100;
            return (
              <div className="row" key={p.name}>
                <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                <span className="name">
                  <span>{p.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", marginLeft: 8 }}>
                    {p.category}
                  </span>
                </span>
                <span className="val">
                  {sortBy === "rev" ? formatUsdCompact(p.revenue) : p.units.toLocaleString()}
                </span>
                <span className="bar-cell">
                  <span className="bar" style={{ width: `${pct}%`, background: i === 0 ? ACCENT : INK }} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
