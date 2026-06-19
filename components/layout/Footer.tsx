import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories';

function MonagoLogoWhite() {
  return (
    <span className="flex items-baseline gap-0.5 select-none">
      <span className="font-display text-[26px] font-bold leading-none text-amber-400">M</span>
      <span className="font-display text-[22px] font-semibold tracking-[0.15em] uppercase text-white">onago</span>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-stone-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <MonagoLogoWhite />
            <p className="mt-4 text-sm leading-relaxed text-stone-500">
              Premium wellness products curated and delivered across the UK.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">Shop</h3>
            <ul className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-stone-500 transition-colors hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">Help</h3>
            <ul className="space-y-2.5 text-sm text-stone-500">
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">Legal</h3>
            <ul className="space-y-2.5 text-sm text-stone-500">
              <li><Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms"   className="transition-colors hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-8 text-xs text-stone-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Monago. All rights reserved.</p>
          <a
            href="https://letscr8t.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-stone-400"
          >
            Designed & built by <span className="text-amber-500">LetsCr8t</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
