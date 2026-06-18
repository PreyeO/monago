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

export function pick600Image(imageUrls: string[] | null): string {
  if (!imageUrls || imageUrls.length === 0) return '/placeholder-product.jpg';
  const img600 = imageUrls.find((url) => url.includes('600_600'));
  return img600 ?? imageUrls[0];
}

export function pick90Image(imageUrls: string[] | null): string {
  if (!imageUrls || imageUrls.length === 0) return '/placeholder-product.jpg';
  const img90 = imageUrls.find((url) => url.includes('90_90'));
  return img90 ?? imageUrls[0];
}
