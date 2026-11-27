import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Live payment/refund figures from Stripe (in pounds). Null if Stripe can't be reached.
  let payment: { paid: number; refunded: number; status: string } | null = null;
  if (data.stripe_payment_intent_id) {
    try {
      const pi = await stripe.paymentIntents.retrieve(data.stripe_payment_intent_id, { expand: ['latest_charge'] });
      const charge = pi.latest_charge as Stripe.Charge | null;
      payment = {
        paid:     (pi.amount_received ?? 0) / 100,
        refunded: (charge?.amount_refunded ?? 0) / 100,
        status:   pi.status,
      };
    } catch (err) {
      console.error('admin order: could not load Stripe payment', err);
    }
  }

  return NextResponse.json({ order: data, payment });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const { status } = await req.json();
  const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
