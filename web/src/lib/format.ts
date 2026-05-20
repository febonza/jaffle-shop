const integer = new Intl.NumberFormat("en-US");

export function formatInt(n: number) {
  return integer.format(n);
}

export function formatUsdCompact(v: number): string {
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return "$" + Math.round(v / 1e3).toLocaleString() + "K";
  return "$" + v.toLocaleString();
}

export function formatUsd(n: number, _precise = false) {
  return "$" + n.toFixed(2);
}

export function formatCompact(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return n.toString();
}

export type KpiFormat = "usd-compact" | "usd-2" | "num-2" | "int";

export function formatKpiValue(value: number, format: KpiFormat): { whole: string; unit: string } {
  if (format === "usd-compact") {
    if (value >= 1e6) return { whole: "$" + (value / 1e6).toFixed(2), unit: "M" };
    if (value >= 1e3) return { whole: "$" + Math.round(value / 1e3).toLocaleString(), unit: "K" };
    return { whole: "$" + value.toLocaleString(), unit: "" };
  }
  if (format === "usd-2") return { whole: "$" + value.toFixed(2), unit: "" };
  if (format === "num-2") return { whole: value.toFixed(2), unit: "" };
  if (format === "int") return { whole: value.toLocaleString(), unit: "" };
  return { whole: String(value), unit: "" };
}

export function pctDelta(curr: number, prev: number): number {
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
}

export function formatDelta(d: number): string {
  return (d >= 0 ? "+" : "") + d.toFixed(1) + "%";
}
