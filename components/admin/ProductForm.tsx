'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ChevronLeft, ImagePlus, Link2, Star, Trash2 } from 'lucide-react';
import { Category, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button, Input, Spinner } from '@/components/ui';
import { useGlobalMarkup } from '@/hooks/useAdmin';

// ---------- helpers ----------

// Stored overview/details are HTML (from Amway or from this form). Show them as plain text to edit.
function htmlToText(html: string | null): string {
  if (!html) return '';
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\n- ')
    .replace(/<\/\s*(p|div|h[1-6]|ul|ol|tr)\s*>/gi, '\n\n');
  const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
  return (doc.body.textContent ?? '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Shrink photos in the browser before upload: faster, and stays under Vercel's request size limit.
async function resizeImage(file: File, maxSide = 1600): Promise<Blob> {
  if (file.type === 'image/gif') return file; // keep animation
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff'; // JPEG has no transparency — use a white background
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.85)
  );
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const toNum = (s: string) => (s.trim() === '' ? null : Number(s));

interface FormState {
  amway_code: string;
  name: string;
  brand: string;
  size: string;
  category_id: string;
  description: string;
  overview_text: string;
  details_text: string;
  features_text: string;
  video_url: string;
  image_urls: string[];
  source_price: string;
  price_mode: 'markup' | 'custom';
  selling_price: string;
  stock_status: 'inStock' | 'outOfStock';
  is_active: boolean;
  is_most_loved: boolean;
}

function initialState(p: Product | null, markup: number): FormState {
  if (!p) {
    return {
      amway_code: '', name: '', brand: '', size: '', category_id: '',
      description: '', overview_text: '', details_text: '', features_text: '', video_url: '',
      image_urls: [], source_price: '', price_mode: 'markup', selling_price: '',
      stock_status: 'inStock', is_active: true, is_most_loved: false,
    };
  }
  // Use "markup" mode only if the stored price really is the global markup price.
  const followsMarkup =
    p.markup_override == null &&
    p.source_price != null &&
    p.selling_price != null &&
    Math.abs(round2(p.source_price * (1 + markup / 100)) - p.selling_price) < 0.011;
  return {
    amway_code:    p.amway_code,
    name:          p.name ?? '',
    brand:         p.brand ?? '',
    size:          p.size ?? '',
    category_id:   p.category_id ?? '',
    description:   p.description ?? '',
    overview_text: htmlToText(p.overview),
    details_text:  htmlToText(p.details),
    features_text: (p.features ?? []).join('\n'),
    video_url:     p.video_url ?? '',
    image_urls:    p.image_urls ?? [],
    source_price:  p.source_price != null ? String(p.source_price) : '',
    price_mode:    followsMarkup ? 'markup' : 'custom',
    selling_price: p.selling_price != null ? p.selling_price.toFixed(2) : '',
    stock_status:  p.stock_status === 'inStock' ? 'inStock' : 'outOfStock',
    is_active:     p.is_active,
    is_most_loved: p.is_most_loved ?? false,
  };
}

function toPayload(s: FormState) {
  return {
    amway_code:    s.amway_code.trim(),
    name:          s.name.trim(),
    brand:         s.brand.trim() || null,
    size:          s.size.trim() || null,
    category_id:   s.category_id || null,
    description:   s.description.trim() || null,
    overview_text: s.overview_text,
    details_text:  s.details_text,
    features:      s.features_text.split('\n').map((l) => l.trim()).filter(Boolean),
    video_url:     s.video_url.trim() || null,
    image_urls:    s.image_urls,
    source_price:  toNum(s.source_price),
    price_mode:    s.price_mode,
    selling_price: toNum(s.selling_price),
    stock_status:  s.stock_status,
    is_active:     s.is_active,
    is_most_loved: s.is_most_loved,
  };
}

const PRICE_KEYS = ['source_price', 'price_mode', 'selling_price'] as const;

// ---------- component ----------

export function ProductForm({ product }: { product: Product | null }) {
  const isEdit = !!product;
  const router = useRouter();
  const qc = useQueryClient();
  const { data: markup, isLoading: markupLoading } = useGlobalMarkup();

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      return ((await res.json()) as { categories: Category[] }).categories;
    },
  });

  const [form, setForm] = useState<FormState | null>(null);
  const initialPayload = useRef<ReturnType<typeof toPayload> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [pasteUrl, setPasteUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Build the form once the markup is known (needed to pick the pricing mode).
  useEffect(() => {
    if (form || markup == null) return;
    const s = initialState(product, markup);
    initialPayload.current = toPayload(s);
    setForm(s);
  }, [form, markup, product]);

  const categoryOptions = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_id);
    const out: { id: string; label: string }[] = [];
    for (const p of parents) {
      const kids = categories.filter((c) => c.parent_id === p.id);
      if (kids.length === 0) out.push({ id: p.id, label: p.name });
      for (const k of kids) out.push({ id: k.id, label: `${p.name} › ${k.name}` });
    }
    // categories whose parent isn't in the list
    for (const c of categories) {
      if (c.parent_id && !categories.some((p) => p.id === c.parent_id)) out.push({ id: c.id, label: c.name });
    }
    return out;
  }, [categories]);

  if (!form || markupLoading || markup == null) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const source = toNum(form.source_price);
  const markupPrice = source != null && source > 0 ? round2(source * (1 + markup / 100)) : null;
  const sellingNum = toNum(form.selling_price);
  const margin = source != null && source > 0 && sellingNum ? round2((sellingNum / source - 1) * 100) : null;

  // ---- images ----
  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    for (const file of Array.from(files)) {
      setUploading((n) => n + 1);
      try {
        const blob = await resizeImage(file);
        const fd = new FormData();
        fd.append('file', blob, file.name.replace(/\.[^.]+$/, '') + (blob.type === 'image/gif' ? '.gif' : '.jpg'));
        const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? 'Upload failed');
        setForm((f) => (f ? { ...f, image_urls: [...f.image_urls, json.url] } : f));
      } catch (err) {
        setError(`${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = '';
  }

  async function addFromLink() {
    const url = pasteUrl.trim();
    if (!url) return;
    setError(null);
    setUploading((n) => n + 1);
    try {
      const res = await fetch('/api/admin/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Could not add image');
      setForm((f) => (f ? { ...f, image_urls: [...f.image_urls, json.url] } : f));
      setPasteUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add image');
    } finally {
      setUploading((n) => n - 1);
    }
  }

  function moveImage(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (!form || j < 0 || j >= form.image_urls.length) return;
    const next = [...form.image_urls];
    [next[i], next[j]] = [next[j], next[i]];
    set('image_urls', next);
  }

  // ---- save ----
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);

    const payload = toPayload(form);
    if (!payload.name) return setError('Please enter a product name');
    if (!isEdit && !payload.amway_code) return setError('Please enter the Amway product code');
    if (payload.price_mode === 'markup' && !(payload.source_price && payload.source_price > 0)) {
      return setError('Enter the Amway price to use your markup, or choose "Set my own price"');
    }
    if (payload.price_mode === 'custom' && !(payload.selling_price && payload.selling_price > 0)) {
      return setError('Enter a selling price');
    }

    let body: Record<string, unknown> = payload;
    if (isEdit && initialPayload.current) {
      // Only send what changed, so untouched Amway descriptions keep their original formatting.
      const init = initialPayload.current as Record<string, unknown>;
      const changed: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(payload)) {
        if (JSON.stringify(v) !== JSON.stringify(init[k])) changed[k] = v;
      }
      if (PRICE_KEYS.some((k) => k in changed)) {
        for (const k of PRICE_KEYS) changed[k] = payload[k];
      }
      delete changed.amway_code;
      if (Object.keys(changed).length === 0) {
        router.push('/admin/products');
        return;
      }
      body = changed;
    }

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Could not save product');
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product');
      setSaving(false);
    }
  }

  const textareaCls =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900';
  const labelCls = 'text-sm font-medium text-slate-700';
  const card = 'rounded-xl border border-slate-200 bg-white p-5 space-y-4';

  return (
    <form onSubmit={save} className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Products
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? `Edit: ${product!.name ?? product!.amway_code}` : 'Add product'}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---------- left: content ---------- */}
        <div className="space-y-6 lg:col-span-2">
          <section className={card}>
            <h2 className="font-semibold text-slate-900">Basics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Amway product code *"
                value={form.amway_code}
                onChange={(e) => set('amway_code', e.target.value)}
                disabled={isEdit}
                hint={isEdit ? 'The code cannot be changed after the product is created.' : 'The code from Amway, e.g. 125517. Used in order emails and "View on Amway" links.'}
                required={!isEdit}
              />
              <Input label="Product name *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <Input label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Nutrilite, Artistry" />
              <Input label="Size" value={form.size} onChange={(e) => set('size', e.target.value)} placeholder="e.g. 30 ml, 60 tablets" />
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={labelCls} htmlFor="category">Category</label>
                <select
                  id="category"
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  className={textareaCls}
                >
                  <option value="">— No category —</option>
                  {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className={card}>
            <h2 className="font-semibold text-slate-900">Description</h2>
            <div className="flex flex-col gap-1">
              <label className={labelCls} htmlFor="description">Short description</label>
              <textarea id="description" rows={3} maxLength={1000} className={textareaCls}
                value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="One or two sentences shown under the price." />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls} htmlFor="overview">Overview</label>
              <textarea id="overview" rows={6} className={textareaCls}
                value={form.overview_text} onChange={(e) => set('overview_text', e.target.value)}
                placeholder="What the product is and why customers will love it." />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls} htmlFor="details">Details</label>
              <textarea id="details" rows={6} className={textareaCls}
                value={form.details_text} onChange={(e) => set('details_text', e.target.value)}
                placeholder="How to use, ingredients, warnings…" />
            </div>
            <p className="text-xs text-slate-500">
              Tip: leave a blank line between paragraphs. Start lines with &ldquo;- &rdquo; to make a bullet list.
            </p>
            <div className="flex flex-col gap-1">
              <label className={labelCls} htmlFor="features">Key features <span className="font-normal text-slate-400">(one per line)</span></label>
              <textarea id="features" rows={4} className={textareaCls}
                value={form.features_text} onChange={(e) => set('features_text', e.target.value)}
                placeholder={'Vegan friendly\nNo artificial colours'} />
            </div>
            <Input label="Video link (optional)" value={form.video_url} onChange={(e) => set('video_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…" />
          </section>

          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Images</h2>
              {uploading > 0 && <span className="flex items-center gap-2 text-xs text-slate-500"><Spinner size="sm" /> Uploading…</span>}
            </div>
            <p className="text-xs text-slate-500">The first image is the main photo shown in the shop.</p>

            {form.image_urls.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {form.image_urls.map((url, i) => (
                  <li key={url + i} className="relative rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="aspect-square w-full rounded object-contain" />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        <Star className="h-3 w-3" /> Main
                      </span>
                    )}
                    <div className="mt-1 flex justify-between">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30" title="Move earlier">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.image_urls.length - 1}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30" title="Move later">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button type="button" onClick={() => set('image_urls', form.image_urls.filter((_, j) => j !== i))}
                        className="rounded p-1 text-red-500 hover:bg-red-50" title="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple
                  className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                  <ImagePlus className="h-4 w-4" /> Upload photos
                </Button>
              </div>
              <div className="flex flex-1 gap-2">
                <input type="url" value={pasteUrl} onChange={(e) => setPasteUrl(e.target.value)}
                  placeholder="…or paste an image link" className={textareaCls}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFromLink(); } }} />
                <Button type="button" variant="ghost" size="sm" onClick={addFromLink} disabled={!pasteUrl.trim()}>
                  <Link2 className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* ---------- right: price & visibility ---------- */}
        <div className="space-y-6">
          <section className={card}>
            <h2 className="font-semibold text-slate-900">Price</h2>
            <Input label="Amway price (your cost) £" type="number" step="0.01" min="0" inputMode="decimal"
              value={form.source_price} onChange={(e) => set('source_price', e.target.value)}
              hint="What Amway charges you. Update this when Amway changes the price." />

            <fieldset className="space-y-2">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="radio" name="price_mode" className="mt-1" checked={form.price_mode === 'markup'}
                  onChange={() => set('price_mode', 'markup')} />
                <span>
                  Use my markup ({markup}%)
                  <span className="block text-xs text-slate-500">
                    {markupPrice != null ? `Customers pay ${formatPrice(markupPrice)}. Changes automatically if you change your markup.` : 'Enter the Amway price above.'}
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="radio" name="price_mode" className="mt-1" checked={form.price_mode === 'custom'}
                  onChange={() => {
                    set('price_mode', 'custom');
                    if (!form.selling_price && markupPrice != null) set('selling_price', markupPrice.toFixed(2));
                  }} />
                <span>Set my own price</span>
              </label>
            </fieldset>

            {form.price_mode === 'custom' && (
              <Input label="Selling price £" type="number" step="0.01" min="0.01" inputMode="decimal"
                value={form.selling_price} onChange={(e) => set('selling_price', e.target.value)}
                hint={margin != null ? `That's a ${margin}% markup on the Amway price.` : undefined} />
            )}
            {form.price_mode === 'custom' && margin != null && margin < 5 && (
              <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
                Low margin: after Stripe fees and delivery you may make little or lose money on this product.
              </p>
            )}
          </section>

          <section className={card}>
            <h2 className="font-semibold text-slate-900">Visibility</h2>
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>In stock</span>
              <input type="checkbox" className="h-4 w-4" checked={form.stock_status === 'inStock'}
                onChange={(e) => set('stock_status', e.target.checked ? 'inStock' : 'outOfStock')} />
            </label>
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>Show in shop</span>
              <input type="checkbox" className="h-4 w-4" checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)} />
            </label>
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>&ldquo;Most loved&rdquo; product</span>
              <input type="checkbox" className="h-4 w-4" checked={form.is_most_loved}
                onChange={(e) => set('is_most_loved', e.target.checked)} />
            </label>
          </section>
        </div>
      </div>

      {/* sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3">
          {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
          <Link href="/admin/products" className="text-sm text-slate-500 hover:text-slate-900">Cancel</Link>
          <Button type="submit" loading={saving} disabled={uploading > 0}>
            {isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </div>
    </form>
  );
}
