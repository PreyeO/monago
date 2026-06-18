import { AdminLayout } from '@/components/layout/AdminLayout';
import { OrderTable } from '@/components/admin/OrderTable';

export const metadata = { title: 'Orders — Admin' };

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Orders</h1>
      <OrderTable />
    </AdminLayout>
  );
}
