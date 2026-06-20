export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/constants/categories';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { TrustStrip } from '@/components/home/TrustStrip';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { Product } from '@/types';
import { pick600Image } from '@/lib/utils';

const CATEGORY_META: Record<string, {
  color: string;
  accent: string;
  tagline: string;
  subSlug: string;
  keyword?: string;
  badge?: string;
}> = {
  beauty:          { color: '#1a0635', accent: '#c084fc', tagline: 'Skin-transforming care', subSlug: 'skincare',   keyword: 'SPF' },
  'personal-care': { color: '#280610', accent: '#fb7185', tagline: 'Your daily ritual',      subSlug: 'bath-body',  keyword: 'wash' },
  nutrition:       { color: '#041f0c', accent: '#4ade80', tagline: 'Fuel your potential',    subSlug: 'targeted-food-supplements' },
  home:            { color: '#071826', accent: '#60a5fa', tagline: 'A cleaner home',         subSlug: 'laundry-care', badge: 'New In' },
};

async function getBestSellers(): Promise<Product[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('stock_status', 'inStock')
    .eq('is_most_loved', true)
    .order('selling_price', { ascending: false })
    .limit(16);
  if (data && data.length > 0) return data as Product[];

  // Fallback: no most-loved flagged yet — return highest-priced products
  const { data: fallback } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('stock_status', 'inStock')
    .order('selling_price', { ascending: false })
    .limit(16);
  return (fallback ?? []) as Product[];
}

async function getCategoryImages(): Promise<Record<string, string[]>> {
  const supabase = createServerClient();

  const entries = await Promise.all(
    Object.entries(CATEGORY_META).map(async ([parentSlug, meta]) => {
      const { data: subCat } = await supabase
        .from('categories').select('id').eq('slug', meta.subSlug).single();

      let catIds: string[] = subCat ? [subCat.id] : [];

      if (!catIds.length) {
        const { data: parent } = await supabase
          .from('categories').select('id').eq('slug', parentSlug).single();
        if (parent) {
          const { data: subs } = await supabase
            .from('categories').select('id').eq('parent_id', parent.id);
          catIds = [parent.id, ...(subs ?? []).map((s: { id: string }) => s.id)];
        }
      }
      if (!catIds.length) return [parentSlug, []] as [string, string[]];

      const baseQ = () =>
        supabase.from('products').select('image_urls').in('category_id', catIds).eq('is_active', true);

      let { data: products } = await (
        meta.keyword
          ? baseQ().ilike('name', `%${meta.keyword}%`)
          : baseQ()
      ).order('selling_price', { ascending: false }).limit(2);

      // keyword returned nothing — fall back to any product in this category
      if (meta.keyword && (!products || products.length === 0)) {
        ({ data: products } = await baseQ().order('selling_price', { ascending: false }).limit(2));
      }

      const images = (products ?? [])
        .map((p: { image_urls: string[] }) => pick600Image(p.image_urls))
        .filter((url) => !url.includes('placeholder')) as string[];

      return [parentSlug, images] as [string, string[]];
    })
  );

  return Object.fromEntries(entries);
}

const VALUES = [
  { icon: Truck,       title: 'Free UK Delivery', body: 'Complimentary shipping on all orders over £50.' },
  { icon: ShieldCheck, title: 'Secure Checkout',  body: 'Encrypted payments via Stripe. Always safe.' },
  { icon: RotateCcw,   title: '30-Day Returns',   body: 'Not happy? Return it within 30 days.' },
  { icon: Sparkles,    title: 'Premium Quality',  body: 'Science-backed products trusted worldwide.' },
];

const BRANDS = [
  'Artistry™', 'Artistry Skin Nutrition™', 'Nutrilite™',
  'g&h™', 'Artistry Studio™', 'XS™', 'Artistry LongXevity™',
  'Artistry Labs™', 'Artistry Signature Select™',
];

