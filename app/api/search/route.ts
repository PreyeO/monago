import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json([]);

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, amway_code, name, brand, selling_price, image_urls, stock_status, category:categories(id, name, slug, parent_id, is_active)')
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
    .order('selling_price', { ascending: false })
    .limit(18);

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data ?? []);
}
