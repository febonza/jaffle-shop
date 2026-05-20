/* /app — main dashboard composition. */

function Dashboard() {
  const [filters, setFilters] = React.useState({
    date: 'ytd',
    compare: 'ly',
    stores: ['all'],
    segment: 'all',
  });

  return (
    <>
      <TopNav active="app" />
      <FilterBar filters={filters} setFilters={setFilters} />
      <main className="dash">
        <header className="dash-head">
          <div>
            <div className="eyebrow-num">
              <span className="idx">01</span><span>YTD overview</span>
            </div>
            <h1>How is the Jaffle business doing?</h1>
            <div className="sub">
              Year-to-date through May 20, 2026 · Six stores · Snapshot of the metrics that matter.
            </div>
          </div>
          <div className="right">
            <span>As of</span>
            <span className="big">Wed · May 20, 2026 · 14:08 PT</span>
            <span>140 days of YTD · 225 days remaining</span>
          </div>
        </header>

        <KPIs />

        <HeroChart />

        <div className="chart-grid">
          <CategoryChart />
          <TopProducts />
        </div>
        <div className="chart-grid">
          <StoresChart />
          <CohortChart />
        </div>
        <div className="chart-grid">
          <OrderSizeChart />
          <HourChart />
        </div>
      </main>
      <SiteFoot />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<Dashboard />);
