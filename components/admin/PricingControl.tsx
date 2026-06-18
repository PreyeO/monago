'use client';

import { useState } from 'react';
import { useGlobalMarkup, useSetGlobalMarkup, useAdminProducts } from '@/hooks/useAdmin';
import { Input, Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export function PricingControl() {
  const { data: currentMarkup = 30 } = useGlobalMarkup();
  const { data: products = [] } = useAdminProducts();
  const setMarkup = useSetGlobalMarkup();

  const [markup, setMarkupValue] = useState<string>('');
  const [previewing, setPreviewing] = useState(false);

  const previewMarkup = parseFloat(markup) || currentMarkup;

  function handleApply() {
    const value = parseFloat(markup);
    if (isNaN(value) || value < 0) return;
    setMarkup.mutate(value);
    setMarkupValue('');
    setPreviewing(false);
  }

  return (
    <div className="space-y-8">
      {/* Markup input */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Global Markup %"
            type="number"
            min="0"
            step="0.1"
            placeholder={`Current: ${currentMarkup}%`}
            value={markup}
            onChange={(e) => { setMarkupValue(e.target.value); setPreviewing(true); }}
            hint="Applied to all products without an individual markup override"
          />
        </div>
        <Button
          onClick={() => setPreviewing(true)}
          variant="outline"
          disabled={!markup}
        >
          Preview
        </Button>
        <Button
          onClick={handleApply}
          disabled={!markup || setMarkup.isPending}
          loading={setMarkup.isPending}
        >
          Apply to All
        </Button>
      </div>

      {/* Preview table */}
      {previewing && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Preview at {previewMarkup}% markup
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500">Current</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500">New Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(products as Product[])
                  .filter((p) => p.markup_override == null && p.source_price != null)
                  .slice(0, 30)
                  .map((p) => {
                    const newPrice = (p.source_price ?? 0) * (1 + previewMarkup / 100);
                    const diff = newPrice - (p.selling_price ?? 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-900 line-clamp-1">{p.name}</td>
                        <td className="px-4 py-2 text-sm text-slate-600">{formatPrice(p.source_price)}</td>
                        <td className="px-4 py-2 text-sm text-slate-600">{formatPrice(p.selling_price)}</td>
                        <td className="px-4 py-2">
                          <span className="text-sm font-medium">{formatPrice(newPrice)}</span>
                          {diff !== 0 && (
                            <span className={`ml-2 text-xs ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {diff > 0 ? '+' : ''}{formatPrice(diff)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
