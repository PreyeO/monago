'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Copy, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Order } from '@/types';
import { formatPrice, getAmwayProductUrl } from '@/lib/utils';
import { Badge, Button, Spinner } from '@/components/ui';
import { useUpdateOrderStatus } from '@/hooks/useAdmin';

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning', paid: 'info', processing: 'info', shipped: 'success', delivered: 'success', cancelled: 'danger',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const updateStatus = useUpdateOrderStatus();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json() as Promise<{ order: Order }>;
    },
    enabled: !!id,
  });

  const order = data?.order;

  function copyOrderText() {
    if (!order) return;
    const lines = [
      `Order #${order.id.slice(0, 8).toUpperCase()}`,
      `Customer: ${order.customer_name} <${order.customer_email}>`,
      `Address: ${order.shipping_address.line1}, ${order.shipping_address.city}, ${order.shipping_address.postcode}`,
      '',
      'Items:',
      ...order.items.map((i) => `  ${i.name} (${i.amway_code}) x${i.quantity} @ ${formatPrice(i.unit_price)}`),
      '',
      `Total: ${formatPrice(order.total)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  }

  if (isLoading) return <AdminLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-slate-500">Order not found</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Orders
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <Badge variant={statusVariant[order.status] ?? 'default'}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Items</h2>
              <Button variant="ghost" size="sm" onClick={copyOrderText}>
                <Copy className="h-3.5 w-3.5" /> Copy as text
              </Button>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.brand} · Code: {item.amway_code}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    <a
                      href={`https://www.amway.co.uk/p/${item.amway_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      View on Amway <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-slate-600 mt-1"><span>Shipping</span><span>{formatPrice(order.total - order.subtotal)}</span></div>
              <div className="flex justify-between text-base font-bold text-slate-900 mt-3 border-t border-slate-100 pt-3">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: customer + status */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Customer</h2>
            <p className="text-sm text-slate-900">{order.customer_name}</p>
            <p className="text-sm text-slate-600">{order.customer_email}</p>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Shipping address</p>
              <p className="text-sm text-slate-700">{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p className="text-sm text-slate-700">{order.shipping_address.line2}</p>}
              <p className="text-sm text-slate-700">{order.shipping_address.city}, {order.shipping_address.postcode}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Update Status</h2>
            <select
              value={order.status}
              onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
