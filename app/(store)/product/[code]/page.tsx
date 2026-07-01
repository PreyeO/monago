export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Package, Truck, RotateCcw, ShieldCheck, CheckCircle } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import { formatPrice, pickAllImages } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { RecommendedProducts } from '@/components/product/RecommendedProducts';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductAccordion } from '@/components/product/ProductAccordion';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { ProductViewTracker } from '@/components/meta/ProductViewTracker';
import { AddToCartButton } from './AddToCartButton';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ code: string }>;
}

async function getMostLoved(excludeId: string): Promise<Product[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('stock_status', 'inStock')
    .eq('is_most_loved', true)
    .neq('id', excludeId)
    .order('selling_price', { ascending: false })
    .limit(12);
  return (data ?? []) as Product[];
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

const PERKS = [
  { icon: Truck,       text: 'Free delivery on orders over £50' },
  { icon: RotateCcw,   text: '30-day hassle-free returns' },
  { icon: ShieldCheck, text: 'Secure checkout via Stripe' },
];


export default async function ProductPage({ params }: Props) {
  const { code } = await params;
  const product = await getProduct(code);
  if (!product) notFound();

  const images     = pickAllImages(product.image_urls);
  const inStock    = product.stock_status === 'inStock';
  const mostLoved  = await getMostLoved(product.id);

  // Build accordion sections from available data
  const accordionSections: { title: string; content: React.ReactNode }[] = [];

  if (product.overview) {
    accordionSections.push({
      title: 'Overview',
      content: (
        <div
          className="pdp-html"
          dangerouslySetInnerHTML={{ __html: product.overview }}
        />
      ),
    });
  }

  if (product.details) {
    accordionSections.push({
      title: 'Details',
      content: (
        <div
          className="pdp-html"
          dangerouslySetInnerHTML={{ __html: product.details }}
        />
      ),
    });
  }

  if (product.features && product.features.length > 0) {
    accordionSections.push({
      title: 'Key Features',
      content: (
        <ul className="space-y-2">
          {product.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  accordionSections.push({
    title: 'Delivery & Returns',
    content: (
      <ul className="space-y-1.5">
        <li>Free UK delivery on orders over £50.</li>
        <li>Standard delivery 3–5 working days.</li>
        <li>Return any unused item within 30 days for a full refund.</li>
      </ul>
    ),
  });


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      <ProductViewTracker
        contentId={product.amway_code}
        name={product.name ?? product.amway_code}
        price={product.selling_price ?? 0}
        category={product.category?.name}
      />

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-slate-400 sm:text-sm">
        <Link href="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-slate-700">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="truncate text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">

        {/* ── Image gallery ─────────────────────────────────────────── */}
        <ProductImageGallery images={images} name={product.name ?? ''} outOfStock={!inStock} videoUrl={product.video_url} />

        {/* ── Product info ──────────────────────────────────────────── */}
        <div className="flex flex-col">

          {product.brand && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">{product.brand}</p>
          )}
          <h1 className="mt-2 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
            {product.name}
          </h1>

          {/* Size */}
          {product.size && (
            <p className="mt-2 text-xs text-slate-500">{product.size}</p>
          )}

          {/* Price + stock */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-900">{formatPrice(product.selling_price)}</span>
            <Badge variant={inStock ? 'success' : 'danger'}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">Incl. VAT · Free delivery over £50</p>

          {/* Short description */}
          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>
          )}

          {/* Add to bag */}
          <div className="mt-7">
            <AddToCartButton product={product} />
          </div>

          {/* Perks */}
          <ul className="mt-6 space-y-2.5 border-t border-stone-100 pt-6">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-xs text-slate-500">
                <Icon className="h-4 w-4 shrink-0 text-amber-500" />
                {text}
              </li>
            ))}
          </ul>

          {/* Accordion */}
          {accordionSections.length > 0 && (
            <div className="mt-6">
              <ProductAccordion sections={accordionSections} />
            </div>
          )}

          {/* SKU */}
          <div className="mt-6 flex items-center gap-2 border-t border-stone-100 pt-6">
            <Package className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-xs text-slate-400">SKU: {product.amway_code}</span>
          </div>
        </div>
      </div>


      {/* Recommended — same category */}
      <RecommendedProducts categoryId={product.category_id} excludeId={product.id} />

      {/* Most Loved */}
      {mostLoved.length > 0 && (
        <section className="mt-16 border-t border-stone-100 pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Most Loved</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
            Customer Favourites
          </h2>
          <div className="mt-6">
            <ProductCarousel products={mostLoved} />
          </div>
        </section>
      )}
    </div>
  );
}
