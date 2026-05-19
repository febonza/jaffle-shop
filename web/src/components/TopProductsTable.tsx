import type { TopProduct } from "../api/types";
import { formatInt, formatUsd } from "../lib/format";

export default function TopProductsTable({ rows }: { rows: TopProduct[] }) {
  return (
    <table className="ruled-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Product</th>
          <th>Type</th>
          <th className="num" style={{ textAlign: "right" }}>
            Units
          </th>
          <th className="num" style={{ textAlign: "right" }}>
            Revenue
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={r.product_sku}>
            <td className="num">{String(idx + 1).padStart(2, "0")}</td>
            <td>{r.product_name}</td>
            <td className="muted">{r.product_type}</td>
            <td className="num">{formatInt(r.units)}</td>
            <td className="num">{formatUsd(r.revenue_usd)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
