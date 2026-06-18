'use client';

import Link from 'next/link';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Badge, Spinner } from '@/components/ui';
import { useAdminOrders } from '@/hooks/useAdmin';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  paid: 'info',
  processing: 'info',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'danger',
};

export function OrderTable() {
  const { data: orders = [], isLoading } = useAdminOrders();

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(orders as Order[]).map((order) => (
            <tr key={order.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                #{order.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{order.customer_name}</p>
                <p className="text-xs text-slate-500">{order.customer_email}</p>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatPrice(order.total)}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[order.status] ?? 'default'}>
                  {order.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {new Date(order.created_at).toLocaleDateString('en-GB')}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
