/* Formatters + small visual primitives shared across the dashboard. */

function formatValue(value, format) {
  if (value == null) return '—';
  switch (format) {
    case 'usd-compact': {
      if (value >= 1e6) return { whole: '$' + (value / 1e6).toFixed(2), unit: 'M' };
      if (value >= 1e3) return { whole: '$' + Math.round(value / 1e3).toLocaleString(), unit: 'K' };
      return { whole: '$' + value.toLocaleString(), unit: '' };
    }
    case 'usd-2':
      return { whole: '$' + value.toFixed(2), unit: '' };
    case 'num-2':
      return { whole: value.toFixed(2), unit: '' };
    case 'int':
      return { whole: value.toLocaleString(), unit: '' };
    case 'pct':
      return { whole: value.toFixed(1), unit: '%' };
    default:
      return { whole: String(value), unit: '' };
  }
}

function pctDelta(curr, prev) {
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
}

function formatDelta(d) {
  const sign = d >= 0 ? '+' : '';
  return sign + d.toFixed(1) + '%';
}

/* Tiny sparkline using inline SVG. No deps. */
function Sparkline({ data, width = 92, height = 28, accent = false }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 2) + 1;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lineColor = accent ? 'var(--accent)' : 'var(--ink)';
  const fillColor = accent ? 'var(--accent-soft)' : 'var(--paper-3)';
  const areaPath = `M${pts[0]} L${pts.join(' L')} L${width-1},${height-1} L1,${height-1} Z`;
  const linePath = `M${pts[0]} L${pts.join(' L')}`;
  return (
    <svg width={width} height={height} className="spark" aria-hidden="true">
      <path d={areaPath} fill={fillColor} opacity="0.6" />
      <path d={linePath} stroke={lineColor} strokeWidth="1.25" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length-1].split(',')[0]} cy={pts[pts.length-1].split(',')[1]} r="2" fill={lineColor} />
    </svg>
  );
}

/* KPI row */
function KPIs() {
  const { KPIS, SPARKS } = window.JS_DATA;
  return (
    <div className="kpis">
      {KPIS.map((k, i) => {
        const v = formatValue(k.value, k.format);
        const d = pctDelta(k.value, k.prevValue);
        const pos = d >= 0;
        const isLast = i === KPIS.length - 1;
        return (
          <div className="kpi" key={k.key}>
            <div className="lab">{k.label}{k.unit && ' · ' + k.unit}</div>
            <div className="val">
              {v.whole}{v.unit && <span className="unit">{v.unit}</span>}
            </div>
            <div className={'delta ' + (pos ? 'pos' : 'neg')}>
              <span className="pct">{formatDelta(d)}</span>
              <span className="vs">vs. last year</span>
            </div>
            <Sparkline data={SPARKS[k.key]} accent={k.key === 'rev'} />
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { formatValue, pctDelta, formatDelta, Sparkline, KPIs });
