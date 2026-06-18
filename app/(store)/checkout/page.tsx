'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { CheckoutForm } from './CheckoutForm';
import { Spinner } from '@/components/ui';
import Link from 'next/link';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, qty: i.quantity })) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError(data.error ?? 'Failed to initialise payment');
      })
      .catch(() => setError('Failed to initialise payment'));
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Your cart is empty</h2>
        <Link href="/" className="text-sm text-amber-600 hover:text-amber-500">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-10 text-3xl font-bold text-slate-900">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!clientSecret ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <CheckoutForm clientSecret={clientSecret} />
      )}
    </div>
  );
}
