import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';
import { productInputSchema, toProductRow } from '@/lib/admin/productInput';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = createServerClient();

  // Quick table actions (price click-edit, stock / active switches) — unchanged behaviour.
  const quickKeys = ['selling_price', 'is_active', 'markup_override', 'stock_status'];
  const isQuick = Object.keys(body).every((k) => quickKeys.includes(k));
  if (isQuick) {
    const update: Record<string, unknown> = {};
    for (const key of quickKeys) if (key in body) update[key] = body[key];
    if ('stock_status' in update && !['inStock', 'outOfStock'].includes(update.stock_status as string)) {
      return NextResponse.json({ error: 'Invalid stock_status' }, { status: 400 });
    }
    const { data, error } = await supabase.from('products').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data });
  }

  // Full edit from the product form.
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid product' }, { status: 400 });
  }
  const input = parsed.data;
  delete input.amway_code; // the code is fixed once created (orders and links depend on it)

  const { data: current, error: curErr } = await supabase
    .from('products')
    .select('source_price, selling_price')
    .eq('id', id)
    .single();
  if (curErr || !current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { row, error: rowError } = await toProductRow(input, supabase, current);
  if (rowError) return NextResponse.json({ error: rowError }, { status: 400 });
  if (Object.keys(row).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
