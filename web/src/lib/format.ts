const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const integer = new Intl.NumberFormat("en-US");

export function formatUsd(n: number, precise = false) {
  return (precise ? usdPrecise : usd).format(n);
}

export function formatUsdCompact(n: number) {
  return "$" + compact.format(n);
}

export function formatInt(n: number) {
  return integer.format(n);
}

export function formatCompact(n: number) {
  return compact.format(n);
}
