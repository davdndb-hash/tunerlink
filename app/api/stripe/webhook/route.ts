import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/webhook
 * Stripe webhook endpoint. Verifies the signature, then processes events.
 *
 * Configure in Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *   URL: https://<your-domain>/api/stripe/webhook
 *   Events: account.updated, checkout.session.completed,
 *           payment_intent.payment_failed, charge.refunded, charge.dispute.created
 *
 * Idempotency: every event ID is recorded in `processed_stripe_events`.
 * Stripe retries deliveries on non-2xx responses, so we must dedupe to avoid
 * double-inserting payment rows. See migrations/001_processed_stripe_events.sql.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch (err: any) {
    console.error('[stripe/webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const admin = supabaseAdmin()

  // Idempotency check — has this event been processed before?
  // We insert first; if we hit a unique-violation, we've seen it and ack.
  const { error: dedupeErr } = await admin
    .from('processed_stripe_events')
    .insert({ event_id: event.id, event_type: event.type })

  if (dedupeErr) {
    // 23505 = unique_violation in Postgres. Already processed → safe ack.
    if ((dedupeErr as any).code === '23505') {
      console.log(`[stripe/webhook] Duplicate event ${event.id}, ack only.`)
      return NextResponse.json({ received: true, duplicate: true })
    }
    // Some other DB error — log but proceed (don't lose the event).
    console.error('[stripe/webhook] dedupe insert failed:', dedupeErr)
  }

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await admin
          .from('shops')
          .update({
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_details_submitted: account.details_submitted,
            stripe_status_updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', account.id)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const meta = session.metadata || {}
        const bookingId = meta.booking_id
        const kind = meta.kind || 'deposit'

        if (!bookingId) break

        const piId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id

        // Insert payment record
        await admin.from('payments').insert({
          booking_id: bookingId,
          shop_id: meta.shop_id,
          customer_id: meta.customer_id,
          stripe_payment_intent_id: piId,
          amount_cents: session.amount_total || 0,
          application_fee_cents: 0,
          currency: session.currency || 'usd',
          kind,
          status: 'succeeded',
          raw: session as any,
        })

        // Update booking flags
        const update: any = { stripe_payment_intent_id: piId }
        if (kind === 'deposit' || kind === 'full') update.deposit_paid = true
        if (kind === 'final' || kind === 'full') update.final_paid = true
        await admin.from('bookings').update(update).eq('id', bookingId)
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const meta = pi.metadata || {}
        if (meta.booking_id) {
          await admin.from('payments').insert({
            booking_id: meta.booking_id,
            shop_id: meta.shop_id,
            customer_id: meta.customer_id,
            stripe_payment_intent_id: pi.id,
            amount_cents: pi.amount,
            currency: pi.currency,
            kind: meta.kind || 'deposit',
            status: 'failed',
            raw: pi as any,
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const piId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id
        if (piId) {
          await admin
            .from('payments')
            .update({ status: 'refunded', updated_at: new Date().toISOString() })
            .eq('stripe_payment_intent_id', piId)
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const piId =
          typeof dispute.payment_intent === 'string'
            ? dispute.payment_intent
            : dispute.payment_intent?.id
        if (piId) {
          await admin
            .from('payments')
            .update({ status: 'disputed', updated_at: new Date().toISOString() })
            .eq('stripe_payment_intent_id', piId)
          const { data: payment } = await admin
            .from('payments')
            .select('booking_id')
            .eq('stripe_payment_intent_id', piId)
            .maybeSingle()
          if (payment?.booking_id) {
            await admin.from('bookings').update({ status: 'disputed' }).eq('id', payment.booking_id)
          }
        }
        break
      }

      default:
        console.log(`[stripe/webhook] Unhandled event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`[stripe/webhook] Handler error for ${event.type}:`, err)
    // Roll back the dedupe row so Stripe will retry — otherwise we'd silently
    // drop a failed event.
    await admin.from('processed_stripe_events').delete().eq('event_id', event.id)
    return NextResponse.json({ error: err?.message || 'Handler error' }, { status: 500 })
  }
}
