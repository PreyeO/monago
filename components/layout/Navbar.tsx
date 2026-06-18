'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES } from '@/constants/categories';
import { useCartStore } from '@/store/cartStore';
import { CartDrawer } from '@/components/cart/CartDrawer';

function MonagoLogo() {
  return (
    <Link href="/" className="flex items-baseline gap-0.5 select-none">
      <span className="font-display text-[26px] font-bold leading-none text-amber-500">M</span>
      <span className="font-display text-[22px] font-semibold tracking-[0.15em] uppercase text-zinc-900">onago</span>
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-zinc-900 px-4 py-2 text-center text-xs font-medium tracking-widest text-stone-300 uppercase">
        Free UK delivery on orders over £50
      </div>

      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <MonagoLogo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="text-sm font-medium tracking-wide text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative cursor-pointer rounded-full p-2.5 text-zinc-700 transition-colors hover:bg-stone-100"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2.5 text-zinc-700 transition-colors hover:bg-stone-100 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-stone-100 bg-white px-4 pb-6 md:hidden">
            <nav className="flex flex-col pt-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-stone-100 py-3.5 text-sm font-medium text-zinc-700 last:border-0"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
