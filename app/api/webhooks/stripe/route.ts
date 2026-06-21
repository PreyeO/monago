import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';
import { orderConfirmationHtml } from '@/lib/email/orderConfirmation';
import Stripe from 'stripe';

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
  }

  return NextResponse.json({ received: true });
}
