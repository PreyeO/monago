'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface RecommendedProductsProps {
  categoryId: string | null;
  excludeId: string;
}

async function fetchRecommended(categoryId: string, excludeId: string): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(4);
  return (data ?? []) as Product[];
}

export function RecommendedProducts({ categoryId, excludeId }: RecommendedProductsProps) {
  const { data: products = [] } = useQuery({
    queryKey: ['recommended', categoryId, excludeId],
    queryFn: () => (categoryId ? fetchRecommended(categoryId, excludeId) : Promise.resolve([])),
    enabled: !!categoryId,
  });

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">You might also like</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
