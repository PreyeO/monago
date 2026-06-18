export const dynamic = 'force-dynamic';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { createServerClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Card, CardBody } from '@/components/ui';

async function getStats() {
  const supabase = createServerClient();
  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('total, status'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);
  const orders = ordersRes.data ?? [];
  const revenue = orders
    .filter((o) => ['paid', 'delivered'].includes(o.status))
    .reduce((s, o) => s + (o.total ?? 0), 0);
  return {
    totalOrders: orders.length,
    revenue,
    productCount: productsRes.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const tiles = [
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Products', value: stats.productCount.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AdminLayout>
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid gap-5 sm:grid-cols-3">
        {tiles.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
