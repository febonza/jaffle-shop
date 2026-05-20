/* Filter bar — date range, compare-to, store, customer segment.
   Real popovers, real state.                                    */

const DATE_PRESETS = [
  { key: 'ytd',    label: 'YTD',           detail: 'Jan 1 — May 20, 2026' },
  { key: '30d',    label: 'Last 30 days',  detail: 'Apr 20 — May 20, 2026' },
  { key: '90d',    label: 'Last 90 days',  detail: 'Feb 19 — May 20, 2026' },
  { key: 'mtd',    label: 'MTD',           detail: 'May 1 — May 20, 2026' },
  { key: 'qtd',    label: 'QTD',           detail: 'Apr 1 — May 20, 2026' },
  { key: 'custom', label: 'Custom range…', detail: 'Pick start + end' },
];

const COMPARE_PRESETS = [
  { key: 'ly',     label: 'Last year',     detail: 'Same period, 2025' },
  { key: 'prior',  label: 'Prior period',  detail: 'Preceding same-length window' },
  { key: 'l2y',    label: 'Two years ago', detail: 'Same period, 2024' },
  { key: 'custom', label: 'Custom…',       detail: 'Pick a range' },
  { key: 'none',   label: 'No comparison', detail: 'Hide YoY deltas' },
];

const SEGMENTS = [
  { key: 'all',       label: 'All customers' },
  { key: 'new',       label: 'New only' },
  { key: 'returning', label: 'Returning only' },
  { key: 'vip',       label: 'VIP (top 10%)' },
];

function Popover({ open, onClose, anchor, children }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target) &&
          anchor.current && !anchor.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  if (!open) return null;
  return <div className="popover" ref={ref}>{children}</div>;
}

function FilterDropdown({ label, value, valueLabel, options, onChange, multi }) {
  const [open, setOpen] = React.useState(false);
  const anchor = React.useRef(null);
  return (
    <div className="filter" style={{ position: 'relative' }}>
      <label>{label}</label>
      <button
        ref={anchor}
        className="control"
        data-open={open}
        onClick={() => setOpen(v => !v)}
        type="button"
      >
        <span>{valueLabel}</span>
        <span className="chevron">▾</span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchor={anchor}>
        {options.map(opt => {
          const selected = multi
            ? value.includes(opt.key)
            : value === opt.key;
          return (
            <div
              key={opt.key}
              className={'opt' + (selected ? ' selected' : '')}
              onClick={() => {
                if (multi) {
                  const next = selected
                    ? value.filter(v => v !== opt.key)
                    : [...value, opt.key];
                  onChange(next.length ? next : value);
                } else {
                  onChange(opt.key);
                  setOpen(false);
                }
              }}
            >
              <span className="check">{selected ? '✓' : ''}</span>
              <span style={{ flex: 1 }}>
                <div>{opt.label}</div>
                {opt.detail && (
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--ink-3)', marginTop: 2
                  }}>{opt.detail}</div>
                )}
              </span>
            </div>
          );
        })}
      </Popover>
    </div>
  );
}

function FilterBar({ filters, setFilters }) {
  const { STORES } = window.JS_DATA;
  const storeOpts = [
    { key: 'all', label: 'All stores', detail: '6 locations' },
    ...STORES.map(s => ({ key: s.id, label: s.name, detail: s.city })),
  ];

  const datePreset = DATE_PRESETS.find(d => d.key === filters.date) || DATE_PRESETS[0];
  const cmpPreset = COMPARE_PRESETS.find(c => c.key === filters.compare) || COMPARE_PRESETS[0];

  const storeLabel = filters.stores.length === 0 || filters.stores.includes('all')
    ? 'All stores'
    : filters.stores.length === 1
      ? STORES.find(s => s.id === filters.stores[0])?.name
      : `${filters.stores.length} stores`;

  const segLabel = SEGMENTS.find(s => s.key === filters.segment)?.label;

  return (
    <div className="filterbar">
      <FilterDropdown
        label="Range"
        value={filters.date}
        valueLabel={datePreset.label}
        options={DATE_PRESETS}
        onChange={v => setFilters({ ...filters, date: v })}
      />
      <FilterDropdown
        label="vs."
        value={filters.compare}
        valueLabel={cmpPreset.label}
        options={COMPARE_PRESETS}
        onChange={v => setFilters({ ...filters, compare: v })}
      />
      <FilterDropdown
        label="Store"
        value={filters.stores}
        valueLabel={storeLabel}
        options={storeOpts}
        multi
        onChange={v => setFilters({ ...filters, stores: v })}
      />
      <FilterDropdown
        label="Segment"
        value={filters.segment}
        valueLabel={segLabel}
        options={SEGMENTS}
        onChange={v => setFilters({ ...filters, segment: v })}
      />
      <div className="filter-spacer"></div>
      <div className="filter-meta">
        <span className="pulse"></span>
        <span>Last refreshed 12 min ago</span>
        <span style={{ color: 'var(--ink-4)' }}>·</span>
        <span>dbt run #1402</span>
      </div>
    </div>
  );
}

Object.assign(window, { FilterBar });
