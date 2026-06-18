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
  return { title: cat.name };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const products = await getCategoryProducts(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900">{cat.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-52 lg:flex-shrink-0">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Subcategories
          </h3>
          <ul className="space-y-1">
            {cat.subcategories.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`/category/${slug}/${sub.slug}`}
                  className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">{cat.name}</h1>
            <p className="text-sm text-slate-500">{products.length} products</p>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
