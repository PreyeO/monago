import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductTable } from '@/components/admin/ProductTable';

export const metadata = { title: 'Products — Admin' };

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>
      <ProductTable />
    </AdminLayout>
  );
}
