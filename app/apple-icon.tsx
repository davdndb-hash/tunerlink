import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            border: '6px solid #ff2233',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff2233',
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          TL
        </div>
      </div>
    ),
    { ...size }
  )
}
