'use client';

import { useState, useTransition } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export function NewsletterSignup() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || pending) return;

    startTransition(async () => {
      const result = await subscribeToNewsletter(email);
      if (result.success)                        setStatus('success');
      else if (result.error === 'already_subscribed') setStatus('duplicate');
      else                                       setStatus('error');
    });
  }

  if (status === 'success') {
    return (
      <section className="bg-zinc-900 py-14 sm:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 text-center">
          <CheckCircle className="mb-4 h-10 w-10 text-amber-400" />
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">You&rsquo;re in!</h2>
          <p className="mt-2 text-sm text-stone-400">Welcome to the Monago Circle. Expect great things in your inbox.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-900 py-14 sm:py-20">
      <div className="mx-auto max-w-xl px-4 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <Mail className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Join the Monago Circle
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Be first to hear about new arrivals and exclusive offers.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="Enter your email"
            className="h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Subscribing…' : 'Subscribe'}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {status === 'duplicate' && (
          <p className="mt-3 text-xs text-amber-400">You&rsquo;re already subscribed — we&rsquo;ll be in touch!</p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-xs text-red-400">Something went wrong. Please try again.</p>
        )}

        <p className="mt-4 text-[10px] text-zinc-600">No spam. Unsubscribe any time.</p>
      </div>
    </section>
  );
}
