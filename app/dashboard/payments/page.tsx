'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ShopStatus = {
  id: string
  stripe_account_id: string | null
  stripe_charges_enabled: boolean
  stripe_payouts_enabled: boolean
  stripe_details_submitted: boolean
}

type Payment = {
  id: string
  amount_cents: number
  currency: string
  kind: string
  status: string
  created_at: string
  shops?: { name: string } | null
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'customer' | 'shop' | null>(null)
  const [shop, setShop] = useState<ShopStatus | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/payments'
        return
      }

      // URL flash messages from redirect returns
      const url = new URL(window.location.href)
      if (url.searchParams.get('onboarded') === 'true') {
        setSuccessMsg('Stripe onboarding completed. Refreshing status…')
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const isShop = profile?.role === 'shop'
      setRole(isShop ? 'shop' : 'customer')

      if (isShop) {
        const { data: shopRow } = await supabase
          .from('shops')
          .select('id, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted')
          .eq('owner_id', user.id)
          .maybeSingle()
        setShop(shopRow as ShopStatus)

        // If Stripe is connected, get a fresh status from the server (refreshes cache via Stripe API)
        if (shopRow?.stripe_account_id) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('/api/stripe/connect', {
              headers: { Authorization: `Bearer ${session?.access_token}` },
            })
            if (res.ok) {
              const fresh = await res.json()
              setShop((s) => s && {
                ...s,
                stripe_charges_enabled: fresh.charges_enabled,
                stripe_payouts_enabled: fresh.payouts_enabled,
                stripe_details_submitted: fresh.details_submitted,
              })
            }
          } catch (err) {
            // Non-fatal — fall back to cached values from Supabase
          }
        }
      } else {
        // Customer view — load payment history
        const { data: pays } = await supabase
          .from('payments')
          .select('id, amount_cents, currency, kind, status, created_at, shops(name)')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        setPayments((pays as any) || [])
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleConnect = async () => {
    setActionPending('connect')
    setErrorMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start onboarding')
      window.location.href = data.url
    } catch (err: any) {
      setErrorMsg(err.message)
      setActionPending(null)
    }
  }

  const handleDashboard = async () => {
    setActionPending('dashboard')
    setErrorMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/stripe/connect/login', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to open Stripe dashboard')
      window.open(data.url, '_blank')
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setActionPending(null)
    }
  }

  const isConnected = !!shop?.stripe_account_id
  const isLive = shop?.stripe_charges_enabled && shop?.stripe_payouts_enabled
  const inProgress = isConnected && shop?.stripe_details_submitted && !isLive

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

        {successMsg && (
          <div style={{ border: '1px solid #1D9E75', background: 'rgba(29,158,117,0.1)', color: '#1D9E75', padding: 16, marginBottom: 24, fontSize: 13 }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ border: '1px solid #ff2233', background: 'rgba(255,34,51,0.1)', color: '#ff2233', padding: 16, marginBottom: 24, fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
        ) : role === 'shop' ? (
          <div>
            <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)', marginBottom: 24 }}>
              <div className="label-tl">Stripe Connect</div>
              <h2 style={{ fontWeight: 700, fontSize: 22, textTransform: 'uppercase', marginBottom: 12 }}>
                {isLive ? 'Live · Receiving payouts' : inProgress ? 'Pending Stripe review' : isConnected ? 'Onboarding incomplete' : 'Not connected'}
              </h2>
              <p style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
                {isLive
                  ? 'You\u2019re set up to accept payments. TunerLink charges customers, holds funds in escrow, and pays out to your bank.'
                  : inProgress
                  ? 'Stripe is reviewing your information. This usually takes a few minutes to a few business days.'
                  : isConnected
                  ? 'You\u2019ve started onboarding but haven\u2019t finished. Complete it to start accepting payments.'
                  : 'Connect your Stripe account to accept deposits and final payments through TunerLink. We hold funds in escrow until work is approved, then release them to you.'}
              </p>

              {!isLive && (
                <button
                  onClick={handleConnect}
                  disabled={actionPending === 'connect'}
                  className="btn-tl btn-red"
                  style={{ padding: '14px 36px', fontSize: 11, opacity: actionPending === 'connect' ? 0.5 : 1, cursor: actionPending === 'connect' ? 'wait' : 'pointer' }}
                >
                  {actionPending === 'connect' ? 'Redirecting…' : isConnected ? 'Resume Onboarding' : 'Connect Stripe'}
                </button>
              )}
              {isConnected && (
                <button
                  onClick={handleDashboard}
                  disabled={actionPending === 'dashboard'}
                  className="btn-tl"
                  style={{ marginLeft: isLive ? 0 : 12, padding: '14px 36px', fontSize: 11, opacity: actionPending === 'dashboard' ? 0.5 : 1, cursor: actionPending === 'dashboard' ? 'wait' : 'pointer' }}
                >
                  {actionPending === 'dashboard' ? 'Opening…' : 'Open Stripe Dashboard'}
                </button>
              )}

              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                <StatusPill label="Details" ok={!!shop?.stripe_details_submitted} />
                <StatusPill label="Charges" ok={!!shop?.stripe_charges_enabled} />
                <StatusPill label="Payouts" ok={!!shop?.stripe_payouts_enabled} />
              </div>
            </div>

            <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)' }}>
              <div className="label-tl">Payouts</div>
              <p style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.8 }}>
                Payouts land in your linked bank account on Stripe&rsquo;s standard schedule (typically 2 business days).
                {' '}You can view detailed payout reports anytime in your Stripe dashboard.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)', marginBottom: 24 }}>
              <div className="label-tl">Payment History</div>
              {payments.length === 0 ? (
                <p style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.8 }}>
                  No payments yet. Your booking deposits and final payments will show up here with receipts.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {payments.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.shops?.name || 'Shop'}</div>
                        <div style={{ fontSize: 11, color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                          {p.kind} · {new Date(p.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>${(p.amount_cents / 100).toFixed(2)}</div>
                        <div style={{ fontSize: 10, color: p.status === 'succeeded' ? '#1D9E75' : p.status === 'refunded' ? '#bbb' : '#ff2233', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                          {p.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1px solid ${ok ? '#1D9E75' : 'var(--border)'}`, color: ok ? '#1D9E75' : 'var(--grey)' }}>
      <span style={{ fontSize: 11 }}>{ok ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  )
}
