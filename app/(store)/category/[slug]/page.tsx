export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCategoryBySlug } from '@/constants/categories';
import { createServerClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product } from '@/types';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryProducts(categorySlug: string): Promise<Product[]> {
  const supabase = createServerClient();
  const { data: catData } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!catData) return [];

  const { data: subCats } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', catData.id);

  const catIds = [catData.id, ...(subCats ?? []).map((c: { id: string }) => c.id)];

  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .in('category_id', catIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (data ?? []) as Product[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  return { title: `${cat.name} | Monago` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const products = await getCategoryProducts(slug);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-stone-400 sm:text-sm">
          <Link href="/" className="transition-colors hover:text-zinc-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-900">{cat.name}</span>
        </nav>

        <h1 className="font-display mb-5 text-3xl font-bold text-zinc-900 sm:mb-6 sm:text-4xl">
          {cat.name}
        </h1>

        {/* Subcategory pills — horizontal scroll on mobile, hidden on desktop */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden lg:hidden">
          {cat.subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/category/${slug}/${sub.slug}`}
              className="shrink-0 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
            >
              {sub.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              Browse
            </p>
            <ul className="space-y-0.5">
              {cat.subcategories.map((sub) => (
                <li key={sub.slug}>
                  <Link
                    href={`/category/${slug}/${sub.slug}`}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-stone-100 hover:text-zinc-900"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <p className="mb-4 text-xs text-stone-400">{products.length} products</p>
            <ProductGrid products={products} />
          </div>
        </div>

      </div>
    </div>
  );
}
