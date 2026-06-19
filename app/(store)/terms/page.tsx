import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-zinc-900">Terms & Conditions</h1>
      <p className="mt-3 text-sm text-stone-500">Last updated: June 2025</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700">

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">1. About us</h2>
          <p>Monago is an online retail store operating in the United Kingdom. By using our website and placing orders, you agree to these terms.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">2. Products</h2>
          <p>We make every effort to display products accurately. Prices are shown in GBP and include VAT where applicable. We reserve the right to update prices without notice.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">3. Orders & payment</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Orders are confirmed once payment has been successfully processed via Stripe.</li>
            <li>We reserve the right to cancel any order if a product is out of stock or a pricing error is identified, in which case a full refund will be issued.</li>
            <li>All transactions are in GBP.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">4. Delivery</h2>
          <p>We offer free delivery on orders over £50. Delivery times are estimates only and may vary. We are not responsible for delays caused by couriers or circumstances beyond our control.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">5. Returns</h2>
          <p>You may return any item within 30 days of receipt provided it is unused and in its original packaging. To initiate a return, contact us at <a href="mailto:hello@monago.co.uk" className="text-amber-600 hover:underline">hello@monago.co.uk</a>. Refunds are processed within 5–10 business days of us receiving the returned item.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">6. Intellectual property</h2>
          <p>All content on this website — including logos, images, and text — is the property of Monago or its licensors. You may not reproduce any content without written permission.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">7. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, Monago shall not be liable for any indirect or consequential loss arising from the use of our website or products.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">8. Governing law</h2>
          <p>These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">9. Contact</h2>
          <p>For any queries, contact us at <a href="mailto:hello@monago.co.uk" className="text-amber-600 hover:underline">hello@monago.co.uk</a>.</p>
        </section>

      </div>
    </div>
  );
}
