'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
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
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? (orders as Order[]).filter((o) => {
        const q = query.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_email?.toLowerCase().includes(q)
        );
      })
    : (orders as Order[]);

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID, name or email…"
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

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
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">No orders match &ldquo;{query}&rdquo;</td></tr>
          )}
          {filtered.map((order) => (
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
    </div>
  );
}
