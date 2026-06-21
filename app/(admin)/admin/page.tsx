export const dynamic = 'force-dynamic';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { createServerClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { Card, CardBody } from '@/components/ui';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { OrderStatusChart } from '@/components/admin/OrderStatusChart';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

async function getStats() {
  const supabase = createServerClient();
  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('id, total, status, created_at, customer_name'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  const orders = ordersRes.data ?? [];

  // Revenue (paid + delivered)
  const revenue = orders
    .filter((o) => ['paid', 'delivered'].includes(o.status))
    .reduce((s, o) => s + (o.total ?? 0), 0);

  // Pending orders count
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  // Revenue per day — last 7 days
  const days: { day: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const dateStr = d.toISOString().slice(0, 10);
    const dayRevenue = orders
      .filter((o) =>
        ['paid', 'delivered'].includes(o.status) &&
        o.created_at?.slice(0, 10) === dateStr
      )
      .reduce((s, o) => s + (o.total ?? 0), 0);
    days.push({ day: label, revenue: dayRevenue });
  }

  // Orders by status
  const byStatus = STATUSES.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  // Recent 5 orders
  const recent = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    totalOrders: orders.length,
    revenue,
    productCount: productsRes.count ?? 0,
    pendingCount,
    days,
    byStatus,
    recent,
  };
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-slate-100 text-slate-600',
  paid:       'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default async function AdminDashboard() {
  const stats = await getStats();

  const tiles = [
    { label: 'Total Orders',    value: stats.totalOrders.toString(),  icon: ShoppingBag, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Revenue',         value: formatPrice(stats.revenue),    icon: TrendingUp,  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Active Products', value: stats.productCount.toString(), icon: Package,     color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Orders',  value: stats.pendingCount.toString(), icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50' },
  ];

  return (
    <AdminLayout>
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-slate-700">Revenue — last 7 days</p>
            <RevenueChart data={stats.days} />
          </CardBody>
        </Card>

        {/* Orders by status */}
        <Card>
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-slate-700">Orders by status</p>
            <OrderStatusChart data={stats.byStatus} />
          </CardBody>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="mt-6">
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-slate-700">Recent orders</p>
          {stats.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No orders yet</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {stats.recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{o.customer_name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[o.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {o.status}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{formatPrice(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </AdminLayout>
  );
}
