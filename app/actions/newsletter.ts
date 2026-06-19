'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function subscribeToNewsletter(
  email: string,
): Promise<{ success: boolean; error?: 'already_subscribed' | 'invalid_email' | 'server_error' }> {
  const trimmed = email.toLowerCase().trim();

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: 'invalid_email' };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: trimmed });

  if (error?.code === '23505') return { success: false, error: 'already_subscribed' };
  if (error)                   return { success: false, error: 'server_error' };
  return { success: true };
}
