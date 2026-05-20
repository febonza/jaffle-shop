/* Demo data for Jaffle Shop Analytics
   Round, demo-clean numbers. YTD through May 20, 2026 (day 140). */

const NAV_LINKS = [
  { href: 'index.html', label: 'Overview', key: 'home' },
  { href: 'app.html', label: 'Dashboard', key: 'app' },
  { href: 'ltv.html', label: 'LTV', key: 'ltv', stub: true },
  { href: 'churn.html', label: 'Churn', key: 'churn', stub: true },
  { href: 'data-quality.html', label: 'Data quality', key: 'dq', stub: true },
];

const STORES = [
  { id: 'sf-mission',   name: 'San Francisco — Mission',     city: 'SF, CA',  rev: 412000, orders: 18200 },
  { id: 'ny-soho',      name: 'New York — SoHo',             city: 'NY, NY',  rev: 388000, orders: 16400 },
  { id: 'chi-loop',     name: 'Chicago — Loop',              city: 'Chicago', rev: 296000, orders: 14100 },
  { id: 'sea-cap-hill', name: 'Seattle — Capitol Hill',      city: 'Seattle', rev: 248000, orders: 11900 },
  { id: 'aus-east',     name: 'Austin — East Side',          city: 'Austin',  rev: 196000, orders: 9600  },
  { id: 'pdx-pearl',    name: 'Portland — Pearl District',   city: 'Portland', rev: 168000, orders: 8100 },
];

const CATEGORIES = [
  { name: 'Sandwiches',  rev: 720000, yoy:  9.2 },
  { name: 'Salads',      rev: 348000, yoy: 14.6 },
  { name: 'Drinks',      rev: 292000, yoy:  6.4 },
  { name: 'Sides',       rev: 196000, yoy:  3.1 },
  { name: 'Soups',       rev: 116000, yoy: -2.4 },
  { name: 'Desserts',    rev:  36000, yoy: 22.0 },
];

const TOP_PRODUCTS = [
  { rank: 1,  name: 'The Classic Jaffle',         category: 'Sandwiches', rev: 184000, units: 9600 },
  { rank: 2,  name: 'Hawaiian Jaffle',            category: 'Sandwiches', rev: 132000, units: 7200 },
  { rank: 3,  name: 'BBQ Pulled Pork Jaffle',     category: 'Sandwiches', rev: 116000, units: 5800 },
  { rank: 4,  name: 'Caprese Salad',              category: 'Salads',     rev:  94000, units: 6700 },
  { rank: 5,  name: 'Caesar (Chicken)',           category: 'Salads',     rev:  88000, units: 6300 },
  { rank: 6,  name: 'Iced Latte',                 category: 'Drinks',     rev:  76000, units: 12700 },
  { rank: 7,  name: 'Veggie Jaffle',              category: 'Sandwiches', rev:  68000, units: 4500 },
  { rank: 8,  name: 'Tomato Bisque',              category: 'Soups',      rev:  56000, units: 4900 },
  { rank: 9,  name: 'Cold Brew',                  category: 'Drinks',     rev:  52000, units: 9100 },
  { rank: 10, name: 'Sea Salt Chips',             category: 'Sides',      rev:  44000, units: 11000 },
];

/* Cumulative YTD revenue race, weekly granularity.
   2026: weeks 1..20 (through May 20). 2025: weeks 1..52.
   Numbers in thousands. */
function buildCumulative() {
  const data = [];
  // weekly increments — roughly seasonal-ish but tame
  const incCurr = [42, 38, 46, 52, 50, 58, 62, 64, 66, 70, 72, 78, 84, 86, 92, 96, 98, 102, 106, 110];
  const incPrev = [38, 36, 40, 44, 46, 50, 52, 54, 60, 62, 66, 70, 72, 78, 82, 84, 86, 90, 94, 96,
                   100, 104, 108, 110, 112, 116, 118, 122, 124, 128, 130, 132, 136, 138, 140, 142,
                   146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 166, 168, 172, 174, 176, 178];
  let curr = 0, prev = 0;
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;
  for (let i = 0; i < 52; i++) {
    if (i < incCurr.length) curr += incCurr[i];
    prev += incPrev[i];
    const monthIdx = Math.min(11, Math.floor(i / (52/12)));
    const showLabel = monthIdx !== lastMonth;
    lastMonth = monthIdx;
    const weekInMonth = i - Math.floor(monthIdx * (52/12)) + 1;
    data.push({
      week: i + 1,
      label: showLabel ? monthLabels[monthIdx] : '',
      monthFull: monthLabels[monthIdx] + ' wk ' + weekInMonth,
      curr: i < incCurr.length ? curr * 1000 : null,
      prev: prev * 1000,
    });
  }
  return data;
}
const CUMULATIVE = buildCumulative();

