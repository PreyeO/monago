export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  amway_code: string;
  name: string | null;
  brand: string | null;
  description: string | null;
  overview: string | null;
  details: string | null;
  features: string[] | null;
  video_url: string | null;
  size: string | null;
  labels: string[] | null;
  is_most_loved: boolean;
  category_id: string | null;
  source_price: number | null;
  selling_price: number | null;
  markup_override: number | null;
  image_urls: string[] | null;
  amway_url: string | null;
  is_active: boolean;
  stock_status: 'inStock' | 'outOfStock' | 'limitedStock';
  last_synced_at: string | null;
  created_at: string;
  // joined
  category?: Category;
}

export interface CartItem {
  productId: string;
  amway_code: string;
  name: string;
  brand: string;
  image_url: string;
  selling_price: number;
  quantity: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  amway_code: string;
  name: string;
  brand: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  total: number;
  stripe_payment_intent_id: string | null;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: ShippingAddress;
}

export interface AdminProductUpdate {
  selling_price?: number;
  is_active?: boolean;
  markup_override?: number;
}

export interface Setting {
  key: string;
  value: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ProductFilters {
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  search?: string;
}
