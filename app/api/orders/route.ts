import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';
import { CartItem, ShippingAddress } from '@/types';

interface CreateOrderBody {
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderBody = await req.json();
    const { customerName, customerEmail, shippingAddress, items } = body;

    if (!items?.length) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    const supabase = createServerClient();
    const ids = items.map((i) => i.productId);

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, selling_price, name, brand, amway_code, is_active')
      .in('id', ids);

    if (prodError || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.selling_price) throw new Error(`Product ${item.productId} not found`);
      subtotal += product.selling_price * item.quantity;
      return {
        productId: item.productId,
        amway_code: product.amway_code,
        name: product.name ?? item.name,
        brand: product.brand ?? item.brand,
        quantity: item.quantity,
        unit_price: product.selling_price,
      };
    });

    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;
    const totalPence = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
    });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        shipping_address: shippingAddress,
        items: orderItems,
        subtotal,
        total,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId: order.id });
  } catch (err) {
    console.error('orders POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
