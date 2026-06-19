'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 'nutrition',
    image: '/nutrition.png',
    alt: 'Better Intake Better Health Better You — Nutrilite',
    cta: { label: 'Shop Nutrition', href: '/category/nutrition' },
    btnBg: '#7cb342',
    btnColor: '#fff',
    dotColor: '#7cb342',
  },
  {
    id: 'personal-care',
    image: '/personal-care.jpg',
    alt: 'Clean. Care. Confidence — Personal Care',
    cta: { label: 'Shop Personal Care', href: '/category/personal-care' },
    btnBg: '#9b59b6',
    btnColor: '#fff',
    dotColor: '#c084fc',
  },
  {
    id: 'beauty',
    image: '/skin-care.png',
    alt: 'Healthy skin. Timeless beauty. Lasting confidence.',
    cta: { label: 'Shop Beauty', href: '/category/beauty' },
    btnBg: '#c0714f',
    btnColor: '#fff',
    dotColor: '#fba987',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered]  = useState(false);

  const goTo = useCallback((idx: number) => setCurrent(idx), []);
  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (hovered) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next, hovered]);

  const slide = SLIDES[current];

  return (
    <section
      className="group/slider relative w-full overflow-hidden"
      style={{ aspectRatio: '16/9', maxHeight: '92vh', minHeight: '200px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-left sm:object-center"
          />
        </div>
      ))}

      {/* Bottom gradient scrim so CTA button always reads */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

      {/* CTA button — bottom left */}
      <div className="absolute bottom-6 left-5 z-20 sm:bottom-10 sm:left-10 lg:bottom-14 lg:left-14">
        <Link
          key={slide.id}
          href={slide.cta.href}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:px-8 sm:py-3.5 sm:text-sm"
          style={{ background: slide.btnBg, color: slide.btnColor }}
        >
          {slide.cta.label}
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:left-4 sm:h-10 sm:w-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:right-4 sm:h-10 sm:w-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Dot indicators — bottom centre */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-8">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="cursor-pointer rounded-full transition-all duration-300"
            style={{
              width:      i === current ? '22px' : '7px',
              height:     '7px',
              background: i === current ? slide.dotColor : 'rgba(255,255,255,0.45)',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
