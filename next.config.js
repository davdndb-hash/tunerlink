/** @type {import('next').NextConfig} */

// Build CSP that allows what the app actually needs:
// - Supabase (auth, postgrest, realtime via wss)
// - Stripe (Checkout, Connect onboarding, webhooks via api.stripe.com)
// - Google Fonts (Bebas Neue is loaded via @import in app/page.tsx)
// - Vercel preview deployments
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co'

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https: ${supabaseHost}`,
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.stripe.com https://*.stripe.com`,
  `frame-src https://js.stripe.com https://*.stripe.com https://hooks.stripe.com`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self' https://*.stripe.com`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // hide X-Powered-By: Next.js
  async headers() {
    return [
      {
        // Apply to all routes EXCEPT the Stripe webhook (which Stripe needs
        // to reach without CSP interference; the route itself is locked down
        // by signature verification).
        source: '/((?!api/stripe/webhook).*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
