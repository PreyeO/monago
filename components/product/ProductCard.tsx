'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, pick600Image } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct } = useCart();
  const imageUrl = pick600Image(product.image_urls);
  const outOfStock = product.stock_status !== 'inStock';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-100 bg-white shadow-sm">

      {/* Image */}
      <Link
        href={`/product/${product.amway_code}`}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        <Image
          src={imageUrl}
          alt={product.name ?? product.amway_code}
          fill
          quality={90}
          sizes="(max-width: 480px) 48vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-1.5 transition-transform duration-500 hover:scale-105 sm:p-2"
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Info + CTA */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        {product.brand && (
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-600 sm:text-[10px]">
            {product.brand}
          </p>
        )}

        <Link href={`/product/${product.amway_code}`} className="flex-1">
          <h3 className="line-clamp-2 min-h-10 text-xs font-medium leading-snug text-zinc-800 transition-colors hover:text-amber-600 sm:text-sm">
            {product.name ?? product.amway_code}
          </h3>
        </Link>

        <p className="text-sm font-bold text-zinc-900 sm:text-base">
          {formatPrice(product.selling_price)}
        </p>

        <button
          disabled={outOfStock}
          onClick={() => !outOfStock && addProduct(product)}
          className={`mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors sm:gap-2 sm:py-2.5 sm:text-xs ${
            outOfStock
              ? 'cursor-not-allowed bg-stone-100 text-stone-400'
              : 'cursor-pointer bg-zinc-900 text-white hover:bg-amber-500'
          }`}
        >
          <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          {outOfStock ? 'Out of Stock' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}
