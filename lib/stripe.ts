import Stripe from 'stripe'

// Platform configuration — TunerLink's take on every booking.
// 8% is a reasonable starting fee for a marketplace (Airbnb: ~14%, Thumbtack: ~15-25%, Etsy: ~6.5%).
// Adjust via PLATFORM_FEE_PERCENT env var if we want to experiment without redeploy.
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? '8')

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw at import time — build will fail otherwise.
  // The API routes will throw at request time if the key is missing.
  console.warn('[stripe] STRIPE_SECRET_KEY is not set. Stripe endpoints will error.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
  typescript: true,
  appInfo: {
    name: 'TunerLink',
    version: '0.1.0',
  },
})

/**
 * Platform fee in cents for a given total amount in cents.
 */
export function calcApplicationFee(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100)
}

/**
 * Site URL used for Stripe redirect return URLs.
 */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://tunerlink.com'
}
