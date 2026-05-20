export type Period = "ytd" | "mtd" | "qtd" | "30d" | "90d";

export interface KpiItem {
  key: string;
  label: string;
  unit: string;
  value: number;
  prev_value: number;
  format: "usd-compact" | "usd-2" | "num-2" | "int";
  spark: number[] | null;
}

export interface KpisResponse {
  as_of: string;
  period: Period;
  kpis: KpiItem[];
}

export interface RevenueRaceWeek {
  week: number;
  curr_weekly: number | null;
  prev_weekly: number | null;
  curr_cumul: number | null;
  prev_cumul: number;
}

export interface RevenueRaceResponse {
  as_of: string;
  weeks: RevenueRaceWeek[];
  summary: {
    curr_ytd: number;
    prev_same_point: number;
    prev_full_year: number;
  };
}

export interface CategoryItem {
  name: string;
  revenue: number;
  share_pct: number;
  yoy_pct: number | null;
}

export interface CategoriesResponse {
  period: Period;
  total_revenue: number;
  categories: CategoryItem[];
}

export interface ProductItem {
  name: string;
  category: string;
  revenue: number;
  units: number;
}

export interface ProductsResponse {
  period: Period;
  sort_by: "rev" | "units";
  products: ProductItem[];
}

export interface StoreItem {
  store_id: string;
  store_name: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface StoresResponse {
  period: Period;
  total_revenue: number;
  top2_share_pct: number;
  stores: StoreItem[];
}

export interface OrderSizeBin {
  bin: string;
  label: string;
  count: number;
}

export interface OrderSizeResponse {
  period: Period;
  aov: number;
  bins: OrderSizeBin[];
}
