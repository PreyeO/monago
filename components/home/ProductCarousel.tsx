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
      : 280;
    trackRef.current.scrollBy({ left: dir === 'right' ? cardWidth * 2 : -cardWidth * 2, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {/* Prev */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-5 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-stone-200 bg-white p-2 shadow-md transition-colors hover:bg-zinc-900 hover:text-white hover:border-zinc-900"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[220px] shrink-0 sm:w-[240px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-5 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-stone-200 bg-white p-2 shadow-md transition-colors hover:bg-zinc-900 hover:text-white hover:border-zinc-900"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
