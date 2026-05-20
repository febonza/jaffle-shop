/* All charts for /app. Recharts + a couple of bespoke custom viz. */

const R = window.Recharts;
const {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceDot, Cell, Legend,
} = R;

const ACCENT      = '#C8632C';
const ACCENT_SOFT = '#F2D9C5';
const ACCENT_DEEP = '#9E4B1E';
const INK         = '#111111';
const INK_2       = '#2A2A2A';
const INK_3       = '#55534E';
const INK_4       = '#8A8578';
const RULE_SOFT   = 'rgba(17,17,17,0.10)';

function compactUSD(v) {
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
  return '$' + v.toLocaleString();
}
function compactInt(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return Math.round(v / 1e3) + 'K';
  return v.toString();
}

/* ================== Custom tooltip ================== */
function RTip({ active, payload, label, fmt = compactUSD, extra }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rt-tip">
      <div className="rt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="rt-row">
          <span className="rt-key">
            <span className="swatch" style={{ background: p.color }}></span>
            {p.name}
          </span>
          <span className="rt-val">{p.value == null ? '—' : fmt(p.value)}</span>
        </div>
      ))}
      {extra}
    </div>
  );
}

/* ================== Hero: cumulative YTD race ================== */
function HeroChart() {
  const { CUMULATIVE } = window.JS_DATA;
  const [mode, setMode] = React.useState('cumul'); // cumul | weekly
  // current YTD endpoint
  const lastCurr = CUMULATIVE.filter(d => d.curr != null).slice(-1)[0];
  const prevAtSamePoint = CUMULATIVE[lastCurr.week - 1].prev;
  const fullYearPrev = CUMULATIVE[CUMULATIVE.length - 1].prev;
  const lift = ((lastCurr.curr - prevAtSamePoint) / prevAtSamePoint) * 100;

  // weekly mode: derive weekly deltas
  const weeklyData = React.useMemo(() => {
    let pc = 0, pp = 0;
    return CUMULATIVE.map(d => {
      const wkCurr = d.curr == null ? null : d.curr - pc;
      const wkPrev = d.prev - pp;
      pc = d.curr == null ? pc : d.curr;
      pp = d.prev;
      return { ...d, wkCurr, wkPrev };
    });
  }, []);

  const data = mode === 'cumul' ? CUMULATIVE : weeklyData;
  const currKey = mode === 'cumul' ? 'curr' : 'wkCurr';
  const prevKey = mode === 'cumul' ? 'prev' : 'wkPrev';

  return (
    <section className="hero-chart">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">01</span><span>Revenue performance</span></div>
          <h3>Cumulative revenue, 2026 vs. 2025</h3>
        </div>
        <div className="meta" style={{ textAlign: 'right' }}>
          <span className="big">{compactUSD(lastCurr.curr)}</span>
          <span style={{ color: lift >= 0 ? 'var(--signal-pos)' : 'var(--signal-neg)' }}>
            {lift >= 0 ? '+' : ''}{lift.toFixed(1)}% vs. same point '25
          </span>
          <div style={{ marginTop: 8 }}>
            <div className="toggles">
              <button aria-pressed={mode === 'cumul'} onClick={() => setMode('cumul')}>Cumulative</button>
              <button aria-pressed={mode === 'weekly'} onClick={() => setMode('weekly')}>Weekly</button>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-body" style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="currFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#C8632C" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#C8632C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={RULE_SOFT} vertical={false} />
            <XAxis
              dataKey="label" tickLine={false} axisLine={{ stroke: INK }}
              interval={0} tick={{ fill: INK_3, fontSize: 11 }}
            />
            <YAxis
              tickLine={false} axisLine={false}
              tickFormatter={compactUSD} width={60}
              tick={{ fill: INK_3, fontSize: 11 }}
            />
            <Tooltip
              content={(props) => <RTip {...props} label={data[props.label ? data.findIndex(d => d.label === props.label) : 0]?.monthFull || props.label} />}
              cursor={{ stroke: INK, strokeDasharray: '2 3', strokeWidth: 1 }}
            />
            <Area
              type="monotone" dataKey={prevKey} name="2025"
              stroke={INK_3} strokeWidth={1.25} strokeDasharray="3 3"
              fill="none" dot={false} isAnimationActive={false}
            />
            <Area
              type="monotone" dataKey={currKey} name="2026"
              stroke={ACCENT} strokeWidth={2}
              fill="url(#currFill)" dot={false} isAnimationActive={false}
            />
            {mode === 'cumul' && (
              <ReferenceDot x={lastCurr.label || 'May'} y={lastCurr.curr} r={4} fill={ACCENT} stroke={INK} strokeWidth={1} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{
        padding: '10px 22px 16px', borderTop: '1px solid var(--rule-soft)',
        display: 'flex', gap: 24, fontFamily: 'var(--font-mono)', fontSize: 11, color: INK_3,
      }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 2, background: ACCENT, verticalAlign: 'middle', marginRight: 6 }}></span>2026 actual</span>
        <span><span style={{ display: 'inline-block', width: 14, height: 0, borderTop: '1px dashed ' + INK_3, verticalAlign: 'middle', marginRight: 6 }}></span>2025 same-day</span>
        <span style={{ marginLeft: 'auto' }}>'25 closed at <strong style={{ color: INK }}>{compactUSD(fullYearPrev)}</strong> — on pace for <strong style={{ color: INK }}>~$4.5M</strong></span>
      </div>
    </section>
  );
}

