import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/shop/claim
 * Body: { shopId: string }
 *
 * Assigns ownership of an approved, unclaimed shop to the authenticated user,
 * provided the shop's on-file email matches the user's email (admin set that
 * email when they approved the application).
 *
 * Side effects:
 *  - shops.owner_id = user.id, is_claimed = true
 *  - profiles.role = 'shop' (so dashboard routing flips to shop views)
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
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
    } = await userClient.auth.getUser()
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const shopId: string | undefined = body?.shopId
    if (!shopId) {
      return NextResponse.json({ error: 'shopId is required' }, { status: 400 })
    }

    const admin = supabaseAdmin()

    const { data: shop, error: sErr } = await admin
      .from('shops')
      .select('id, name, email, owner_id, is_claimed, is_approved')
      .eq('id', shopId)
      .maybeSingle()

    if (sErr) throw sErr
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (!shop.is_approved) {
      return NextResponse.json({ error: 'Shop is not approved yet' }, { status: 409 })
    }

    if (shop.is_claimed || shop.owner_id) {
      // If it's already owned by this user, treat as success (idempotent)
      if (shop.owner_id === user.id) {
        return NextResponse.json({ ok: true, shopId, alreadyOwned: true })
      }
      return NextResponse.json({ error: 'Shop has already been claimed' }, { status: 409 })
    }

    // Email match check — the admin set shop.email from the application when they approved
    const userEmail = (user.email || '').toLowerCase().trim()
    const shopEmail = (shop.email || '').toLowerCase().trim()
    if (!shopEmail || shopEmail !== userEmail) {
      return NextResponse.json(
        { error: 'This shop was approved for a different email. Contact support if this is wrong.' },
        { status: 403 },
      )
    }

    // Assign ownership (service role bypasses the privilege-escalation trigger)
    const { error: upErr } = await admin
      .from('shops')
      .update({ owner_id: user.id, is_claimed: true })
      .eq('id', shop.id)
    if (upErr) throw upErr

    // Bump profile role to 'shop' so dashboard flips to shop views
    await admin
      .from('profiles')
      .upsert(
        { id: user.id, email: user.email, role: 'shop' },
        { onConflict: 'id' },
      )

    return NextResponse.json({ ok: true, shopId: shop.id })
  } catch (err: any) {
    console.error('[api/shop/claim] error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
