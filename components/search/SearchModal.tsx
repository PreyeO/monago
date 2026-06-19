'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, pick600Image } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { CATEGORIES } from '@/constants/categories';

interface Props {
  open: boolean;
  onClose: () => void;
}

const QUICK_LINKS = CATEGORIES.flatMap((cat) =>
  cat.subcategories.slice(0, 2).map((sub) => ({
    label: sub.name,
    href: `/category/${cat.slug}/${sub.slug}`,
  }))
).slice(0, 8);

export function SearchModal({ open, onClose }: Props) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const timerRef              = useRef<ReturnType<typeof setTimeout>>();
  const { addProduct }        = useCart();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 280);
  }

  if (!open) return null;

  const showEmpty   = !query;
  const showLoading = loading && query.length >= 2;
  const showNone    = !loading && query.length >= 2 && results.length === 0;
  const showResults = results.length > 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* ── Search bar ───────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-stone-200 px-4 py-4 sm:px-8 sm:py-5">
        <Search className="h-5 w-5 shrink-0 text-stone-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="Search products, brands…"
          className="flex-1 bg-transparent text-base font-medium text-zinc-900 placeholder:text-stone-400 focus:outline-none sm:text-lg"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
            className="cursor-pointer rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-zinc-900"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="cursor-pointer rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-zinc-900"
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">

        {/* Empty state */}
        {showEmpty && (
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">
              Browse Categories
            </p>
            <div className="mb-8 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                >
                  {cat.name} <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>

            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">
              Popular Searches
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="rounded-lg border border-stone-100 px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-zinc-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {showLoading && (
          <div className="flex items-center gap-3 text-stone-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-200 border-t-zinc-800" />
            <span className="text-sm">Searching…</span>
          </div>
        )}

        {/* No results */}
        {showNone && (
          <div className="py-16 text-center">
            <p className="text-base font-semibold text-zinc-900">No results for &ldquo;{query}&rdquo;</p>
            <p className="mt-2 text-sm text-stone-400">Try a different spelling or browse a category below.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => {
                const img        = pick600Image(product.image_urls);
                const outOfStock = product.stock_status !== 'inStock';
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/product/${product.amway_code}`}
                      onClick={onClose}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-50"
                    >
                      <Image
                        src={img}
                        alt={product.name ?? ''}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      {product.brand && (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600">
                          {product.brand}
                        </p>
                      )}
                      <Link
                        href={`/product/${product.amway_code}`}
                        onClick={onClose}
                        className="line-clamp-2 text-xs font-medium leading-snug text-zinc-800 transition-colors hover:text-amber-600 sm:text-sm"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-sm font-bold text-zinc-900">
                        {formatPrice(product.selling_price)}
                      </p>
                    </div>

                    {/* Add to bag */}
                    <button
                      disabled={outOfStock}
                      onClick={() => !outOfStock && addProduct(product)}
                      title={outOfStock ? 'Out of stock' : 'Add to bag'}
                      className={`shrink-0 rounded-xl p-2.5 transition-colors ${
                        outOfStock
                          ? 'cursor-not-allowed bg-stone-100 text-stone-300'
                          : 'cursor-pointer bg-zinc-900 text-white hover:bg-amber-500'
                      }`}
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