/* Cohort retention — 8 monthly cohorts, retention % at months 0..7 */
const COHORT_LABELS = ['Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026'];
const COHORT_SIZES  = [4200, 3900, 4600, 5100, 4400, 4800, 5200, 4900];
const COHORT_DATA = [
  // each row: retention at month 0,1,2,3,4,5,6,7 (% as 0-100)
  [100, 42, 31, 24, 21, 18, 16, 15],
  [100, 44, 33, 26, 22, 19, 17, null],
  [100, 41, 30, 23, 20, 17, null, null],
  [100, 46, 34, 27, 23, null, null, null],
  [100, 45, 33, 26, null, null, null, null],
  [100, 47, 35, null, null, null, null, null],
  [100, 48, null, null, null, null, null, null],
  [100, null, null, null, null, null, null, null],
];

/* Order size distribution (histogram bins by $ ranges). */
const ORDER_SIZE = [
  { bin: '0–10',   label: '$0–10',    count: 1800 },
  { bin: '10–20',  label: '$10–20',   count: 4400 },
  { bin: '20–30',  label: '$20–30',   count: 6200 },
  { bin: '30–40',  label: '$30–40',   count: 4800 },
  { bin: '40–60',  label: '$40–60',   count: 3100 },
  { bin: '60–80',  label: '$60–80',   count: 1400 },
  { bin: '80–120', label: '$80–120',  count:  720 },
  { bin: '120+',   label: '$120+',    count:  280 },
];

/* Orders by hour-of-day (24h). Peak at lunch + dinner. */
const HOUR_OF_DAY = [
  0,0,0,0,0,0,                              // 0–5
  120, 380, 720, 1100, 1480,                // 6–10
  2100, 3400, 3800, 2900, 2200, 2400,       // 11–16
  3100, 3600, 3000, 1800, 900, 380, 160     // 17–23
].map((count, hour) => ({ hour, count, label: hour.toString().padStart(2,'0') + ':00' }));

/* KPIs — YTD through May 20, 2026 (day 140). */
const KPIS = [
  { key: 'rev',      label: 'Revenue',          value: 1708000, prevValue: 1546000, format: 'usd-compact', unit: 'YTD' },
  { key: 'orders',   label: 'Orders',           value:  78300,  prevValue:  71200,  format: 'int',          unit: 'YTD' },
  { key: 'customers',label: 'Active customers', value:  42100,  prevValue:  39400,  format: 'int',          unit: 'YTD' },
  { key: 'aov',      label: 'Avg order value',  value:  21.81,  prevValue:  21.71,  format: 'usd-2',        unit: '' },
  { key: 'items',    label: 'Items per order',  value:   2.43,  prevValue:   2.38,  format: 'num-2',        unit: '' },
];

/* Sparkline mini-series for each KPI — 12 monthly points */
const SPARKS = {
  rev:       [110,108,118,124,128,132,138,144,148,156,162,170],
  orders:    [56,58,62,60,64,66,68,70,72,74,76,78],
  customers: [34,35,36,37,38,38,39,40,40,41,41,42],
  aov:       [21.5,21.6,21.5,21.7,21.6,21.8,21.7,21.8,21.7,21.8,21.8,21.8],
  items:     [2.35,2.36,2.37,2.38,2.39,2.40,2.41,2.41,2.42,2.42,2.43,2.43],
};

window.JS_DATA = {
  NAV_LINKS, STORES, CATEGORIES, TOP_PRODUCTS, CUMULATIVE,
  COHORT_LABELS, COHORT_SIZES, COHORT_DATA, ORDER_SIZE, HOUR_OF_DAY,
  KPIS, SPARKS,
};
