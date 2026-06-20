'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

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
  const touchStartX = useRef<number | null>(null);

  function goTo(i: number) { setActive(i); setPlaying(false); }
  function prev() { goTo((active - 1 + slides.length) % slides.length); }
  function next() { goTo((active + 1) % slides.length); }

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
    </div>
  );
}
