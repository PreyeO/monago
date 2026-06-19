import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Monago — Premium Wellness';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          position: 'relative',
        }}
      >
        {/* Amber glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 96, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
            M
          </span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 80, fontWeight: 600, color: '#ffffff', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            onago
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 60, height: 2, background: '#f59e0b', marginBottom: 24, borderRadius: 2 }} />

        {/* Tagline */}
        <p style={{ fontSize: 28, color: '#a8a29e', fontFamily: 'sans-serif', margin: 0, letterSpacing: '0.05em' }}>
          Premium Wellness · Delivered Across the UK
        </p>
      </div>
    ),
    { ...size }
  );
}
