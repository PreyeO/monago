import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-zinc-900">Privacy Policy</h1>
      <p className="mt-3 text-sm text-stone-500">Last updated: June 2025</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700">

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">1. Who we are</h2>
          <p>Monago is an online store based in the United Kingdom selling premium wellness, beauty, nutrition, and home care products. References to "we", "us", or "our" in this policy refer to Monago.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">2. What information we collect</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Order information</strong> — name, email address, delivery address, and payment details when you place an order.</li>
            <li><strong>Account data</strong> — email address if you subscribe to our newsletter.</li>
            <li><strong>Usage data</strong> — pages visited, browser type, and device information collected automatically via cookies.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">3. How we use your information</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To process and fulfil your orders.</li>
            <li>To send order confirmations and shipping updates.</li>
            <li>To send marketing emails if you have opted in (you can unsubscribe at any time).</li>
            <li>To improve our website and customer experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">4. Payment processing</h2>
          <p>All payments are processed securely by <strong>Stripe</strong>. We do not store your card details on our servers. Stripe's privacy policy is available at <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">stripe.com/gb/privacy</a>.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">5. Sharing your information</h2>
          <p>We do not sell or rent your personal data. We share information only with trusted third parties necessary to operate our service (e.g. payment processors, delivery partners), and only to the extent required.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">6. Cookies</h2>
          <p>We use essential cookies to keep your shopping cart active and to maintain your session. We do not use advertising or tracking cookies.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">7. Your rights</h2>
          <p>Under UK GDPR you have the right to access, correct, or delete your personal data at any time. To make a request, <a href="/contact" className="text-amber-600 hover:underline">fill in our contact form</a>.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">8. Changes to this policy</h2>
          <p>We may update this policy from time to time. The date at the top of this page will reflect any changes. Continued use of the site after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-900">9. Contact</h2>
          <p>Questions about this policy? <a href="/contact" className="text-amber-600 hover:underline">Fill in our contact form</a> and we'll get back to you.</p>
        </section>

      </div>
    </div>
  );
}
