'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/admin',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products',  icon: Package },
  { href: '/admin/orders',   label: 'Orders',    icon: ShoppingBag },
  { href: '/admin/pricing',  label: 'Pricing',   icon: Tag },
];

function Logo() {
  return (
    <Link href="/" className="flex items-baseline gap-0.5 select-none">
      <span className="font-display text-[22px] font-bold leading-none text-amber-500">M</span>
      <span className="font-display text-[19px] font-semibold tracking-[0.15em] uppercase text-zinc-900">onago</span>
    </Link>
  );
}

function SidebarContent({ onNav }: { onNav: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <Logo />
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNav}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <SidebarContent onNav={() => {}} />
      </aside>

      {/* ── Mobile overlay ──────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-4 cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNav={() => setOpen(false)} />
      </aside>

      {/* ── Content area ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-auto">

        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="cursor-pointer rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
