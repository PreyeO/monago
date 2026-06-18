'use client';

import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui';
import { CartItem } from './CartItem';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Cart ({items.reduce((a, i) => a + i.quantity, 0)})
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">Your cart is empty</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="mb-4 flex justify-between text-base font-semibold text-slate-900">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={onClose}>
              <Button variant="ghost" size="sm" className="mt-2 w-full">
                View full cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
