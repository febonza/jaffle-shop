import { useRef, useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import type { Period } from "../api/types";

const DATE_PRESETS: { key: Period; label: string; detail: string }[] = [
  { key: "ytd", label: "YTD", detail: "Jan 1 — today" },
  { key: "30d", label: "Last 30 days", detail: "Trailing 30 days" },
  { key: "90d", label: "Last 90 days", detail: "Trailing 90 days" },
  { key: "mtd", label: "MTD", detail: "Month to date" },
  { key: "qtd", label: "QTD", detail: "Quarter to date" },
];

interface StoreOption {
  store_id: string;
  store_name: string;
}

function Popover({
  open, onClose, anchorRef, children,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose, anchorRef]);
  if (!open) return null;
  return <div className="popover" ref={ref}>{children}</div>;
}

interface FilterDropdownProps {
  label: string;
  valueLabel: string;
  options: { key: string; label: string; detail?: string }[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}

function FilterDropdown({ label, valueLabel, options, value, onChange, multi }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="filter" style={{ position: "relative" }}>
      <label>{label}</label>
      <button
        ref={anchorRef}
        className="control"
        data-open={open}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span>{valueLabel}</span>
        <span className="chevron">▾</span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef}>
        {options.map((opt) => {
          const selected = multi
            ? (value as string[]).includes(opt.key)
            : value === opt.key;
          return (
            <div
              key={opt.key}
              className={`opt${selected ? " selected" : ""}`}
              onClick={() => {
                if (multi) {
                  const arr = value as string[];
                  const next = selected ? arr.filter((v) => v !== opt.key) : [...arr, opt.key];
                  onChange(next.length ? next : arr);
                } else {
                  onChange(opt.key);
                  setOpen(false);
                }
              }}
            >
              <span className="check">{selected ? "✓" : ""}</span>
              <span style={{ flex: 1 }}>
                <div>{opt.label}</div>
                {opt.detail && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                    {opt.detail}
                  </div>
                )}
              </span>
            </div>
          );
        })}
      </Popover>
    </div>
  );
}

export interface Filters {
  period: Period;
  stores: string[];
}

export default function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const { data: storeList } = useApi<StoreOption[]>("/api/app/store-list");

  const storeOpts = [
    { key: "all", label: "All stores", detail: `${storeList?.length ?? 6} locations` },
    ...(storeList ?? []).map((s) => ({ key: s.store_id, label: s.store_name })),
  ];

  const datePreset = DATE_PRESETS.find((d) => d.key === filters.period) ?? DATE_PRESETS[0];

  const storeLabel =
    filters.stores.length === 0 || filters.stores.includes("all")
      ? "All stores"
      : filters.stores.length === 1
        ? (storeList?.find((s) => s.store_id === filters.stores[0])?.store_name ?? filters.stores[0])
        : `${filters.stores.length} stores`;

  return (
    <div className="filterbar">
      <FilterDropdown
        label="Range"
        value={filters.period}
        valueLabel={datePreset.label}
        options={DATE_PRESETS}
        onChange={(v) => setFilters({ ...filters, period: v as Period })}
      />
      <div className="filter">
        <label>vs.</label>
        <button className="control" type="button" disabled style={{ opacity: 0.6, cursor: "default" }}>
          <span>Last year</span>
        </button>
      </div>
      <FilterDropdown
        label="Store"
        value={filters.stores}
        valueLabel={storeLabel}
        options={storeOpts}
        multi
        onChange={(v) => {
          const arr = v as string[];
          const resolved = arr.includes("all") ? ["all"] : arr.filter((x) => x !== "all");
          setFilters({ ...filters, stores: resolved.length ? resolved : ["all"] });
        }}
      />
      <div className="filter">
        <label>Segment</label>
        <button className="control" type="button" disabled style={{ opacity: 0.6, cursor: "default" }}>
          <span>All customers</span>
        </button>
      </div>
      <div className="filter-spacer" />
      <div className="filter-meta">
        <span className="pulse" />
        <span>Live · dbt marts</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span>as of May 20, 2026</span>
      </div>
    </div>
  );
}
