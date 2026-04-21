import { NextRequest, NextResponse } from 'next/server'
import { stripe, calcApplicationFee, siteUrl } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/checkout
 * Body: { bookingId: string, kind: 'deposit' | 'final' | 'full' }
 *
 * Creates a Stripe Checkout Session for a booking. The session uses the
 * destination charge model: customer pays TunerLink, we collect a platform fee,
 * the rest is automatically transferred to the shop's connected account.
 *
 * Returns the Checkout URL the customer should be redirected to.
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

    const { bookingId, kind = 'deposit' } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }
    if (!['deposit', 'final', 'full'].includes(kind)) {
      return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
    }

    const admin = supabaseAdmin()
    const { data: booking, error: bErr } = await admin
      .from('bookings')
      .select(
        'id, customer_id, shop_id, deposit_amount, total_amount, deposit_paid, final_paid, services(name), shops(name, stripe_account_id, stripe_charges_enabled)',
      )
      .eq('id', bookingId)
      .maybeSingle()

    if (bErr) throw bErr
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.customer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const shop: any = Array.isArray(booking.shops) ? booking.shops[0] : booking.shops
    const service: any = Array.isArray(booking.services) ? booking.services[0] : booking.services

    if (!shop?.stripe_account_id || !shop?.stripe_charges_enabled) {
      return NextResponse.json(
        { error: 'Shop has not completed Stripe Connect onboarding yet.' },
        { status: 400 },
      )
    }

    // Determine amount based on kind
    let amountCents = 0
    let label = ''
    if (kind === 'deposit') {
      if (booking.deposit_paid) {
        return NextResponse.json({ error: 'Deposit already paid' }, { status: 400 })
      }
      amountCents = Math.round(Number(booking.deposit_amount) * 100)
      label = 'Booking deposit'
    } else if (kind === 'final') {
      if (booking.final_paid) {
        return NextResponse.json({ error: 'Final balance already paid' }, { status: 400 })
      }
      amountCents = Math.round(
        (Number(booking.total_amount) - Number(booking.deposit_amount || 0)) * 100,
      )
      label = 'Final balance'
    } else {
      // full
      amountCents = Math.round(Number(booking.total_amount) * 100)
      label = 'Full payment'
    }

    if (!amountCents || amountCents < 50) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const applicationFee = calcApplicationFee(amountCents)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `${shop.name} — ${service?.name || 'Service'}`,
              description: label,
            },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: shop.stripe_account_id,
        },
        metadata: {
          booking_id: booking.id,
          shop_id: booking.shop_id,
          customer_id: booking.customer_id,
          kind,
        },
      },
      metadata: {
        booking_id: booking.id,
        shop_id: booking.shop_id,
        customer_id: booking.customer_id,
        kind,
      },
      success_url: `${siteUrl()}/dashboard/bookings?paid=${booking.id}`,
      cancel_url: `${siteUrl()}/dashboard/bookings?cancelled=${booking.id}`,
    })

    return NextResponse.json({ url: session.url, id: session.id })
  } catch (err: any) {
    console.error('[stripe/checkout] Error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
