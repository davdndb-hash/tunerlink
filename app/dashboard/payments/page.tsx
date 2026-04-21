'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'customer' | 'shop' | null>(null)
  const [stripeConnected, setStripeConnected] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/payments'
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(profile?.role === 'shop' ? 'shop' : 'customer')

      if (profile?.role === 'shop') {
        const { data: shop } = await supabase
          .from('shops')
          .select('stripe_account_id')
          .eq('owner_id', user.id)
          .maybeSingle()
        setStripeConnected(!!shop?.stripe_account_id)
      }

      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dashboard" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Dashboard</Link>
      </nav>

      <div style={{ padding: 52, maxWidth: 900, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Dashboard
        </Link>

        <div className="label-tl" style={{ marginTop: 32 }}>Payments</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
          Your <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Wallet.</em>
        </h1>

        {loading ? (
          <div style={{ color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
        ) : role === 'shop' ? (
          <div>
            <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)', marginBottom: 24 }}>
              <div className="label-tl">Stripe Connect</div>
              <h2 style={{ fontWeight: 700, fontSize: 22, textTransform: 'uppercase', marginBottom: 12 }}>
                {stripeConnected ? 'Connected' : 'Not Connected'}
              </h2>
              <p style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
                {stripeConnected
                  ? 'You\u2019re set up to receive payouts. Funds are held in escrow until the customer approves the work, then automatically transferred to your bank account.'
                  : 'Connect your Stripe account to accept deposits and final payments through TunerLink. TunerLink holds funds in escrow until work is approved, then releases them to you.'}
              </p>
              <button
                disabled
                className="btn-tl btn-red"
                style={{ padding: '14px 36px', fontSize: 11, opacity: 0.5, cursor: 'not-allowed' }}
              >
                {stripeConnected ? 'Manage Stripe Dashboard' : 'Connect Stripe'}
              </button>
              <p style={{ marginTop: 12, fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase' }}>
                Stripe integration launches with payments — coming soon.
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)' }}>
              <div className="label-tl">Payouts</div>
              <p style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.8 }}>
                No payouts yet. Your completed bookings will be listed here with payout status.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)', marginBottom: 24 }}>
              <div className="label-tl">Payment History</div>
              <p style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.8 }}>
                No payments yet. Your booking deposits and final payments will show up here with receipts.
              </p>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)' }}>
              <div className="label-tl">How TunerLink Payments Work</div>
              <ol style={{ paddingLeft: 20, color: 'var(--lgrey)', fontSize: 14, lineHeight: 1.9 }}>
                <li>You pay a deposit when you book — held in escrow.</li>
                <li>The shop completes the work and uploads photos / dyno sheets.</li>
                <li>You approve the work. Your deposit and final balance release to the shop.</li>
                <li>If anything goes wrong, dispute resolution has your back.</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
