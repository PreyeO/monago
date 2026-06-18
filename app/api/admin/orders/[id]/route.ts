import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ order: data });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const { status } = await req.json();
  const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
