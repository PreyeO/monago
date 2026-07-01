'use client';

/**
 * Client-side Meta tracking.
 *
 * Fires the browser Pixel event, then (unless `browserOnly`) forwards the same
 * event — with the SAME event_id — to our server so the Conversions API can send
 * its server-side copy. Meta deduplicates the pair via the shared event_id.
 *
 * Purchase is sent `browserOnly` from the browser: its authoritative server-side
 * copy comes from the Stripe webhook, so the order value can never be spoofed
 * from the client.
 */

type EventName = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';
type CustomData = Record<string, unknown>;

function newEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function trackEvent(
  eventName: EventName,
  customData: CustomData = {},
  opts: { eventId?: string; sourceUrl?: string; browserOnly?: boolean } = {}
): void {
  const eventId = opts.eventId ?? newEventId();

  // 1. Browser Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, customData, { eventID: eventId });
  }

  // 2. Server Conversions API (deduped by shared event_id)
  if (opts.browserOnly) return;

  const sourceUrl = opts.sourceUrl ?? (typeof window !== 'undefined' ? window.location.href : undefined);

  fetch('/api/meta/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId,
      customData,
      sourceUrl,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    }),
    keepalive: true,
  }).catch(() => {
    /* pixel already fired; ignore network errors */
  });
}
