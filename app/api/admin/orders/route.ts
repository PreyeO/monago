import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
