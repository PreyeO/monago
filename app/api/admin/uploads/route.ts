import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/adminAuth';

// Product images live in a public Supabase Storage bucket. The bucket is created on first use.
const BUCKET = 'product-images';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;   // browser uploads (Vercel request limit is ~4.5MB)
const MAX_FETCH_BYTES  = 10 * 1024 * 1024;  // images copied from a pasted link
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif':  'gif',
};

let bucketReady = false;
async function ensureBucket(supabase: ReturnType<typeof createServerClient>) {
  if (bucketReady) return;
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FETCH_BYTES,
      allowedMimeTypes: Object.keys(TYPES),
    });
    if (error && !/already exists/i.test(error.message)) throw new Error(error.message);
  }
  bucketReady = true;
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  let bytes: ArrayBuffer;
  let type: string;

  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData().catch(() => null);
    const file = form?.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file received' }, { status: 400 });
    if (!TYPES[file.type]) return NextResponse.json({ error: 'Please upload a JPG, PNG, WebP, AVIF or GIF image' }, { status: 400 });
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'Image is too large (max 4MB)' }, { status: 400 });
    bytes = await file.arrayBuffer();
    type = file.type;
  } else {
    // { url } — copy an image from a link into our own storage
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!/^https:\/\//i.test(url)) return NextResponse.json({ error: 'Image link must start with https://' }, { status: 400 });
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow' });
      if (!res.ok) return NextResponse.json({ error: `Could not download that image (HTTP ${res.status})` }, { status: 400 });
      type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
      if (!TYPES[type]) return NextResponse.json({ error: 'That link is not a JPG, PNG, WebP, AVIF or GIF image' }, { status: 400 });
      const declared = Number(res.headers.get('content-length') ?? 0);
      if (declared > MAX_FETCH_BYTES) return NextResponse.json({ error: 'That image is too large (max 10MB)' }, { status: 400 });
      bytes = await res.arrayBuffer();
      if (bytes.byteLength > MAX_FETCH_BYTES) return NextResponse.json({ error: 'That image is too large (max 10MB)' }, { status: 400 });
    } catch {
      return NextResponse.json({ error: 'Could not download that image' }, { status: 400 });
    }
  }

  const supabase = createServerClient();
  try {
    await ensureBucket(supabase);
  } catch (err) {
    console.error('upload: bucket setup failed', err);
    return NextResponse.json({ error: 'Image storage is not available' }, { status: 500 });
  }

  const path = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${TYPES[type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    console.error('upload: storage upload failed', error);
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
