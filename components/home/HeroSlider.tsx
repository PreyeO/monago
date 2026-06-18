'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 'beauty',
    overline: 'Beauty & Skincare',
    headline: 'Skin that\nglows.',
    body: 'Science-backed serums, creams and make-up formulated for transformative results.',
    cta: { label: 'Shop Beauty', href: '/category/beauty' },
    bg: 'linear-gradient(135deg, #1a0833 0%, #3d1275 60%, #5c1a99 100%)',
    dotColor: '#c084fc',
    accentStyle: { color: '#c084fc' },
    btnStyle: { background: '#c084fc', color: '#111' },
    image: 'https://media.mlp.amway.eu/sys-master/images/h1e/h57/9344465272862/IMAGE_product-image_600_600_125517_1.jpg',
    image2: 'https://media.mlp.amway.eu/sys-master/images/h45/h02/14335000444958/127571_1_IMAGE_product-image_600_600.jpg',
  },
  {
    id: 'nutrition',
    overline: 'Nutrition & Wellness',
    headline: 'Fuel your\nbest self.',
    body: 'Premium vitamins and supplements crafted from the finest natural ingredients.',
    cta: { label: 'Shop Nutrition', href: '/category/nutrition' },
    bg: 'linear-gradient(135deg, #052210 0%, #0e4a22 60%, #166534 100%)',
    dotColor: '#4ade80',
    accentStyle: { color: '#4ade80' },
    btnStyle: { background: '#4ade80', color: '#052210' },
    image: 'https://media.mlp.amway.eu/sys-master/images/h67/h28/9230019821598/IMAGE_product-image_600_600_128047_1.jpg',
    image2: 'https://media.mlp.amway.eu/sys-master/images/hb9/h27/9230019887134/IMAGE_product-image_600_600_128047_1.jpg',
  },
  {
    id: 'personal-care',
    overline: 'Personal Care',
    headline: 'Your ritual,\nelevated.',
    body: 'Luxurious hair, body and skin care designed for your everyday indulgence.',
    cta: { label: 'Shop Personal Care', href: '/category/personal-care' },
    bg: 'linear-gradient(135deg, #1f0512 0%, #4a0a2a 60%, #6b1040 100%)',
    dotColor: '#f9a8d4',
    accentStyle: { color: '#f9a8d4' },
    btnStyle: { background: '#f9a8d4', color: '#1f0512' },
    image: 'https://media.mlp.amway.eu/sys-master/images/h32/h3b/14256225779742/125901_1_IMAGE_product-image_600_600.jpg',
    image2: 'https://media.mlp.amway.eu/sys-master/images/hce/h4c/9345295384606/IMAGE_product-image_90_90_124822_1.jpg',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [hovered, setHovered] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setAnimKey((k) => k + 1);
  }, []);

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (hovered) return;
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next, hovered]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative flex min-h-[70vh] overflow-hidden sm:min-h-[88vh]"
      style={{ background: slide.bg, transition: 'background 0.9s ease' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
      />

      {/* Text content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-14 sm:px-12 sm:py-20 lg:max-w-[52%] lg:px-16 xl:px-24">
        <p
          key={`overline-${animKey}`}
          className="animate-fade-up mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] sm:mb-4 sm:text-xs"
          style={slide.accentStyle}
        >
          {slide.overline}
        </p>

        <h1
          key={`headline-${animKey}`}
          className="animate-fade-up-delay font-display whitespace-pre-line text-[2.75rem] font-bold leading-[1.0] text-white sm:text-6xl xl:text-[5.5rem]"
        >
          {slide.headline}
        </h1>

        <p
          key={`body-${animKey}`}
          className="animate-fade-up-delay-2 mt-4 max-w-xs text-sm leading-relaxed text-white/60 sm:mt-6 sm:max-w-sm"
        >
          {slide.body}
        </p>

        <div
          key={`cta-${animKey}`}
          className="animate-fade-up-delay-2 mt-7 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4"
        >
          <Link
            href={slide.cta.href}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all hover:scale-[1.02] sm:px-8 sm:py-3.5 sm:text-sm"
            style={slide.btnStyle}
          >
            {slide.cta.label}
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {/* Slide counter */}
        <div className="mt-10 flex items-center gap-2 sm:mt-16">
          <span className="text-xs font-bold text-white" style={slide.accentStyle}>
            0{current + 1}
          </span>
          <span className="text-xs text-white/30">/</span>
          <span className="text-xs text-white/30">0{SLIDES.length}</span>
        </div>
      </div>

      {/* Product images — desktop only */}
      <div className="relative hidden flex-1 lg:flex lg:items-center lg:justify-center">
        <div
          className="absolute h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: slide.accentStyle.color }}
        />
        <div
          key={`img1-${animKey}`}
          className="animate-fade-up relative z-10 h-80 w-64 rotate-[-3deg] overflow-hidden bg-white/10 shadow-2xl backdrop-blur-sm"
          style={{ border: `1px solid ${slide.accentStyle.color}22` }}
        >
          <Image src={slide.image} alt={slide.overline} fill className="object-contain p-6" priority />
        </div>
        <div
          key={`img2-${animKey}`}
          className="animate-fade-up-delay absolute right-16 top-1/3 z-20 h-56 w-44 rotate-[5deg] overflow-hidden bg-white/10 shadow-2xl backdrop-blur-sm"
          style={{ border: `1px solid ${slide.accentStyle.color}33` }}
        >
          <Image src={slide.image2} alt={slide.overline} fill className="object-contain p-4" />
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:left-4 sm:h-10 sm:w-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:right-4 sm:h-10 sm:w-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-8">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:  i === current ? '20px' : '6px',
              height: '6px',
              background: i === current ? slide.accentStyle.color : 'rgba(255,255,255,0.3)',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32"
        style={{ background: 'linear-gradient(to top, #F9F7F4, transparent)' }}
      />
    </section>
  );
}
