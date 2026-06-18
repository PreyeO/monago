import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Monago — Premium Wellness', template: '%s | Monago' },
  description: 'Discover premium beauty, nutrition, home and personal care products — curated and delivered across the UK.',
  metadataBase: new URL('https://monago.co.uk'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${cormorant.variable} ${inter.variable}`}>
      <body className="flex min-h-full flex-col antialiased font-[family-name:var(--font-body)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
