import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Called by Vercel Cron (see vercel.json) so the free Supabase project always sees
// activity and is never paused for inactivity. Does one tiny read, writes nothing.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron calls.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from('settings').select('key').limit(1);
  if (error) {
    console.error('keepalive: Supabase query failed', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
