import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/bookings
 *
 * Body: {
 *   shopId: string,
 *   serviceId: string,
 *   bookingDate: string (YYYY-MM-DD),
 *   bookingTime?: string (HH:MM),
 *   vehicleId?: string,
 *   notes?: string,
 *   customerGoals?: string,
 * }
 *
 * Creates a booking in `pending` status. Shop must accept before the customer
 * can pay the deposit. Pricing is derived from the selected service:
 *   total_amount = service.price_min
 *   deposit_amount = 50% of price_min (rounded to 2dp)
 *
 * Shops can later adjust the quoted total if the scope changes.
 */
export async function POST(req: NextRequest) {
  try {
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

    // Parse + validate body
    const body = await req.json()
    const { shopId, serviceId, bookingDate, bookingTime, vehicleId, notes, customerGoals } = body || {}

    if (!shopId || !serviceId || !bookingDate) {
      return NextResponse.json(
        { error: 'shopId, serviceId, and bookingDate are required' },
        { status: 400 },
      )
    }

    // Date must be today or future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const requested = new Date(`${bookingDate}T00:00:00`)
    if (isNaN(requested.getTime())) {
      return NextResponse.json({ error: 'Invalid bookingDate' }, { status: 400 })
    }
    if (requested < today) {
      return NextResponse.json({ error: 'bookingDate must be today or later' }, { status: 400 })
    }

    const admin = supabaseAdmin()

    // Validate shop
    const { data: shop, error: shopErr } = await admin
      .from('shops')
      .select('id, name, email, owner_id, is_approved, is_claimed')
      .eq('id', shopId)
      .maybeSingle()
    if (shopErr) throw shopErr
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }
    if (!shop.is_approved) {
      return NextResponse.json({ error: 'Shop is not accepting bookings' }, { status: 400 })
    }

    // Validate service belongs to shop + is active
    const { data: service, error: svcErr } = await admin
      .from('services')
      .select('id, name, shop_id, price_min, price_max, is_active, instant_book')
      .eq('id', serviceId)
      .maybeSingle()
    if (svcErr) throw svcErr
    if (!service || service.shop_id !== shopId) {
      return NextResponse.json({ error: 'Service not found for this shop' }, { status: 404 })
    }
    if (service.is_active === false) {
      return NextResponse.json({ error: 'Service is not currently available' }, { status: 400 })
    }

    const total = Number(service.price_min || 0)
    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'Service has no base price. Contact the shop for a quote.' },
        { status: 400 },
      )
    }
    const deposit = Math.round(total * 0.5 * 100) / 100

    // Prevent a customer from holding multiple identical pending bookings
    const { data: existing } = await admin
      .from('bookings')
      .select('id')
      .eq('customer_id', user.id)
      .eq('shop_id', shopId)
      .eq('service_id', serviceId)
      .eq('status', 'pending')
      .maybeSingle()
    if (existing) {
      return NextResponse.json(
        { error: 'You already have a pending request for this service. Check /dashboard/bookings.' },
        { status: 409 },
      )
    }

    // Create the booking
    const { data: created, error: bErr } = await admin
      .from('bookings')
      .insert({
        customer_id: user.id,
        shop_id: shopId,
        service_id: serviceId,
        vehicle_id: vehicleId || null,
        status: 'pending',
        booking_date: bookingDate,
        booking_time: bookingTime || null,
        notes: notes || null,
        customer_goals: customerGoals || null,
        total_amount: total,
        deposit_amount: deposit,
      })
      .select('id')
      .single()

    if (bErr) throw bErr

    // Fire-and-forget notifications. Silently no-op if Resend is unverified.
    const customerName = user.user_metadata?.full_name || user.email || 'A customer'
    try {
      const { sendBookingCreated, sendShopBookingNotification } = await import('@/lib/email')

      // Customer: confirmation that the request was sent
      if (user.email) {
        sendBookingCreated({
          to: user.email,
          customerName,
          shopName: shop.name,
          serviceName: service.name,
          bookingDate,
          bookingTime: bookingTime || null,
          bookingId: created.id,
        }).catch((e: any) => console.error('[bookings] customer email failed:', e?.message || e))
      }

      // Shop: new request awaiting their response
      if (shop.email) {
        sendShopBookingNotification({
          to: shop.email,
          shopName: shop.name,
          customerName,
          serviceName: service.name,
          bookingDate,
          bookingTime: bookingTime || null,
        }).catch((e: any) => console.error('[bookings] shop email failed:', e?.message || e))
      }
    } catch (e: any) {
      console.error('[bookings] email import failed:', e?.message || e)
    }

    return NextResponse.json({ id: created.id, status: 'pending' })
  } catch (err: any) {
    console.error('[api/bookings POST] error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
