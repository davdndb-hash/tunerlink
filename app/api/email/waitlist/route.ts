import { NextRequest, NextResponse } from 'next/server'
import { sendWaitlistWelcome } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/email/waitlist
 * Body: { email: string }
 *
 * Verifies the email actually exists in customer_waitlist (anti-spam),
 * then sends the welcome email.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Verify the email is actually in the waitlist before emailing.
    // This prevents the endpoint from being used as an open mailer.
    const admin = supabaseAdmin()
    const { data: row } = await admin
      .from('customer_waitlist')
      .select('email, full_name')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (!row) {
      // Don't reveal whether the email exists; just no-op.
      return NextResponse.json({ ok: true })
    }

    await sendWaitlistWelcome(row.email, row.full_name)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[email/waitlist] Error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
