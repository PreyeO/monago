import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(pence: number | null | undefined): string {
  if (pence == null) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parsePriceString(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, ''));
}

export function getAmwayProductUrl(amwayUrl: string): string {
  return `https://www.amway.co.uk${amwayUrl}`;
}

function toScene7Size(url: string, size: number): string {
  if (url.includes('wid=')) {
    return url.replace(/wid=\d+/, `wid=${size}`).replace(/hei=\d+/, `hei=${size}`);
  }
  if (url.includes('/is/image/')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}wid=${size}&hei=${size}&fmt=jpg&fit=constrain`;
  }
  return url;
}

export function pick600Image(imageUrls: string[] | null): string {
  if (!imageUrls || imageUrls.length === 0) return '/placeholder-product.jpg';
  // Explicit 600_600 path-based variant
  const img600 = imageUrls.find((url) => url.includes('600_600'));
  if (img600) return img600;
  // Scene7 CDN: rewrite the size params to 600
  const base = imageUrls[0];
  if (base.includes('media.mlp.amway.eu')) return toScene7Size(base, 600);
  return base;
}

export function pick90Image(imageUrls: string[] | null): string {
  if (!imageUrls || imageUrls.length === 0) return '/placeholder-product.jpg';
  const img90 = imageUrls.find((url) => url.includes('90_90'));
  if (img90) return img90;
  const base = imageUrls[0];
  if (base.includes('media.mlp.amway.eu')) return toScene7Size(base, 90);
  return base;
}
