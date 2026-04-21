import { NextRequest, NextResponse } from 'next/server'
import { stripe, siteUrl } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/connect
 * Body: { shopId?: string }  (optional — defaults to shop owned by the authenticated user)
 *
 * Creates a Stripe Express account for the shop if one doesn't exist, then returns
 * an account link the shop owner can complete onboarding through.
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the calling user via the Authorization header
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    )

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = supabaseAdmin()

    // Find the shop this user owns (or the one specified in the request body)
    const body = await req.json().catch(() => ({}))
    const shopId: string | undefined = body.shopId

    let shopQuery = admin.from('shops').select('id, name, email, stripe_account_id, owner_id').eq('owner_id', user.id)
    if (shopId) shopQuery = shopQuery.eq('id', shopId)

    const { data: shop, error: shopErr } = await shopQuery.maybeSingle()
    if (shopErr) throw shopErr
    if (!shop) {
      return NextResponse.json({ error: 'No shop found for this user' }, { status: 404 })
    }

    // Create the Connect account if one doesn't already exist
    let accountId = shop.stripe_account_id
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: shop.email || user.email,
        business_type: 'company',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: shop.name,
          mcc: '7538', // Automotive Service Shops (Non-Dealer)
          url: `${siteUrl()}/shops/${shop.id}`,
        },
        metadata: {
          shop_id: shop.id,
          owner_id: user.id,
        },
      })
      accountId = account.id
      await admin.from('shops').update({ stripe_account_id: accountId }).eq('id', shop.id)
    }

    // Issue an account link — single-use, expires in ~5 minutes
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl()}/api/stripe/connect/refresh?shop=${shop.id}`,
      return_url: `${siteUrl()}/dashboard/payments?onboarded=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: link.url })
  } catch (err: any) {
    console.error('[stripe/connect] Error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/stripe/connect
 * Returns the current Connect status for the authenticated shop owner's shop.
 * Useful for refreshing the dashboard without going through Stripe.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    )
    const {
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = supabaseAdmin()
    const { data: shop } = await admin
      .from('shops')
      .select('id, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!shop?.stripe_account_id) {
      return NextResponse.json({ connected: false })
    }

    // Optionally refresh from Stripe (cheap, keeps cache fresh)
    const account = await stripe.accounts.retrieve(shop.stripe_account_id)

    await admin
      .from('shops')
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        stripe_details_submitted: account.details_submitted,
        stripe_status_updated_at: new Date().toISOString(),
      })
      .eq('id', shop.id)

    return NextResponse.json({
      connected: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    })
  } catch (err: any) {
    console.error('[stripe/connect GET] Error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
