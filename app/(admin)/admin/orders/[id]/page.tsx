'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const qc = useQueryClient();
  const [refundMsg, setRefundMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json() as Promise<{
        order: Order;
        payment: { paid: number; refunded: number; status: string } | null;
      }>;
    },
    enabled: !!id,
  });

  const order = data?.order;
  const payment = data?.payment ?? null;
  const remaining = payment ? Math.max(0, payment.paid - payment.refunded) : 0;
  const canRefund = !!payment && payment.status === 'succeeded' && remaining > 0.001;

  const refund = useMutation({
    mutationFn: async (body: { full?: boolean; itemIndex?: number; markOutOfStock?: boolean }) => {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Refund failed');
      return json as { refunded: number; fullyRefunded: boolean };
    },
    onSuccess: (r) => {
      setRefundMsg({
        ok: true,
        text: `Refunded ${formatPrice(r.refunded)} to the customer.${r.fullyRefunded ? ' Order is now fully refunded and marked cancelled.' : ''}`,
      });
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: Error) => setRefundMsg({ ok: false, text: err.message }),
  });

  function refundItem(index: number) {
    if (!order) return;
    const item = order.items[index];
    const amount = formatPrice(item.unit_price * item.quantity);
    if (!window.confirm(`Refund ${amount} for "${item.name}" (x${item.quantity}) to ${order.customer_name}?\n\nThis sends the money back through Stripe and cannot be undone.`)) return;
    const markOutOfStock = window.confirm(`Also mark "${item.name}" as OUT OF STOCK in the store so nobody else can buy it?\n\nOK = yes, mark out of stock\nCancel = no, leave it in stock`);
    setRefundMsg(null);
    refund.mutate({ itemIndex: index, markOutOfStock });
  }

  function refundAll() {
    if (!order) return;
    if (!window.confirm(`Refund the remaining ${formatPrice(remaining)} (whole order, including shipping) to ${order.customer_name}?\n\nThis cannot be undone.`)) return;
    setRefundMsg(null);
    refund.mutate({ full: true });
  }

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
                <div key={i} className={`flex items-start justify-between px-5 py-4 ${item.refunded ? 'opacity-60' : ''}`}>
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.name}
                      {item.refunded && <Badge variant="danger" className="ml-2">Refunded</Badge>}
                    </p>
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
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                    {canRefund && !item.refunded && (
                      <Button variant="ghost" size="sm" onClick={() => refundItem(i)} disabled={refund.isPending}>
                        Refund item
                      </Button>
                    )}
                  </div>
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

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Payment &amp; refunds</h2>
            {payment ? (
              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex justify-between"><span>Paid</span><span>{formatPrice(payment.paid)}</span></div>
                <div className="flex justify-between"><span>Refunded</span><span>{formatPrice(payment.refunded)}</span></div>
                <div className="flex justify-between font-medium text-slate-900"><span>Remaining</span><span>{formatPrice(remaining)}</span></div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No completed Stripe payment found for this order.</p>
            )}
            {canRefund && (
              <Button variant="danger" size="sm" className="mt-4 w-full" onClick={refundAll} loading={refund.isPending}>
                Refund whole order
              </Button>
            )}
            {refundMsg && (
              <p className={`mt-3 rounded-md p-2 text-xs ${refundMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {refundMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
