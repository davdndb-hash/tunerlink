import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/connect/login
 * Returns a one-time login link to the shop owner's Stripe Express dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
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
      .select('stripe_account_id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!shop?.stripe_account_id) {
      return NextResponse.json({ error: 'Stripe account not yet created' }, { status: 400 })
    }

    const link = await stripe.accounts.createLoginLink(shop.stripe_account_id)
    return NextResponse.json({ url: link.url })
  } catch (err: any) {
    console.error('[stripe/connect/login] Error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
