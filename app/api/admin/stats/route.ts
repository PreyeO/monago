import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const supabase = createServerClient();

  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('total, status'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  const orders = ordersRes.data ?? [];
  const totalOrders = orders.length;
  const revenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total ?? 0), 0);
  const productCount = productsRes.count ?? 0;

  return NextResponse.json({ totalOrders, revenue, productCount });
}
