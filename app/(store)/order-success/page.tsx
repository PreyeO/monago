'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button, Spinner } from '@/components/ui';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => setOrder(data.order ?? null))
        .catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Order Confirmed!</h1>
      <p className="mt-3 text-slate-600">
        Thank you for your order. We&apos;ll send a confirmation to{' '}
        {order?.customer_email ?? 'your email'}.
      </p>

      {order ? (
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 text-left">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Order Summary</h2>
            <span className="text-xs text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.brand} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="mt-3 flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Shipping to:</p>
            <p>{order.customer_name}</p>
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.postcode}</p>
          </div>
        </div>
      ) : orderId ? (
        <div className="mt-10 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
