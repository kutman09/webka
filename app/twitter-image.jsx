import { ImageResponse } from 'next/og';

export const alt = 'Nurkalykov Kutman — Full-Stack & AI Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: '#07080A',
        color: '#F5F5F5',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <svg width="96" height="80" viewBox="0 0 48 40" fill="none">
          <line x1="4" y1="36" x2="4" y2="4" stroke="#F5F5F5" strokeWidth="3" />
          <line x1="4" y1="4" x2="24" y2="36" stroke="#F5F5F5" strokeWidth="3" />
          <line x1="24" y1="36" x2="24" y2="4" stroke="#F5F5F5" strokeWidth="3" />
          <line x1="24" y1="20" x2="44" y2="4" stroke="#F5F5F5" strokeWidth="3" />
          <line x1="24" y1="20" x2="44" y2="36" stroke="#F5F5F5" strokeWidth="3" />
          <rect x="21.5" y="17.5" width="5" height="5" fill="#B8FF36" />
        </svg>
        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, color: '#9298A5' }}>
          BISHKEK, KYRGYZSTAN
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 6,
            color: '#B8FF36',
            marginBottom: 24,
          }}
        >
          FULL-STACK &amp; AI DEVELOPER
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 128,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: -6,
          }}
        >
          NURKALYKOV
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 128,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: -6,
          }}
        >
          KUTMAN
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 22, color: '#9298A5', letterSpacing: 4 }}>
        NK — BEYOND THE CODE
      </div>
    </div>,
    size,
  );
}
