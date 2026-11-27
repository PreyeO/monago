import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';
import { OrderItem } from '@/types';

interface Params {
  params: Promise<{ id: string }>;
}

interface RefundBody {
  /** Refund everything not yet refunded (items + shipping). */
  full?: boolean;
  /** Refund one line item: unit_price × quantity. */
  itemIndex?: number;
  /** Also mark the refunded item(s) out of stock in the store. */
  markOutOfStock?: boolean;
}

// Refund amounts are always worked out here from the stored order, never taken from the browser.
export async function POST(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const body: RefundBody = await req.json().catch(() => ({}));

  const supabase = createServerClient();
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (!order.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'This order has no Stripe payment to refund' }, { status: 400 });
  }

  // What Stripe actually took and has already refunded
  let remainingPence: number;
  try {
    const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id, { expand: ['latest_charge'] });
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: `Payment is not completed (status: ${pi.status}) — nothing to refund` }, { status: 400 });
    }
    const charge = pi.latest_charge as Stripe.Charge | null;
    remainingPence = (pi.amount_received ?? 0) - (charge?.amount_refunded ?? 0);
  } catch (err) {
    console.error('refund: failed to load payment', err);
    return NextResponse.json({ error: 'Could not load the payment from Stripe' }, { status: 502 });
  }
  if (remainingPence <= 0) {
    return NextResponse.json({ error: 'This order has already been fully refunded' }, { status: 400 });
  }

  const items: (OrderItem & { refunded?: boolean })[] = Array.isArray(order.items) ? order.items : [];
  let amountPence: number;
  let refundedIdx: number[];

  if (body.full) {
    amountPence = remainingPence;
    refundedIdx = items.map((_, i) => i).filter((i) => !items[i].refunded);
  } else if (typeof body.itemIndex === 'number') {
    const item = items[body.itemIndex];
    if (!item) return NextResponse.json({ error: 'Item not found on this order' }, { status: 400 });
    if (item.refunded) return NextResponse.json({ error: 'This item has already been refunded' }, { status: 400 });
    amountPence = Math.min(Math.round(item.unit_price * item.quantity * 100), remainingPence);
    refundedIdx = [body.itemIndex];
  } else {
    return NextResponse.json({ error: 'Specify full or itemIndex' }, { status: 400 });
  }

  let refund: Stripe.Refund;
  try {
    refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      amount: amountPence,
      reason: 'requested_by_customer',
      metadata: { order_id: order.id, scope: body.full ? 'full' : `item:${body.itemIndex}` },
    });
  } catch (err) {
    console.error('refund: Stripe refund failed', err);
    const msg = err instanceof Error ? err.message : 'Stripe refund failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Record which items were refunded; cancel the order once everything is refunded.
  const updatedItems = items.map((it, i) => (refundedIdx.includes(i) ? { ...it, refunded: true } : it));
  const fullyRefunded = amountPence >= remainingPence;
  const { error: updErr } = await supabase
    .from('orders')
    .update({ items: updatedItems, ...(fullyRefunded ? { status: 'cancelled' } : {}) })
    .eq('id', order.id);
  if (updErr) console.error('refund: money refunded but order not updated', order.id, updErr);

  if (body.markOutOfStock) {
    const codes = refundedIdx.map((i) => items[i]?.amway_code).filter(Boolean);
    if (codes.length) {
      const { error: stockErr } = await supabase
        .from('products')
        .update({ stock_status: 'outOfStock' })
        .in('amway_code', codes);
      if (stockErr) console.error('refund: could not mark out of stock', stockErr);
    }
  }

  return NextResponse.json({
    refunded: amountPence / 100,
    refundId: refund.id,
    fullyRefunded,
  });
}
