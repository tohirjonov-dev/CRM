export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  supplier_id: string | null;
  created_at: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  client_id: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total_amount: number;
  items_count: number;
  order_date: string;
  created_at: string;
  client?: Client;
  items?: OrderItem[];
}

export interface DashboardStats {
  total_revenue: number;
  pending_orders: number;
  low_stock_alerts: number;
  active_clients: number;
  revenue_trend: number;
}

export interface SalesChartPoint {
  date: string;
  sales: number;
  orders: number;
}

export interface InventoryDistributionPoint {
  category: string;
  count: number;
}

export interface TopClientPoint {
  name: string;
  orders: number;
  revenue: number;
}

export interface TopProductPoint {
  name: string;
  sales: number;
  revenue: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
