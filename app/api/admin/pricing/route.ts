import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const supabase = createServerClient();
  const { data } = await supabase.from('settings').select('value').eq('key', 'global_markup').single();
  return NextResponse.json({ markup: data ? parseFloat(data.value) : 30 });
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { markup } = await req.json();
  if (typeof markup !== 'number' || markup < 0) {
    return NextResponse.json({ error: 'Invalid markup' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Save setting
  await supabase
    .from('settings')
    .upsert({ key: 'global_markup', value: markup.toString() });

  // Recalculate selling_price for products without markup_override
  const { data: products } = await supabase
    .from('products')
    .select('id, source_price, markup_override')
    .not('source_price', 'is', null);

  if (products) {
    const updates = products
      .filter((p) => p.markup_override == null && p.source_price != null)
      .map((p) => ({
        id: p.id,
        selling_price: parseFloat((p.source_price * (1 + markup / 100)).toFixed(2)),
      }));

    for (const update of updates) {
      await supabase.from('products').update({ selling_price: update.selling_price }).eq('id', update.id);
    }
  }

  return NextResponse.json({ success: true, markup });
}
