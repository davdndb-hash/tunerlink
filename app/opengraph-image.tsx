import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const alt = 'TunerLink — Performance shop marketplace'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#080808',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Subtle grid lines for texture */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        {/* Red accent bar - top right */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 8,
            height: 220,
            background: '#ff2233',
            display: 'flex',
          }}
        />

        {/* Top row: TL mark + label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              border: '3px solid #ff2233',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff2233',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            TL
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#777',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Performance · Central Florida
          </div>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 188,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            marginBottom: 28,
          }}
        >
          <span style={{ color: '#f4f0eb' }}>TUNER</span>
          <span style={{ color: '#ff2233' }}>LINK</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#bbb',
            maxWidth: 980,
            lineHeight: 1.25,
            display: 'flex',
            marginBottom: 'auto',
          }}
        >
          Find your performance specialist. Book direct.
        </div>

        {/* Bottom row: domain + spec line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 28,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: '#f4f0eb',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            tunerlink.co
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#555',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span>Verified shops</span>
            <span style={{ color: '#ff2233' }}>·</span>
            <span>Direct booking</span>
            <span style={{ color: '#ff2233' }}>·</span>
            <span>Secure payments</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