/* ================== Revenue by category ================== */
function CategoryChart() {
  const { CATEGORIES } = window.JS_DATA;
  const sorted = [...CATEGORIES].sort((a, b) => b.rev - a.rev);
  const total = sorted.reduce((a, b) => a + b.rev, 0);
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">02</span><span>Product mix</span></div>
          <h3>Revenue by category</h3>
        </div>
        <div className="meta">
          <span className="big">{compactUSD(total)}</span>
          <span>YTD across 6 categories</span>
        </div>
      </div>
      <div className="chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={RULE_SOFT} vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: INK }} interval={0} tick={{ fill: INK_3, fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={compactUSD} width={50} tick={{ fill: INK_3, fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rt-tip">
                    <div className="rt-label">{d.name}</div>
                    <div className="rt-row">
                      <span className="rt-key">Revenue YTD</span>
                      <span className="rt-val">{compactUSD(d.rev)}</span>
                    </div>
                    <div className="rt-row">
                      <span className="rt-key">% of total</span>
                      <span className="rt-val">{((d.rev / total) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="rt-row">
                      <span className="rt-key">YoY</span>
                      <span className={'rt-delta ' + (d.yoy >= 0 ? 'pos' : 'neg')}>{d.yoy >= 0 ? '+' : ''}{d.yoy.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(17,17,17,0.04)' }}
            />
            <Bar dataKey="rev" fill={INK} radius={[2, 2, 0, 0]} maxBarSize={48} isAnimationActive={false}>
              {sorted.map((c, i) => (
                <Cell key={i} fill={i === 0 ? ACCENT : INK} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================== Top 10 products ================== */
function TopProducts() {
  const { TOP_PRODUCTS } = window.JS_DATA;
  const [sortBy, setSortBy] = React.useState('rev');
  const sorted = [...TOP_PRODUCTS].sort((a, b) => b[sortBy] - a[sortBy]);
  const max = sorted[0][sortBy];
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">03</span><span>Best sellers</span></div>
          <h3>Top 10 products</h3>
        </div>
        <div className="toggles">
          <button aria-pressed={sortBy === 'rev'}  onClick={() => setSortBy('rev')}>Revenue</button>
          <button aria-pressed={sortBy === 'units'} onClick={() => setSortBy('units')}>Units</button>
        </div>
      </div>
      <div className="chart-body" style={{ paddingTop: 8 }}>
        <div className="toplist">
          <div className="row hdr">
            <span></span>
            <span>Product</span>
            <span style={{ justifyContent: 'flex-end' }}>{sortBy === 'rev' ? 'Revenue' : 'Units'}</span>
            <span></span>
          </div>
          {sorted.map((p, i) => {
            const val = p[sortBy];
            const pct = (val / max) * 100;
            return (
              <div className="row" key={p.name}>
                <span className="rank">{String(i + 1).padStart(2, '0')}</span>
                <span className="name">
                  <span>{p.name}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--ink-3)', marginLeft: 8,
                  }}>{p.category}</span>
                </span>
                <span className="val">{sortBy === 'rev' ? compactUSD(val) : val.toLocaleString()}</span>
                <span className="bar-cell">
                  <span className="bar" style={{
                    width: pct + '%',
                    background: i === 0 ? ACCENT : INK,
                  }}></span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================== Stores ================== */
function StoresChart() {
  const { STORES } = window.JS_DATA;
  const sorted = [...STORES].sort((a, b) => b.rev - a.rev);
  const max = sorted[0].rev;
  const total = sorted.reduce((a, b) => a + b.rev, 0);
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">04</span><span>Location performance</span></div>
          <h3>Revenue by store</h3>
        </div>
        <div className="meta">
          <span className="big">6 stores</span>
          <span>Top 2 = {Math.round((sorted[0].rev + sorted[1].rev) / total * 100)}% of revenue</span>
        </div>
      </div>
      <div className="chart-body">
        <div className="stores">
          {sorted.map((s, i) => (
            <div className="store" key={s.id}>
              <span className="rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="name">
                {s.name}
                <small>{s.orders.toLocaleString()} orders · AOV ${(s.rev / s.orders).toFixed(2)}</small>
              </span>
              <span className="bar-cell">
                <span className="bar" style={{
                  width: (s.rev / max * 100) + '%',
                  background: i === 0 ? ACCENT : INK,
                }}></span>
              </span>
              <span className="val">{compactUSD(s.rev)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================== Cohort retention heatmap ================== */
function CohortChart() {
  const { COHORT_LABELS, COHORT_SIZES, COHORT_DATA } = window.JS_DATA;
  const [hover, setHover] = React.useState(null);
  // ink-based color scale
  const cellBg = (v) => {
    if (v == null) return 'transparent';
    if (v === 100) return 'var(--ink)';
    // map 0..60% retention to opacity
    const o = Math.min(1, Math.max(0.04, v / 70));
    return `rgba(17,17,17,${o.toFixed(2)})`;
  };
  const cellFg = (v) => {
    if (v == null) return 'var(--ink-4)';
    if (v >= 30) return 'var(--paper)';
    return 'var(--ink)';
  };
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">05</span><span>Customer retention</span></div>
          <h3>Cohort retention by month</h3>
        </div>
        <div className="meta">
          <span className="big">{hover ? hover.value + '%' : '47%'}</span>
          <span>{hover ? hover.detail : 'Avg M1 retention'}</span>
        </div>
      </div>
      <div className="chart-body tight">
        <div className="cohort">
          <div className="cohort-row hdr">
            <span className="lbl">Cohort</span>
            {Array.from({ length: 8 }, (_, i) => (
              <span className="cell" key={i}>M{i}</span>
            ))}
          </div>
          {COHORT_LABELS.map((label, r) => (
            <div className="cohort-row" key={label}>
              <span className="lbl">
                {label}
                <span style={{ color: 'var(--ink-4)', marginLeft: 6 }}>· {compactInt(COHORT_SIZES[r])}</span>
              </span>
              {COHORT_DATA[r].map((v, c) => (
                <span
                  key={c}
                  className={'cell' + (v == null ? ' empty' : '')}
                  style={{ background: cellBg(v), color: cellFg(v) }}
                  onMouseEnter={() => v != null && setHover({
                    value: v,
                    detail: `${label} · month ${c}`,
                  })}
                  onMouseLeave={() => setHover(null)}
                >
                  {v == null ? '·' : v + '%'}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="cohort-legend">
          <span>Less</span>
          <div className="scale">
            {[0.05, 0.15, 0.30, 0.50, 0.75, 1].map((o, i) => (
              <span key={i} style={{ background: `rgba(17,17,17,${o})` }}></span>
            ))}
          </div>
          <span>More</span>
          <span style={{ marginLeft: 'auto' }}>Returning purchases / cohort size</span>
        </div>
      </div>
    </div>
  );
}

/* ================== Order size histogram ================== */
function OrderSizeChart() {
  const { ORDER_SIZE } = window.JS_DATA;
  const total = ORDER_SIZE.reduce((a, b) => a + b.count, 0);
  // The bin containing AOV ($21.81)
  const aovBin = '20–30';
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">06</span><span>Order distribution</span></div>
          <h3>Order size distribution</h3>
        </div>
        <div className="meta">
          <span className="big">$21.81</span>
          <span>Avg order value</span>
        </div>
      </div>
      <div className="chart-body" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ORDER_SIZE} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={RULE_SOFT} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: INK }} tick={{ fill: INK_3, fontSize: 10 }} interval={0} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={compactInt} width={40} tick={{ fill: INK_3, fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rt-tip">
                    <div className="rt-label">Order size · {d.label}</div>
                    <div className="rt-row"><span className="rt-key">Orders</span><span className="rt-val">{d.count.toLocaleString()}</span></div>
                    <div className="rt-row"><span className="rt-key">Share</span><span className="rt-val">{((d.count / total) * 100).toFixed(1)}%</span></div>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(17,17,17,0.04)' }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={40} isAnimationActive={false}>
              {ORDER_SIZE.map((b, i) => (
                <Cell key={i} fill={b.bin === aovBin ? ACCENT : INK} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================== Hour of day ================== */
function HourChart() {
  const { HOUR_OF_DAY } = window.JS_DATA;
  const peak = HOUR_OF_DAY.reduce((a, b) => (b.count > a.count ? b : a), HOUR_OF_DAY[0]);
  const total = HOUR_OF_DAY.reduce((a, b) => a + b.count, 0);
  const lunch = HOUR_OF_DAY.slice(11, 14).reduce((a, b) => a + b.count, 0);
  const dinner = HOUR_OF_DAY.slice(17, 20).reduce((a, b) => a + b.count, 0);
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="title-block">
          <div className="eyebrow"><span className="idx">07</span><span>Daily pattern</span></div>
          <h3>Orders by hour of day</h3>
        </div>
        <div className="meta">
          <span className="big">{peak.label}</span>
          <span>Peak hour · {compactInt(peak.count)} orders</span>
        </div>
      </div>
      <div className="chart-body" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={HOUR_OF_DAY} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={RULE_SOFT} vertical={false} />
            <XAxis
              dataKey="hour" tickLine={false} axisLine={{ stroke: INK }}
              tick={{ fill: INK_3, fontSize: 10 }} interval={2}
              tickFormatter={(h) => String(h).padStart(2, '0')}
            />
            <YAxis tickLine={false} axisLine={false} tickFormatter={compactInt} width={40} tick={{ fill: INK_3, fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rt-tip">
                    <div className="rt-label">{d.label}</div>
                    <div className="rt-row"><span className="rt-key">Orders</span><span className="rt-val">{d.count.toLocaleString()}</span></div>
                    <div className="rt-row"><span className="rt-key">Share</span><span className="rt-val">{((d.count / total) * 100).toFixed(1)}%</span></div>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(17,17,17,0.04)' }}
            />
            <ReferenceLine x={12} stroke={INK_4} strokeDasharray="2 3" />
            <ReferenceLine x={18} stroke={INK_4} strokeDasharray="2 3" />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {HOUR_OF_DAY.map((b, i) => (
                <Cell key={i} fill={b.hour === peak.hour ? ACCENT : INK} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{
        display: 'flex', gap: 16, padding: '10px 22px 16px',
        borderTop: '1px solid var(--rule-soft)',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: INK_3,
      }}>
        <span>Lunch (11–14) · <strong style={{ color: INK }}>{((lunch / total) * 100).toFixed(0)}%</strong></span>
        <span>Dinner (17–20) · <strong style={{ color: INK }}>{((dinner / total) * 100).toFixed(0)}%</strong></span>
        <span style={{ marginLeft: 'auto' }}>Closed 23:00–05:00</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  HeroChart, CategoryChart, TopProducts, StoresChart,
  CohortChart, OrderSizeChart, HourChart,
});
