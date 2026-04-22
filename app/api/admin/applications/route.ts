import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  sendShopApprovalNotification,
  sendShopRejectionNotification,
} from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://tunerlink.com'

/**
 * Verify the caller is an authenticated admin.
 * Returns the user ID on success, or a NextResponse error on failure.
 */
async function requireAdmin(req: NextRequest): Promise<string | NextResponse> {
  const auth = req.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const scoped = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const {
    data: { user },
    error,
  } = await scoped.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Fetch role via service-role client (bypasses RLS, reads the source of truth)
  const admin = supabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return user.id
}

/**
 * GET /api/admin/applications?status=pending
 * List shop applications. Admin-only.
 */
export async function GET(req: NextRequest) {
  const check = await requireAdmin(req)
  if (check instanceof NextResponse) return check

  const status = req.nextUrl.searchParams.get('status') || 'pending'
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('shop_applications')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ applications: data ?? [] })
}

/**
 * POST /api/admin/applications
 * Body: { applicationId: string, action: 'approve' | 'reject', reason?: string }
 *
 * Approve: mark application approved, create unclaimed shops row, email applicant with claim link.
 * Reject:  mark application rejected, email applicant (with optional reason).
 */
export async function POST(req: NextRequest) {
  const check = await requireAdmin(req)
  if (check instanceof NextResponse) return check

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { applicationId, action, reason } = body as {
    applicationId?: string
    action?: 'approve' | 'reject'
    reason?: string
  }

  if (!applicationId || !action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'applicationId and action ("approve"|"reject") are required' },
      { status: 400 },
    )
  }

  const admin = supabaseAdmin()
  const { data: app, error: fetchErr } = await admin
    .from('shop_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (app.status !== 'pending') {
    return NextResponse.json(
      { error: `Application is already ${app.status}` },
      { status: 409 },
    )
  }

  if (action === 'reject') {
    const { error: updErr } = await admin
      .from('shop_applications')
      .update({ status: 'rejected', notes: reason ? `${app.notes || ''}\n[REJECTED] ${reason}`.trim() : app.notes })
      .eq('id', applicationId)
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    // Fire-and-forget email
    sendShopRejectionNotification({
      to: app.email,
      ownerName: app.owner_name,
      shopName: app.shop_name,
      reason: reason || null,
    }).catch((err) => console.error('[admin/applications] reject email failed:', err))

    return NextResponse.json({ ok: true, status: 'rejected' })
  }

  // APPROVE path — create unclaimed shop row if one doesn't already exist for this email.
  const existing = await admin
    .from('shops')
    .select('id')
    .eq('email', app.email)
    .maybeSingle()

  let shopId = existing.data?.id as string | undefined

  if (!shopId) {
    const { data: inserted, error: insErr } = await admin
      .from('shops')
      .insert({
        name: app.shop_name,
        email: app.email,
        phone: app.phone,
        city: app.city,
        state: app.state,
        specialties: app.specialties ?? [],
        is_approved: true,
        is_claimed: false,
        is_verified: false,
        claim_notes: `Approved from application ${app.id} on ${new Date().toISOString()}`,
      })
      .select('id')
      .single()

    if (insErr) {
      return NextResponse.json({ error: `Failed to create shop: ${insErr.message}` }, { status: 500 })
    }
    shopId = inserted.id
  }

  const { error: updErr } = await admin
    .from('shop_applications')
    .update({ status: 'approved' })
    .eq('id', applicationId)

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  const claimUrl = `${SITE_URL}/auth/signup?email=${encodeURIComponent(app.email)}&claim=${shopId}`

  sendShopApprovalNotification({
    to: app.email,
    ownerName: app.owner_name,
    shopName: app.shop_name,
    claimUrl,
  }).catch((err) => console.error('[admin/applications] approve email failed:', err))

  return NextResponse.json({ ok: true, status: 'approved', shopId })
}
