import { NextRequest, NextResponse } from 'next/server'
import { sendShopApplicationReceived, notifyAdminNewApplication } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/email/shop-application
 * Body: { email: string }
 *
 * Verifies the application exists in shop_applications, then sends:
 *   1. confirmation to the applicant
 *   2. notification to the platform admin
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const admin = supabaseAdmin()
    const { data: app } = await admin
      .from('shop_applications')
      .select('shop_name, owner_name, email, phone, city, state')
      .eq('email', email.toLowerCase().trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!app) {
      return NextResponse.json({ ok: true }) // silent no-op for non-existent
    }

    await Promise.all([
      sendShopApplicationReceived(app.email, app.shop_name, app.owner_name),
      notifyAdminNewApplication(app),
    ])

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[email/shop-application] Error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
