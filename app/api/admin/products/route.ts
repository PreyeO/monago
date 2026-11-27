import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';
import { productInputSchema, toProductRow } from '@/lib/admin/productInput';

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

// Create a product by hand from the admin form.
export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const parsed = productInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid product' }, { status: 400 });
  }
  const input = parsed.data;
  if (!input.amway_code) return NextResponse.json({ error: 'Amway code is required' }, { status: 400 });
  if (!input.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!input.price_mode) return NextResponse.json({ error: 'Choose how to price this product' }, { status: 400 });

  const supabase = createServerClient();

  const { data: clash } = await supabase
    .from('products')
    .select('id, name')
    .eq('amway_code', input.amway_code)
    .maybeSingle();
  if (clash) {
    return NextResponse.json(
      { error: `Code ${input.amway_code} is already used by "${clash.name ?? 'another product'}"` },
      { status: 409 }
    );
  }

  const { row, error: rowError } = await toProductRow(input, supabase, null);
  if (rowError) return NextResponse.json({ error: rowError }, { status: 400 });

  const { data, error } = await supabase
    .from('products')
    .insert({
      amway_url:    `/p/${input.amway_code}`,
      stock_status: 'inStock',
      is_active:    true,
      image_urls:   [],
      ...row,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
