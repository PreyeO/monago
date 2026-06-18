import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Spinner } from '@/components/ui';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({ products, loading, emptyMessage = 'No products found.' }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
