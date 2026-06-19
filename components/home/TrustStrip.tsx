import { Package, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const STATS = [
  { icon: Package,     stat: '288 Products',      sub: 'Curated for wellness'    },
  { icon: Truck,       stat: 'Free UK Delivery',  sub: 'On orders over £50'      },
  { icon: RotateCcw,   stat: '30-Day Returns',    sub: 'No questions asked'      },
  { icon: ShieldCheck, stat: 'Secure Checkout',   sub: 'Encrypted via Stripe'    },
];

export function TrustStrip() {
  return (
    <div className="border-y border-stone-200 bg-[#F9F7F4]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-stone-200 lg:grid-cols-4 lg:divide-y-0">
        {STATS.map(({ icon: Icon, stat, sub }) => (
          <div key={stat} className="flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Icon className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 sm:text-sm">{stat}</p>
              <p className="text-[10px] text-stone-400 sm:text-xs">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
