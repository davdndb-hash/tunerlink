import { NextRequest, NextResponse } from 'next/server'
import { siteUrl } from '@/lib/stripe'

export const runtime = 'nodejs'

/**
 * GET /api/stripe/connect/refresh
 * Stripe redirects here when an onboarding link expires. We bounce the user back
 * to the payments dashboard, which will issue a fresh link if they click "Connect" again.
 */
export async function GET(_req: NextRequest) {
  return NextResponse.redirect(`${siteUrl()}/dashboard/payments?refresh=1`)
}
