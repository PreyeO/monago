import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

// What the admin product form sends. Every field is optional so the same schema
// works for edits that only send what changed; create checks required fields itself.
export const productInputSchema = z.object({
  amway_code:     z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/, 'Code may only contain letters, numbers, - and _'),
  name:           z.string().trim().min(1, 'Name is required').max(200),
  brand:          z.string().trim().max(100).nullable(),
  size:           z.string().trim().max(60).nullable(),
  category_id:    z.string().uuid().nullable(),
  description:    z.string().trim().max(1000).nullable(),
  overview_text:  z.string().max(20000).nullable(),
  details_text:   z.string().max(20000).nullable(),
  features:       z.array(z.string().trim().min(1).max(300)).max(30).nullable(),
  video_url:      z.string().trim().max(500).nullable(),
  image_urls:     z.array(z.string().trim().max(1000)).max(20),
  source_price:   z.number().min(0).max(100000).nullable(),
  price_mode:     z.enum(['markup', 'custom']),
  selling_price:  z.number().positive().max(100000).nullable(),
  stock_status:   z.enum(['inStock', 'outOfStock']),
  is_active:      z.boolean(),
  is_most_loved:  z.boolean(),
}).partial();

export type ProductInput = z.infer<typeof productInputSchema>;

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Plain text from the form → safe HTML for the product page.
// Blank line = new paragraph; lines starting with "-", "*" or "•" become a bullet list.
export function textToHtml(text: string | null | undefined): string | null {
  const t = (text ?? '').replace(/\r\n/g, '\n').trim();
  if (!t) return null;
  return t
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length && lines.every((l) => /^[-*•]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${escapeHtml(l.replace(/^[-*•]\s+/, ''))}</li>`).join('')}</ul>`;
      }
      return `<p>${lines.map(escapeHtml).join('<br>')}</p>`;
    })
    .join('');
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function getGlobalMarkup(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase.from('settings').select('value').eq('key', 'global_markup').single();
  const n = data ? parseFloat(data.value) : NaN;
  return isNaN(n) ? 30 : n;
}

/**
 * Turn validated form input into a products-table update.
 * `current` is the existing row on edit (null on create) so pricing can use stored values
 * for fields the form didn't send.
 */
export async function toProductRow(
  input: ProductInput,
  supabase: SupabaseClient,
  current: { source_price: number | null; selling_price: number | null } | null,
): Promise<{ row: Record<string, unknown>; error?: string }> {
  const row: Record<string, unknown> = {};
  const nullIfEmpty = (v: string | null | undefined) => (v == null || v === '' ? null : v);

  if (input.amway_code !== undefined) row.amway_code = input.amway_code;
  if (input.name !== undefined) row.name = input.name;
  if (input.brand !== undefined) row.brand = nullIfEmpty(input.brand);
  if (input.size !== undefined) row.size = nullIfEmpty(input.size);
  if (input.category_id !== undefined) row.category_id = input.category_id;
  if (input.description !== undefined) row.description = nullIfEmpty(input.description);
  if (input.overview_text !== undefined) row.overview = textToHtml(input.overview_text);
  if (input.details_text !== undefined) row.details = textToHtml(input.details_text);
  if (input.features !== undefined) row.features = input.features && input.features.length ? input.features : null;
  if (input.stock_status !== undefined) row.stock_status = input.stock_status;
  if (input.is_active !== undefined) row.is_active = input.is_active;
  if (input.is_most_loved !== undefined) row.is_most_loved = input.is_most_loved;

  if (input.video_url !== undefined) {
    const v = nullIfEmpty(input.video_url);
    if (v && !/^https:\/\//i.test(v)) return { row, error: 'Video link must start with https://' };
    row.video_url = v;
  }

  if (input.image_urls !== undefined) {
    const bad = input.image_urls.find((u) => !/^https:\/\//i.test(u));
    if (bad) return { row, error: 'Image links must start with https://' };
    row.image_urls = input.image_urls;
  }

  // ---- pricing ----
  if (input.source_price !== undefined) row.source_price = input.source_price;
  const source = input.source_price !== undefined ? input.source_price : current?.source_price ?? null;

  if (input.price_mode === 'markup') {
    if (source == null || source <= 0) return { row, error: 'Enter the Amway price to use your markup' };
    const markup = await getGlobalMarkup(supabase);
    row.selling_price = round2(source * (1 + markup / 100));
    row.markup_override = null; // follows the global markup from now on
  } else if (input.price_mode === 'custom') {
    const selling = input.selling_price ?? current?.selling_price ?? null;
    if (selling == null || selling <= 0) return { row, error: 'Enter a selling price' };
    row.selling_price = round2(selling);
    // Remember her margin on this product so global markup changes don't overwrite her price,
    // and so it scales if the Amway price is updated later.
    row.markup_override = source && source > 0 ? round2((selling / source - 1) * 100) : null;
  }

  return { row };
}
