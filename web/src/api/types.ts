export interface Kpis {
  window_days: number;
  as_of_date: string | null;
  gmv_usd: number;
  orders: number;
  new_customers: number;
  aov_usd: number;
}

export interface RevenuePoint {
  date: string;
  gmv_usd: number;
  orders: number;
}

export interface TopProduct {
  product_sku: string;
  product_name: string;
  product_type: string;
  revenue_usd: number;
  units: number;
}

export interface StoreRow {
  store_id: string;
  store_name: string;
  revenue_usd: number;
  orders: number;
}
