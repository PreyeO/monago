export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCategoryBySlug, getSubcategoryBySlug } from '@/constants/categories';
import { createServerClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SubcategoryControls } from '@/components/category/SubcategoryControls';
import { Product } from '@/types';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string; subSlug: string }>;
  searchParams: Promise<{ sort?: string; inStock?: string }>;
}

async function getProducts(subSlug: string, sort: string, inStockOnly: boolean): Promise<Product[]> {
  const supabase = createServerClient();

  const { data: catData } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', subSlug)
    .single();

  if (!catData) return [];

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', catData.id)
    .eq('is_active', true);

  if (inStockOnly) query = query.eq('stock_status', 'inStock');

  if (sort === 'price_asc')       query = query.order('selling_price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('selling_price', { ascending: false });
  else                            query = query.order('created_at',    { ascending: false });

  const { data } = await query;
  return (data ?? []) as Product[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const sub = getSubcategoryBySlug(slug, subSlug);
  return sub ? { title: `${sub.name} | Monago` } : {};
}

export default async function SubcategoryPage({ params, searchParams }: Props) {
  const { slug, subSlug }           = await params;
  const { sort = 'newest', inStock } = await searchParams;

  const cat = getCategoryBySlug(slug);
  const sub = getSubcategoryBySlug(slug, subSlug);
  if (!cat || !sub) notFound();

  const products = await getProducts(subSlug, sort, inStock === '1');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-zinc-900">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/category/${slug}`} className="transition-colors hover:text-zinc-900">{cat.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-900">{sub.name}</span>
      </nav>

      <div className="flex flex-col gap-10 lg:flex-row">

        {/* Sidebar */}
        <aside className="w-full lg:w-56 lg:shrink-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            {cat.name}
          </p>
          <ul className="space-y-0.5">
            {cat.subcategories.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/category/${slug}/${s.slug}`}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    s.slug === subSlug
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-stone-100 hover:text-zinc-900'
                  }`}
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-zinc-900 sm:text-4xl">{sub.name}</h1>
              <p className="mt-1 text-sm text-stone-400">{products.length} products</p>
            </div>
            <SubcategoryControls
              slug={slug}
              subSlug={subSlug}
              currentSort={sort}
              inStock={inStock === '1'}
            />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-medium text-zinc-900">No products found</p>
              <p className="mt-2 text-sm text-stone-400">
                Try adjusting your filters or{' '}
                <Link href={`/category/${slug}`} className="underline hover:text-zinc-900">
                  browse all {cat.name}
                </Link>
              </p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}
