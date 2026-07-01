import 'server-only';
import crypto from 'node:crypto';

/**
 * Meta Conversions API (server-side) helper.
 *
 * The access token is a SECRET and must only ever be read here, on the server.
 * All personally identifiable info is SHA-256 hashed before it leaves our server,
 * exactly as Meta requires.
 *
 * Deduplication: every event carries an `eventId`. The browser Pixel fires the
 * same event with the same `eventID`, so Meta collapses the pair into one.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // optional — for Events Manager "Test Events" tab
const API_VERSION = 'v21.0';

type EventName = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';

function sha256(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function hashPhone(value?: string | null): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return undefined;
  return crypto.createHash('sha256').update(digits).digest('hex');
}

export interface CapiUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  county?: string | null;
  postcode?: string | null;
  country?: string | null;
  fbp?: string | null; // Meta browser cookie — sent raw, not hashed
  fbc?: string | null; // Meta click cookie — sent raw, not hashed
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
}

export interface CapiEvent {
  eventName: EventName;
  eventId: string;
  eventSourceUrl?: string;
  userData: CapiUserData;
  customData?: Record<string, unknown>;
}

export async function sendServerEvent(event: CapiEvent): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('[meta] Missing NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN — skipping CAPI event');
    return;
  }

  const u = event.userData;
  const user_data: Record<string, unknown> = {};

  const em = sha256(u.email);                          if (em) user_data.em = [em];
  const ph = hashPhone(u.phone);                       if (ph) user_data.ph = [ph];
  const fn = sha256(u.firstName);                      if (fn) user_data.fn = [fn];
  const ln = sha256(u.lastName);                       if (ln) user_data.ln = [ln];
  const ct = sha256(u.city?.replace(/\s/g, ''));       if (ct) user_data.ct = [ct];
  const st = sha256(u.county);                         if (st) user_data.st = [st];
  const zp = sha256(u.postcode?.replace(/\s/g, ''));   if (zp) user_data.zp = [zp];
  const cn = sha256(u.country);                        if (cn) user_data.country = [cn];

  if (u.fbp) user_data.fbp = u.fbp;
  if (u.fbc) user_data.fbc = u.fbc;
  if (u.clientIpAddress) user_data.client_ip_address = u.clientIpAddress;
  if (u.clientUserAgent) user_data.client_user_agent = u.clientUserAgent;

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: 'website',
        user_data,
        custom_data: event.customData,
      },
    ],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      console.error('[meta] CAPI error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[meta] CAPI request failed:', err);
  }
}
