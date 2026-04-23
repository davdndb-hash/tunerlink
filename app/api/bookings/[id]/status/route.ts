import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Allowed status transitions. The actor list controls who can perform each.
 * - Shop owner moves status forward through the workflow.
 * - Customer can cancel before deposit is paid.
 */
type Actor = 'shop' | 'customer'
const ALLOWED: Record<string, { from: string[]; actors: Actor[] }> = {
  accepted:    { from: ['pending'], actors: ['shop'] },
  declined:    { from: ['pending'], actors: ['shop'] },
  in_progress: { from: ['accepted'], actors: ['shop'] },
  completed:   { from: ['in_progress', 'accepted'], actors: ['shop'] },
  cancelled:   { from: ['pending', 'accepted'], actors: ['shop', 'customer'] },
}

/**
 * POST /api/bookings/[id]/status
 * Body: { status: 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled', reason?: string }
 *
 * Shop-owner only. Validates the transition is legal, then updates the booking
 * and fires the appropriate customer notification email.
 */
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const bookingId = ctx.params.id
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    // Auth
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { status, reason } = body || {}
    if (!status || !ALLOWED[status]) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${Object.keys(ALLOWED).join(', ')}` },
        { status: 400 },
      )
    }

    const admin = supabaseAdmin()

    // Load booking + shop ownership + customer/service for email
    const { data: booking, error: bErr } = await admin
      .from('bookings')
      .select(
        'id, status, shop_id, customer_id, booking_date, booking_time, deposit_amount, deposit_paid, services(name), shops(name, owner_id, email), profiles!bookings_customer_id_fkey(email, full_name)',
      )
      .eq('id', bookingId)
      .maybeSingle()
    if (bErr) throw bErr
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const shop: any = Array.isArray(booking.shops) ? booking.shops[0] : booking.shops
    const service: any = Array.isArray(booking.services) ? booking.services[0] : booking.services
    const customer: any = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles

    // Determine actor role for this user against this booking
    const isShopOwner = !!shop?.owner_id && shop.owner_id === user.id
    const isCustomer = booking.customer_id === user.id
    const actor: Actor | null = isShopOwner ? 'shop' : isCustomer ? 'customer' : null

    if (!actor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rule = ALLOWED[status]
    if (!rule.actors.includes(actor)) {
      return NextResponse.json(
        { error: `Action "${status}" is not allowed for your role on this booking.` },
        { status: 403 },
      )
    }

    // Customer cannot cancel after deposit is paid — that requires a refund flow.
    if (actor === 'customer' && status === 'cancelled' && booking.deposit_paid) {
      return NextResponse.json(
        { error: 'Deposit already paid. Contact the shop to request a refund and cancellation.' },
        { status: 409 },
      )
    }

    // Verify legal transition
    if (!rule.from.includes(booking.status || 'pending')) {
      return NextResponse.json(
        {
          error: `Cannot move booking from "${booking.status}" to "${status}". Allowed from: ${rule.from.join(', ')}.`,
        },
        { status: 409 },
      )
    }

    // Apply update
    const updates: Record<string, any> = { status }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    }

    const { error: uErr } = await admin
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
    if (uErr) throw uErr

    // Fire notification (best-effort)
    try {
      if (status === 'accepted' && customer?.email) {
        const { sendBookingAccepted } = await import('@/lib/email')
        sendBookingAccepted({
          to: customer.email,
          customerName: customer.full_name,
          shopName: shop.name,
          serviceName: service?.name || 'Service',
          bookingDate: booking.booking_date as any,
          bookingTime: booking.booking_time as any,
          bookingId: booking.id,
          depositAmount: Number(booking.deposit_amount || 0),
        }).catch((e: any) => console.error('[status] accepted email failed:', e?.message || e))
      } else if (status === 'declined' && customer?.email) {
        const { sendBookingDeclined } = await import('@/lib/email')
        sendBookingDeclined({
          to: customer.email,
          customerName: customer.full_name,
          shopName: shop.name,
          serviceName: service?.name || 'Service',
          reason: reason || null,
        }).catch((e: any) => console.error('[status] declined email failed:', e?.message || e))
      } else if (status === 'cancelled') {
        // If shop cancelled → notify customer. If customer cancelled → notify shop.
        if (actor === 'shop' && customer?.email) {
          const { sendBookingDeclined } = await import('@/lib/email')
          sendBookingDeclined({
            to: customer.email,
            customerName: customer.full_name,
            shopName: shop.name,
            serviceName: service?.name || 'Service',
            reason: reason || null,
          }).catch((e: any) => console.error('[status] cancelled-by-shop email failed:', e?.message || e))
        } else if (actor === 'customer' && shop?.email) {
          const { sendShopBookingCancelledByCustomer } = await import('@/lib/email')
          sendShopBookingCancelledByCustomer({
            to: shop.email,
            shopName: shop.name,
            customerName: customer?.full_name,
            serviceName: service?.name || 'Service',
            bookingDate: booking.booking_date as any,
            bookingTime: booking.booking_time as any,
            reason: reason || null,
          }).catch((e: any) => console.error('[status] cancelled-by-customer email failed:', e?.message || e))
        }
      }
    } catch (e: any) {
      console.error('[status] email import failed:', e?.message || e)
    }

    return NextResponse.json({ id: booking.id, status })
  } catch (err: any) {
    console.error('[api/bookings/status POST] error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
