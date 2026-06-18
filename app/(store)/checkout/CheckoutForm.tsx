'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Input, Button } from '@/components/ui';
import { CartItem } from '@/components/cart/CartItem';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  line1: z.string().min(1, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  county: z.string().optional(),
  postcode: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof schema>;

function CheckoutInner() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Payment failed');
      setProcessing(false);
      return;
    }

    // Create order in Supabase first
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        shippingAddress: {
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          county: data.county,
          postcode: data.postcode,
          country: 'GB',
        },
        items,
      }),
    });

    if (!orderRes.ok) {
      setError('Failed to create order. Please try again.');
      setProcessing(false);
      return;
    }

    const { clientSecret, orderId } = await orderRes.json();

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed');
      setProcessing(false);
    }
    // On success, Stripe redirects to /order-success
  }

  const total = subtotal() + (subtotal() >= 50 ? 0 : 4.99);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-2">
      {/* Left — customer details */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Phone (optional)" type="tel" {...register('phone')} />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping Address</h2>
          <div className="space-y-4">
            <Input label="Address line 1" error={errors.line1?.message} {...register('line1')} />
            <Input label="Address line 2 (optional)" {...register('line2')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="City / Town" error={errors.city?.message} {...register('city')} />
              <Input label="County (optional)" {...register('county')} />
            </div>
            <Input label="Postcode" error={errors.postcode?.message} {...register('postcode')} />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment</h2>
          <PaymentElement />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={processing}>
          Pay {formatPrice(total)}
        </Button>
      </div>

      {/* Right — order summary */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100 px-5">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span>{subtotal() >= 50 ? 'Free' : formatPrice(4.99)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutInner />
    </Elements>
  );
}