export default async function HomePage() {
  const [bestSellers, categoryImages] = await Promise.all([
    getBestSellers(),
    getCategoryImages(),
  ]);

  return (
    <div className="bg-[#F9F7F4]">

      {/* ── HERO SLIDER ─────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── TRUST STRIP ─────────────────────────────────────────────────── */}
      <TrustStrip />

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Collections</p>
            <h2 className="font-display mt-2 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Browse our shop
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const meta   = CATEGORY_META[cat.slug];
              const images = categoryImages[cat.slug] ?? [];

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative flex aspect-2/3 flex-col justify-end overflow-hidden rounded-2xl"
                  style={{ background: meta?.color ?? '#111' }}
                >
                  {/* Accent glow */}
                  {meta?.accent && (
                    <div
                      className="pointer-events-none absolute left-1/2 top-[35%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl sm:h-44 sm:w-44"
                      style={{ background: meta.accent }}
                    />
                  )}

                  {/* New In badge */}
                  {meta?.badge && (
                    <div className="absolute left-3 top-3 z-30 rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-900 sm:left-4 sm:top-4 sm:text-[10px]">
                      {meta.badge}
                    </div>
                  )}

                  {/* Large centered product image */}
                  {images[0] && (
                    <div className="absolute left-1/2 top-4 z-20 h-[48%] w-[76%] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-500 group-hover:scale-105 sm:top-7 sm:h-[58%] sm:w-[80%]">
                      <Image
                        src={images[0]}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 45vw, 22vw"
                        className="object-contain p-3 sm:p-4"
                        priority
                      />
                    </div>
                  )}

                  {/* Bottom gradient — only covers the lower third for text */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Text */}
                  <div className="relative z-30 p-3 sm:p-5">
                    {meta?.tagline && (
                      <p className="mb-1 hidden text-[9px] font-semibold uppercase tracking-[0.25em] sm:mb-1.5 sm:block sm:text-[10px]"
                        style={{ color: meta.accent + 'bb' }}>
                        {meta.tagline}
                      </p>
                    )}
                    <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-2xl lg:text-[1.6rem]">
                      {cat.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-widest opacity-0 transition-all duration-300 group-hover:opacity-100 sm:text-xs"
                        style={{ color: meta?.accent ?? '#fff' }}
                      >
                        Browse
                      </span>
                      <ArrowRight
                        className="h-2.5 w-2.5 -translate-x-1 opacity-0 transition-all duration-300 delay-75 group-hover:translate-x-0 group-hover:opacity-100 sm:h-3 sm:w-3"
                        style={{ color: meta?.accent ?? '#fff' }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-12 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-7 flex items-end justify-between sm:mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Most Loved</p>
                <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                  The Best Sellers
                </h2>
              </div>
              <Link
                href="/category/beauty"
                className="hidden items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:flex"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ProductCarousel products={bestSellers} />
          </div>
        </section>
      )}

      {/* ── THE MONAGO PROMISE ────────────────────────────────────────────── */}
      <section className="bg-zinc-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-400">Why Monago</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-5xl">
              The finest wellness,<br />curated for you.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-500/20 sm:h-14 sm:w-14">
                  <Icon className="h-5 w-5 text-amber-400 sm:h-6 sm:w-6" />
                </div>
                <h3 className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:mt-5 sm:text-xs">{title}</h3>
                <p className="mt-1.5 text-[10px] leading-relaxed text-stone-500 sm:mt-2 sm:text-xs">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER SIGNUP ─────────────────────────────────────────────── */}
      <NewsletterSignup />

      {/* ── BRANDS MARQUEE ───────────────────────────────────────────────── */}
      <section className="overflow-hidden border-t border-stone-200 bg-white py-8 sm:py-10">
        <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400 sm:mb-7">
          Our Brands
        </p>
        <div className="animate-marquee">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i} className="mx-8 shrink-0 text-sm font-medium text-zinc-400 sm:mx-10">
              {brand}
              <span className="ml-8 text-amber-400 sm:ml-10">·</span>
            </span>
          ))}
        </div>
      </section>

    </div>
  );
}
