import type { Metadata } from 'next';
import { Mail, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Monago team. We\'re here to help with any questions about your order or our products.',
};

const INFO = [
  {
    icon: Mail,
    label: 'Get in touch',
    value: 'Use the form',
    sub: 'We reply within 24 hours',
  },
  {
    icon: MapPin,
    label: 'Based in',
    value: 'United Kingdom',
    sub: 'Serving customers across the UK',
  },
  {
    icon: Clock,
    label: 'Support hours',
    value: '24 hours a day',
    sub: '7 days a week',
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Get in touch</p>
        <h1 className="font-display mt-3 text-4xl font-bold text-zinc-900 sm:text-5xl">
          We'd love to hear from you
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
          Have a question about an order, a product, or just want to say hello? Fill in the form and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">

        {/* Info sidebar */}
        <div className="space-y-6 lg:col-span-2">
          {INFO.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <Icon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 lg:col-span-3">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Send us a message</h2>
          <ContactForm />
        </div>

      </div>
    </div>
  );
}
