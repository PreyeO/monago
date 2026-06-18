'use client';

import { useRouter } from 'next/navigation';

interface Props {
  slug: string;
  subSlug: string;
  currentSort: string;
  inStock: boolean;
}

export function SubcategoryControls({ slug, subSlug, currentSort, inStock }: Props) {
  const router = useRouter();

  function update(sort: string, inStockOnly: boolean) {
    const params = new URLSearchParams();
    if (sort !== 'newest') params.set('sort', sort);
    if (inStockOnly) params.set('inStock', '1');
    const qs = params.toString();
    router.push(`/category/${slug}/${subSlug}${qs ? `?${qs}` : ''}`);
  }

  return (
    <div className="flex items-center gap-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => update(currentSort, e.target.checked)}
          className="rounded"
        />
        In stock only
      </label>
      <select
        value={currentSort}
        onChange={(e) => update(e.target.value, inStock)}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
