'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface Props {
  products: Product[];
}

export function ProductCarousel({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.firstElementChild
      ? (trackRef.current.firstElementChild as HTMLElement).offsetWidth + 16
      : 260;
    trackRef.current.scrollBy({ left: dir === 'right' ? cardWidth * 2 : -cardWidth * 2, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {/* Prev — desktop only */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full border border-stone-200 bg-white p-2 shadow-md transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white sm:flex"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4 scrollbar-none [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex w-[44vw] shrink-0 flex-col sm:w-55 md:w-60"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Next — desktop only */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer rounded-full border border-stone-200 bg-white p-2 shadow-md transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white sm:flex"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
