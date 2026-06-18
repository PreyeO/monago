'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Product, ProductFilters } from '@/types';

async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true);

  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.minPrice) query = query.gte('selling_price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('selling_price', filters.maxPrice);
  if (filters.inStockOnly) query = query.eq('stock_status', 'inStock');
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);

  if (filters.sortBy === 'price_asc') query = query.order('selling_price', { ascending: true });
  else if (filters.sortBy === 'price_desc') query = query.order('selling_price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Product[];
}

async function fetchProduct(code: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('amway_code', code)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data as Product;
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('stock_status', 'inStock')
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
}

export function useProduct(code: string) {
  return useQuery({
    queryKey: ['product', code],
    queryFn: () => fetchProduct(code),
    enabled: !!code,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
  });
}
