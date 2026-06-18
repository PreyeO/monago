'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-3 py-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          sizes="64px"
          className="object-contain p-1"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs text-slate-500">{item.brand}</p>
        <p className="line-clamp-1 text-sm font-medium text-slate-900">{item.name}</p>
        <p className="text-sm font-semibold text-slate-900">{formatPrice(item.selling_price)}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => removeItem(item.productId)}
          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Remove item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-1 rounded-md border border-slate-200">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="px-2 py-1 text-slate-500 hover:text-slate-900"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="px-2 py-1 text-slate-500 hover:text-slate-900"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
