'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Section {
  title: string;
  content: React.ReactNode;
}

export function ProductAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<string | null>(sections[0]?.title ?? null);

  return (
    <div className="divide-y divide-stone-100 border-t border-stone-100">
      {sections.map(({ title, content }) => (
        <div key={title}>
          <button
            onClick={() => setOpen(open === title ? null : title)}
            className="flex w-full cursor-pointer items-center justify-between py-4 text-left"
          >
            <span className="text-sm font-semibold text-zinc-900">{title}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 ${
                open === title ? 'rotate-180' : ''
              }`}
            />
          </button>
          {open === title && (
            <div className="pb-5 text-sm leading-relaxed text-slate-600">
              {content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
