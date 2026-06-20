'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, X, ZoomIn } from 'lucide-react';

interface Props {
  images: string[];
  name: string;
  outOfStock?: boolean;
  videoUrl?: string | null;
}

type Slide = { type: 'image'; url: string } | { type: 'video'; url: string };

export function ProductImageGallery({ images, name, outOfStock, videoUrl }: Props) {
  const slides: Slide[] = [
    ...images.map((url) => ({ type: 'image' as const, url })),
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function goTo(i: number) { setActive(i); setPlaying(false); }
  function prev() { goTo((active - 1 + slides.length) % slides.length); }
  function next() { goTo((active + 1) % slides.length); }

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, active]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  }

  const slide = slides[active];

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-50"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide content */}
      {slide.type === 'image' ? (
        <button
          onClick={() => setLightbox(true)}
          className="group/zoom absolute inset-0 cursor-zoom-in"
          aria-label="Zoom image"
        >
          <Image
            key={slide.url}
            src={slide.url}
            alt={`${name} — image ${active + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-6 transition-opacity duration-300"
            priority={active === 0}
            quality={90}
          />
          <ZoomIn className="absolute bottom-3 right-3 h-4 w-4 text-zinc-400 opacity-0 transition-opacity group-hover/zoom:opacity-100" />
        </button>
      ) : playing ? (
        <video
          src={slide.url}
          autoPlay
          controls
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="relative h-full w-full">
          {images[0] && (
            <Image
              src={images[0]}
              alt={`${name} video thumbnail`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
              quality={90}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <button
              onClick={() => setPlaying(true)}
              aria-label="Play video"
              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="h-7 w-7 translate-x-0.5 fill-zinc-900 text-zinc-900" />
            </button>
          </div>
        </div>
      )}

      {/* Out of stock badge */}
      {outOfStock && slide.type === 'image' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
            Out of Stock
          </span>
        </div>
      )}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-1.5 opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5 text-zinc-700" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-1.5 opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5 text-zinc-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to ${s.type === 'video' ? 'video' : `image ${i + 1}`}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-5 bg-zinc-900' : 'w-1.5 bg-zinc-400/60'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightbox && slide.type === 'image' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image */}
          <div
            className="relative h-full max-h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={slide.url}
              alt={name}
              fill
              sizes="90vw"
              className="object-contain"
              quality={90}
              priority
            />
          </div>

          {/* Lightbox arrows */}
          {slides.filter(s => s.type === 'image').length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50">
            {active + 1} / {slides.filter(s => s.type === 'image').length}
          </p>
        </div>
      )}
    </div>
  );
}
