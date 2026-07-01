import { NextRequest, NextResponse } from 'next/server';
import { sendServerEvent } from '@/lib/meta/capi';

// Purchase is intentionally NOT accepted here — its server event is sent from the
// Stripe webhook with a trusted order value. Only these browser-driven, no-money
// events are relayed to the Conversions API from the client.
const ALLOWED = new Set(['ViewContent', 'AddToCart', 'InitiateCheckout']);

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventId, customData, sourceUrl, fbp, fbc } = await req.json();

    if (!ALLOWED.has(eventName) || !eventId) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
    const ua = req.headers.get('user-agent') || undefined;

    await sendServerEvent({
      eventName,
      eventId,
      eventSourceUrl: sourceUrl,
      userData: { fbp, fbc, clientIpAddress: ip, clientUserAgent: ua },
      customData,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[meta] event route error:', err);
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}
