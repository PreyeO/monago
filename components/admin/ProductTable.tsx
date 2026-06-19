'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, pick90Image } from '@/lib/utils';
import { Badge, Button, Spinner } from '@/components/ui';
import { useAdminProducts, useUpdateProduct } from '@/hooks/useAdmin';

export function ProductTable() {
  const { data: products = [], isLoading } = useAdminProducts();
  const updateProduct = useUpdateProduct();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? (products as Product[]).filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.amway_code?.toLowerCase().includes(q)
        );
      })
    : (products as Product[]);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditPrice((product.selling_price ?? 0).toFixed(2));
  }

  async function savePrice(id: string) {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) return;
    await updateProduct.mutateAsync({ id, update: { selling_price: price } });
    setEditingId(null);
  }

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, brand or code…"
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Code</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Source</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Selling Price</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Stock</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Active</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.length === 0 && (
            <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">No products match &ldquo;{query}&rdquo;</td></tr>
          )}
          {filtered.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={pick90Image(product.image_urls)}
                      alt={product.name ?? ''}
                      fill
                      sizes="40px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.brand}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{product.amway_code}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{formatPrice(product.source_price)}</td>
              <td className="px-4 py-3">
                {editingId === product.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">£</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => savePrice(product.id)} loading={updateProduct.isPending}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(product)}
                    className="text-sm font-medium text-slate-900 hover:text-amber-600"
                  >
                    {formatPrice(product.selling_price)}
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge variant={product.stock_status === 'inStock' ? 'success' : 'danger'}>
                  {product.stock_status === 'inStock' ? 'In Stock' : 'Out'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => updateProduct.mutate({ id: product.id, update: { is_active: !product.is_active } })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    product.is_active ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      product.is_active ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </td>
              <td className="px-4 py-3">
                {product.amway_url && (
                  <a
                    href={`https://www.amway.co.uk${product.amway_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Amway ↗
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
