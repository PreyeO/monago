'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { Spinner } from '@/components/ui';
import { Product } from '@/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      if (!res.ok) throw new Error('Not found');
      return ((await res.json()) as { product: Product }).product;
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0, // always load fresh data into the form
  });

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : data ? (
        <ProductForm key={data.id} product={data} />
      ) : (
        <p className="text-slate-500">Product not found</p>
      )}
    </AdminLayout>
  );
}
