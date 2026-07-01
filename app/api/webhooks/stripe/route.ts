import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';
import { orderConfirmationHtml } from '@/lib/email/orderConfirmation';
import { sendServerEvent } from '@/lib/meta/capi';
import Stripe from 'stripe';

interface OrderItemRow {
  amway_code: string;
  quantity: number;
  unit_price: number;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const supabase = createServerClient();

    // Update order status to paid
    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('stripe_payment_intent_id', pi.id)
      .select('id, customer_name, customer_email, items, subtotal, total, shipping_address')
      .single();

    // Send order confirmation email
    if (order?.customer_email) {
      try {
        await resend.emails.send({
          from: 'Monago <orders@hello.monago.co.uk>',
          to: order.customer_email,
          subject: `Order confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
          html: orderConfirmationHtml({
            customerName:    order.customer_name,
            orderId:         order.id,
            items:           order.items,
            subtotal:        order.subtotal,
            total:           order.total,
            shippingAddress: order.shipping_address,
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr);
      }
    }

    // Authoritative server-side Purchase event (Meta Conversions API).
    // event_id = order.id dedupes against the browser Purchase on /order-success.
    if (order?.id) {
      const items = (order.items ?? []) as OrderItemRow[];
      const [firstName, ...rest] = (order.customer_name ?? '').trim().split(' ');
      const addr = order.shipping_address ?? {};
      await sendServerEvent({
        eventName: 'Purchase',
        eventId: order.id,
        eventSourceUrl: 'https://www.monago.co.uk/order-success',
        userData: {
          email:     order.customer_email,
          firstName: firstName,
          lastName:  rest.join(' '),
          city:      addr.city,
          county:    addr.county,
          postcode:  addr.postcode,
          country:   addr.country,
        },
        customData: {
          currency:     'GBP',
          value:        order.total,
          content_type: 'product',
          content_ids:  items.map((i) => i.amway_code),
          contents:     items.map((i) => ({ id: i.amway_code, quantity: i.quantity, item_price: i.unit_price })),
          num_items:    items.reduce((s, i) => s + i.quantity, 0),
          order_id:     order.id,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
