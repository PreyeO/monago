export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import { formatPrice, pick600Image } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { RecommendedProducts } from '@/components/product/RecommendedProducts';
import { AddToCartButton } from './AddToCartButton';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ code: string }>;
}

async function getProduct(code: string): Promise<Product | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('amway_code', code)
    .eq('is_active', true)
    .single();
  if (error || !data) return null;
  return data as Product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const product = await getProduct(code);
  if (!product) return {};
  return {
    title: product.name ?? code,
    description: product.description ?? `Shop ${product.name} from ${product.brand} at Monago.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { code } = await params;
  const product = await getProduct(code);
  if (!product) notFound();

  const mainImage = pick600Image(product.image_urls);
  const inStock = product.stock_status === 'inStock';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-slate-900">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="truncate text-slate-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <Image
            src={mainImage}
            alt={product.name ?? product.amway_code}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8"
            priority
          />
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Badge variant="danger" className="px-4 py-2 text-sm">Out of Stock</Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm font-medium text-amber-600">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(product.selling_price)}</span>
            {inStock ? (
              <Badge variant="success">In Stock</Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-400">Incl. VAT · Free delivery over £50</p>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-slate-600">{product.description}</p>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          {/* Product code */}
          <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
            <Package className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Product code: {product.amway_code}</span>
          </div>
        </div>
      </div>

      {/* Recommended */}
      <RecommendedProducts categoryId={product.category_id} excludeId={product.id} />
    </div>
  );
}
