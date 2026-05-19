import Eyebrow from "../components/Eyebrow";
import RevenueChart from "../components/RevenueChart";
import StatGrid from "../components/StatGrid";
import StoresGrid from "../components/StoresGrid";
import TopProductsTable from "../components/TopProductsTable";
import { useApi } from "../hooks/useApi";
import type { Kpis, RevenuePoint, StoreRow, TopProduct } from "../api/types";
import { formatInt, formatUsd, formatUsdCompact } from "../lib/format";

export default function Overview() {
  const kpis = useApi<Kpis>("/api/overview/kpis?window=90");
  const series = useApi<RevenuePoint[]>("/api/overview/revenue-series?window=365");
  const products = useApi<TopProduct[]>("/api/overview/top-products?window=90&limit=10");
  const stores = useApi<StoreRow[]>("/api/overview/stores?window=90");

  return (
    <>
      <section className="section">
        <Eyebrow number="01">Overview</Eyebrow>
        <h1 className="display">The metrics that matter, refreshed daily.</h1>
        <p className="lede" style={{ maxWidth: 640, marginTop: 16 }}>
          Synthetic Jaffle Shop data, modeled with dbt, orchestrated by Dagster, tested with
          Elementary, and served from DuckDB through a thin FastAPI. Numbers below cover the
          trailing 90 days as of the latest order.
        </p>
      </section>

      <section className="section">
        <Eyebrow number="02">Headline KPIs</Eyebrow>
        {kpis.isLoading ? (
          <p className="muted">Loading.</p>
        ) : kpis.error ? (
          <p className="muted">Could not load KPIs — is the API running?</p>
        ) : kpis.data ? (
          <StatGrid
            stats={[
              {
                label: "GMV (90d)",
                value: formatUsdCompact(kpis.data.gmv_usd),
              },
              {
                label: "Orders (90d)",
                value: formatInt(kpis.data.orders),
              },
              {
                label: "New customers (90d)",
                value: formatInt(kpis.data.new_customers),
              },
              {
                label: "Avg order value",
                value: formatUsd(kpis.data.aov_usd, true),
                sublabel: kpis.data.as_of_date ? `as of ${kpis.data.as_of_date}` : undefined,
              },
            ]}
          />
        ) : null}
      </section>

      <section className="section">
        <div className="section-title-row">
          <div>
            <Eyebrow number="03">Revenue trend</Eyebrow>
            <h2>Last 12 months, daily.</h2>
          </div>
        </div>
        {series.data ? (
          <RevenueChart data={series.data} />
        ) : (
          <p className="muted">Loading.</p>
        )}
      </section>

      <section className="section">
        <div className="section-title-row">
          <div>
            <Eyebrow number="04">Top products</Eyebrow>
            <h2>Where the revenue comes from.</h2>
          </div>
        </div>
        {products.data ? (
          <TopProductsTable rows={products.data} />
        ) : (
          <p className="muted">Loading.</p>
        )}
      </section>

      <section className="section">
        <div className="section-title-row">
          <div>
            <Eyebrow number="05">Stores</Eyebrow>
            <h2>Where it happens.</h2>
          </div>
        </div>
        {stores.data ? <StoresGrid rows={stores.data} /> : <p className="muted">Loading.</p>}
      </section>
    </>
  );
}
