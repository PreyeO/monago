export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/constants/categories';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { Product } from '@/types';

async function getSkincareProducts(): Promise<Product[]> {
  const supabase = createServerClient();
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'skincare')
    .single();
  if (!cat) return [];
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', cat.id)
    .eq('is_active', true)
    .eq('stock_status', 'inStock')
    .order('selling_price', { ascending: false })
    .limit(16);
  return (data ?? []) as Product[];
}

const CATEGORY_CONFIG: Record<string, { image: string; color: string; tagline: string }> = {
  nutrition: {
    image: 'https://media.mlp.amway.eu/sys-master/images/h67/h28/9230019821598/IMAGE_product-image_600_600_128047_1.jpg',
    color: '#0e3318',
    tagline: 'Fuel your potential',
  },
  beauty: {
    image: 'https://media.mlp.amway.eu/sys-master/images/h1e/h57/9344465272862/IMAGE_product-image_600_600_125517_1.jpg',
    color: '#3d1275',
    tagline: 'Skin-transforming care',
  },
  home: {
    image: 'https://media.mlp.amway.eu/sys-master/images/h45/h02/14335000444958/127571_1_IMAGE_product-image_600_600.jpg',
    color: '#1a3040',
    tagline: 'A cleaner home',
  },
  'personal-care': {
    image: 'https://media.mlp.amway.eu/sys-master/images/h32/h3b/14256225779742/125901_1_IMAGE_product-image_600_600.jpg',
    color: '#4a0a2a',
    tagline: 'Your daily ritual',
  },
};

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
  const skincare = await getSkincareProducts();

  return (
    <div className="bg-[#F9F7F4]">

      {/* ── HERO SLIDER ─────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Collections</p>
            <h2 className="font-display mt-2 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat.slug];
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative flex aspect-2/3 flex-col justify-end overflow-hidden"
                  style={{ background: config?.color ?? '#111' }}
                >
                  {config?.image && (
                    <Image
                      src={config.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover opacity-40 transition-all duration-700 group-hover:opacity-60 group-hover:scale-110"
                    />
                  )}

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Hover border */}
                  <div className="absolute inset-0 border-2 border-transparent transition-all duration-300 group-hover:border-white/30" />

                  <div className="relative z-10 p-5">
                    {config?.tagline && (
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                        {config.tagline}
                      </p>
                    )}
                    <h3 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                      {cat.name}
                    </h3>
                    <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
                      <span className="translate-y-4 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        Browse
                      </span>
                      <ArrowRight className="h-3 w-3 translate-y-4 text-white opacity-0 transition-all duration-300 delay-75 group-hover:translate-y-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SKINCARE RECOMMENDATIONS ──────────────────────────────────────── */}
      {skincare.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Skincare</p>
                <h2 className="font-display mt-2 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                  Recommended for You
                </h2>
              </div>
              <Link
                href="/category/beauty/skincare"
                className="hidden items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:flex"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ProductCarousel products={skincare} />
          </div>
        </section>
      )}

      {/* ── THE MONAGO PROMISE ────────────────────────────────────────────── */}
      <section className="bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-400">
              Why Monago
            </p>
            <h2 className="font-display mt-3 text-4xl font-bold text-white sm:text-5xl">
              The finest wellness,<br />curated for you.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-500/20">
                  <Icon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS MARQUEE ───────────────────────────────────────────────── */}
      <section className="overflow-hidden border-t border-stone-200 bg-white py-10">
        <p className="mb-7 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">
          Our Brands
        </p>
        <div className="animate-marquee">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i} className="mx-10 shrink-0 text-sm font-medium text-zinc-400">
              {brand}
              <span className="ml-10 text-amber-400">·</span>
            </span>
          ))}
        </div>
      </section>

    </div>
  );
}
