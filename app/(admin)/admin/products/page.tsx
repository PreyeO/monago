import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductTable } from '@/components/admin/ProductTable';

export const metadata = { title: 'Products — Admin' };

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
      </div>
      <ProductTable />
    </AdminLayout>
  );
}
