'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function clearAllOrders() {
  const supabase = createServerClient();
  const { data: orders } = await supabase.from('orders').select('id');
  const ids = (orders ?? []).map((o) => o.id);

  if (ids.length === 0) {
    return { success: true };
  }

  const { error } = await supabase.from('orders').delete().in('id', ids);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
