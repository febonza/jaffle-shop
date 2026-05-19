import type { StoreRow } from "../api/types";
import { formatInt, formatUsd } from "../lib/format";

export default function StoresGrid({ rows }: { rows: StoreRow[] }) {
  return (
    <table className="ruled-table">
      <thead>
        <tr>
          <th>Store</th>
          <th className="num" style={{ textAlign: "right" }}>
            Orders (90d)
          </th>
          <th className="num" style={{ textAlign: "right" }}>
            Revenue (90d)
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.store_id}>
            <td>{r.store_name}</td>
            <td className="num">{formatInt(r.orders)}</td>
            <td className="num">{formatUsd(r.revenue_usd)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
