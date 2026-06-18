'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui';

interface CartSummaryProps {
  onCheckout?: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-semibold text-slate-900">Order Summary</h3>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Shipping</dt>
          <dd className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
        </div>
        {subtotal < 50 && subtotal > 0 && (
          <p className="text-xs text-amber-600">Add {formatPrice(50 - subtotal)} more for free shipping</p>
        )}
        <div className="border-t border-slate-200 pt-2">
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </div>
      </dl>

      {onCheckout ? (
        <Button className="mt-4 w-full" size="lg" onClick={onCheckout} disabled={items.length === 0}>
          Proceed to Checkout
        </Button>
      ) : (
        <Link href="/checkout">
          <Button className="mt-4 w-full" size="lg" disabled={items.length === 0}>
            Proceed to Checkout
          </Button>
        </Link>
      )}
    </div>
  );
}
