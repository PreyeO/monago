import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';

interface RequestItem {
  productId: string;
  qty: number;
}

export async function POST(req: NextRequest) {
  try {
    const { items }: { items: RequestItem[] } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const supabase = createServerClient();
    const ids = items.map((i) => i.productId);

    const { data: products, error } = await supabase
      .from('products')
      .select('id, selling_price, name, is_active, stock_status')
      .in('id', ids);

    if (error || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    let subtotal = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.is_active || !product.selling_price) {
        return NextResponse.json({ error: `Product ${item.productId} unavailable` }, { status: 400 });
      }
      subtotal += product.selling_price * item.qty;
    }

    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;
    const totalPence = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: { itemCount: items.length.toString() },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('create-payment-intent error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
