import { useSearchParams } from "react-router-dom";
import FilterBar, { type Filters } from "../components/FilterBar";
import KPIs from "../components/KPIs";
import HeroChart from "../components/HeroChart";
import CategoryChart from "../components/CategoryChart";
import TopProducts from "../components/TopProducts";
import StoresChart from "../components/StoresChart";
import OrderSizeChart from "../components/OrderSizeChart";
import type { Period } from "../api/types";

const VALID_PERIODS: Period[] = ["ytd", "mtd", "qtd", "30d", "90d"];

function parseFilters(params: URLSearchParams): Filters {
  const period = params.get("period") as Period | null;
  const stores = params.get("stores");
  return {
    period: period && VALID_PERIODS.includes(period) ? period : "ytd",
    stores: stores ? stores.split(",").filter(Boolean) : ["all"],
  };
}

export default function Dashboard() {
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);

  function setFilters(f: Filters) {
    const next = new URLSearchParams();
    next.set("period", f.period);
    if (f.stores.length && !f.stores.includes("all")) {
      next.set("stores", f.stores.join(","));
    }
    setParams(next, { replace: true });
  }

  const storeIds = filters.stores.includes("all") ? [] : filters.stores;

  return (
    <>
      <FilterBar filters={filters} setFilters={setFilters} />

      <main className="dash">
        <header className="dash-head">
          <div>
            <div className="eyebrow-num">
              <span className="idx">01</span>
              <span>YTD overview</span>
            </div>
            <h1>How is the Jaffle business doing?</h1>
            <div className="sub">
              Year-to-date through May 20, 2026 · Six stores · Snapshot of the metrics that matter.
            </div>
          </div>
          <div className="right">
            <span>As of</span>
            <span className="big">Wed · May 20, 2026</span>
            <span>Synthetic Jaffle Shop data</span>
          </div>
        </header>

        <KPIs period={filters.period} stores={storeIds} />

        <HeroChart period={filters.period} stores={storeIds} />

        <div className="chart-grid">
          <CategoryChart period={filters.period} stores={storeIds} />
          <TopProducts period={filters.period} stores={storeIds} />
        </div>

        <div className="chart-grid">
          <StoresChart period={filters.period} />
          <OrderSizeChart period={filters.period} stores={storeIds} />
        </div>
      </main>
    </>
  );
}
