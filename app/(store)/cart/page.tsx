'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui';

export default function CartPage() {
  const items = useCartStore((s) => s.items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Your Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-300" />
          <h2 className="mt-6 text-xl font-semibold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-slate-500">Add some products to get started.</p>
          <Link href="/">
            <Button className="mt-6">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-5">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
