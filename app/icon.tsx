import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#080808',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #ff2233',
          color: '#ff2233',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.05em',
          fontFamily: 'sans-serif',
        }}
      >
        TL
      </div>
    ),
    { ...size }
  )
}
