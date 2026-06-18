import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get('admin_token')?.value;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  return null;
}
