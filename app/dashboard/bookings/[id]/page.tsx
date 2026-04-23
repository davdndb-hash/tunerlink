'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type BookingDetail = {
  id: string
  status: string | null
  booking_date: string | null
  booking_time: string | null
  notes: string | null
  customer_goals: string | null
  total_amount: number | null
  deposit_amount: number | null
  deposit_paid: boolean | null
  final_paid: boolean | null
  completed_at: string | null
  created_at: string
  shop_id: string
  customer_id: string
  shop: { id: string; name: string; city: string | null; state: string | null; phone: string | null; email: string | null; owner_id: string | null; stripe_charges_enabled: boolean | null } | null
  service: { id: string; name: string | null; description: string | null; duration_hours: number | null } | null
  customer: { id: string; full_name: string | null; email: string | null } | null
  vehicle: { id: string; year: number | null; make: string | null; model: string | null; trim: string | null } | null
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = params?.id as string
  const justCreated = searchParams?.get('created') === '1'
  const justPaid = searchParams?.get('paid') === bookingId
  const justCancelled = searchParams?.get('cancelled') === bookingId

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = `/auth/login?next=/dashboard/bookings/${bookingId}`
      return
    }
    setUserId(session.user.id)
    setAccessToken(session.access_token)

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, status, booking_date, booking_time, notes, customer_goals,
        total_amount, deposit_amount, deposit_paid, final_paid, completed_at, created_at,
        shop_id, customer_id,
        shop:shops(id, name, city, state, phone, email, owner_id, stripe_charges_enabled),
        service:services(id, name, description, duration_hours),
        customer:profiles!bookings_customer_id_fkey(id, full_name, email),
        vehicle:vehicles(id, year, make, model, trim)
      `)
      .eq('id', bookingId)
      .maybeSingle()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (!data) {
      setError('Booking not found.')
      setLoading(false)
      return
    }
    setBooking(data as unknown as BookingDetail)
    setLoading(false)
  }, [bookingId])

  useEffect(() => {
    load()
  }, [load])

  const isCustomer = userId && booking && booking.customer_id === userId
  const isShopOwner = userId && booking?.shop && booking.shop.owner_id === userId
  const status = booking?.status || 'pending'

  async function changeStatus(next: string, reason?: string) {
    if (!accessToken) return
    setBusy(true)
    setActionMessage('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status: next, reason: reason || null }),
      })
      const json = await res.json()
      if (!res.ok) {
        setActionMessage(`✗ ${json?.error || 'Update failed'}`)
      } else {
        setActionMessage(`✓ Status updated to ${next}`)
        await load()
      }
    } catch (err: any) {
      setActionMessage(`✗ ${err?.message || 'Network error'}`)
    } finally {
      setBusy(false)
    }
  }

  async function payDeposit() {
    if (!accessToken) return
    setBusy(true)
    setActionMessage('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ bookingId, kind: 'deposit' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setActionMessage(`✗ ${json?.error || 'Could not start checkout'}`)
        setBusy(false)
        return
      }
      window.location.href = json.url
    } catch (err: any) {
      setActionMessage(`✗ ${err?.message || 'Network error'}`)
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', color: 'var(--grey)', textTransform: 'uppercase' }}>Loading…</div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ color: '#ff2233', marginBottom: 16 }}>{error || 'Not found'}</div>
        <Link href="/dashboard/bookings" className="btn-tl">Back to Bookings</Link>
      </div>
    )
  }

  if (!isCustomer && !isShopOwner) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ color: '#ff2233', marginBottom: 16 }}>You don&rsquo;t have access to this booking.</div>
        <Link href="/dashboard/bookings" className="btn-tl">Back to Bookings</Link>
      </div>
    )
  }

  const dateStr = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBD'

  const total = Number(booking.total_amount || 0)
  const deposit = Number(booking.deposit_amount || 0)
  const remaining = Math.max(0, total - deposit)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dashboard/bookings" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>← All bookings</Link>
      </nav>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '52px 24px 96px' }}>

        {justCreated && (
          <div style={banner('success')}>✓ Booking request sent. The shop will respond shortly.</div>
        )}
        {justPaid && (
          <div style={banner('success')}>✓ Deposit received. Your booking is confirmed.</div>
        )}
        {justCancelled && (
          <div style={banner('warn')}>Checkout cancelled — no charge made.</div>
        )}

        {/* Header */}
        <div className="label-tl">Booking</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 36, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(28px, 4vw, 44px)', textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 10 }}>
              {booking.service?.name || 'Service'}
            </h1>
            <div style={{ color: 'var(--lgrey)', fontSize: 14 }}>
              at <Link href={`/shops/${booking.shop?.id}`} style={{ color: '#ff2233', textDecoration: 'none' }}>{booking.shop?.name}</Link>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Two-column body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24 }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card title="When">
              <div style={{ fontSize: 16, marginBottom: 4 }}>{dateStr}</div>
              {booking.booking_time && <div style={{ color: 'var(--grey)', fontSize: 13 }}>{booking.booking_time}</div>}
              {booking.service?.duration_hours && (
                <div style={{ color: 'var(--grey)', fontSize: 12, marginTop: 6 }}>~{Number(booking.service.duration_hours)}h estimated</div>
              )}
            </Card>

            {booking.vehicle && (
              <Card title="Vehicle">
                <div>{[booking.vehicle.year, booking.vehicle.make, booking.vehicle.model, booking.vehicle.trim].filter(Boolean).join(' ')}</div>
              </Card>
            )}

            {booking.customer_goals && (
              <Card title="Customer goals">
                <div style={{ color: 'var(--lgrey)', lineHeight: 1.7 }}>{booking.customer_goals}</div>
              </Card>
            )}

            {booking.notes && (
              <Card title="Notes">
                <div style={{ color: 'var(--lgrey)', lineHeight: 1.7 }}>{booking.notes}</div>
              </Card>
            )}

            {/* Shop view: customer info */}
            {isShopOwner && (
              <Card title="Customer">
                <div>{booking.customer?.full_name || 'Customer'}</div>
                {booking.customer?.email && (
                  <div style={{ color: 'var(--grey)', fontSize: 13, marginTop: 4 }}>
                    <a href={`mailto:${booking.customer.email}`} style={{ color: '#ff2233' }}>{booking.customer.email}</a>
                  </div>
                )}
              </Card>
            )}

            {/* Customer view: shop contact */}
            {isCustomer && booking.shop && (
              <Card title="Shop contact">
                <div>{booking.shop.name}</div>
                {(booking.shop.city || booking.shop.state) && (
                  <div style={{ color: 'var(--grey)', fontSize: 13, marginTop: 4 }}>
                    {[booking.shop.city, booking.shop.state].filter(Boolean).join(', ')}
                  </div>
                )}
                {booking.shop.phone && (
                  <div style={{ marginTop: 8 }}>
                    <a href={`tel:${booking.shop.phone}`} style={{ color: '#ff2233', fontSize: 13 }}>📞 {booking.shop.phone}</a>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right — actions + pricing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Pricing */}
            <Card title="Pricing">
              <Row label="Service total" value={`$${total.toFixed(2)}`} />
              <Row label="Deposit" value={`$${deposit.toFixed(2)}`} muted={booking.deposit_paid ? false : true} />
              <Row label={booking.deposit_paid ? 'Deposit paid ✓' : 'Deposit due'} value="" success={!!booking.deposit_paid} />
              <Row label="Remaining" value={`$${remaining.toFixed(2)}`} />
              <Row label={booking.final_paid ? 'Final paid ✓' : 'Final due in person'} value="" success={!!booking.final_paid} />
            </Card>

            {/* Actions */}
            <Card title="Actions">
              {/* Shop owner actions */}
              {isShopOwner && status === 'pending' && (
                <>
                  <button
                    className="btn-tl btn-red"
                    style={{ width: '100%', padding: '12px', fontSize: 11, marginBottom: 10, opacity: busy ? 0.6 : 1 }}
                    disabled={busy}
                    onClick={() => changeStatus('accepted')}
                  >
                    {busy ? 'Working…' : 'Accept request'}
                  </button>
                  <button
                    className="btn-tl"
                    style={{ width: '100%', padding: '12px', fontSize: 11, opacity: busy ? 0.6 : 1 }}
                    disabled={busy}
                    onClick={() => {
                      const reason = window.prompt('Optional: tell the customer why you can\'t take this booking.')
                      if (reason !== null) changeStatus('declined', reason || undefined)
                    }}
                  >
                    Decline
                  </button>
                </>
              )}

              {isShopOwner && status === 'accepted' && (
                <>
                  {!booking.deposit_paid && (
                    <div style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.25)', padding: 10, marginBottom: 10, color: '#ffaa00', fontSize: 11, lineHeight: 1.5 }}>
                      Waiting on the customer to pay the deposit before work begins.
                    </div>
                  )}
                  <button className="btn-tl btn-red" style={{ width: '100%', padding: '12px', fontSize: 11, marginBottom: 10, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={() => changeStatus('in_progress')}>
                    Mark in progress
                  </button>
                  <button className="btn-tl" style={{ width: '100%', padding: '12px', fontSize: 11, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={() => changeStatus('cancelled')}>
                    Cancel
                  </button>
                </>
              )}

              {isShopOwner && status === 'in_progress' && (
                <button className="btn-tl btn-red" style={{ width: '100%', padding: '12px', fontSize: 11, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={() => changeStatus('completed')}>
                  Mark completed
                </button>
              )}

              {/* Customer actions */}
              {isCustomer && status === 'pending' && (
                <div style={{ color: 'var(--grey)', fontSize: 12, lineHeight: 1.6, padding: '8px 0' }}>
                  ⏳ Waiting for the shop to respond. They typically reply within a business day.
                </div>
              )}

              {isCustomer && status === 'accepted' && !booking.deposit_paid && (
                <>
                  {booking.shop?.stripe_charges_enabled ? (
                    <button
                      className="btn-tl btn-red"
                      style={{ width: '100%', padding: '14px', fontSize: 11, opacity: busy ? 0.6 : 1 }}
                      disabled={busy}
                      onClick={payDeposit}
                    >
                      {busy ? 'Opening checkout…' : `Pay $${deposit.toFixed(2)} deposit`}
                    </button>
                  ) : (
                    <div style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.25)', padding: 10, color: '#ffaa00', fontSize: 11, lineHeight: 1.5 }}>
                      This shop hasn&rsquo;t finished Stripe Connect onboarding. Reach out directly to arrange payment.
                    </div>
                  )}
                </>
              )}

              {isCustomer && booking.deposit_paid && status === 'accepted' && (
                <div style={{ color: '#1D9E75', fontSize: 12, lineHeight: 1.6, padding: '8px 0' }}>
                  ✓ Deposit confirmed. The shop will reach out about scheduling.
                </div>
              )}

              {status === 'declined' && (
                <div style={{ color: 'var(--grey)', fontSize: 12, lineHeight: 1.6, padding: '8px 0' }}>
                  This request was declined. <Link href="/shops" style={{ color: '#ff2233' }}>Find another shop →</Link>
                </div>
              )}

              {status === 'cancelled' && (
                <div style={{ color: 'var(--grey)', fontSize: 12, lineHeight: 1.6, padding: '8px 0' }}>This booking was cancelled.</div>
              )}

              {status === 'completed' && (
                <div style={{ color: '#1D9E75', fontSize: 12, lineHeight: 1.6, padding: '8px 0' }}>
                  ✓ Completed{booking.completed_at ? ` on ${new Date(booking.completed_at).toLocaleDateString('en-US')}` : ''}.
                </div>
              )}

              {actionMessage && (
                <div style={{ marginTop: 12, fontSize: 11, color: actionMessage.startsWith('✓') ? '#1D9E75' : '#ff2233', fontFamily: 'var(--font-mono), monospace' }}>
                  {actionMessage}
                </div>
              )}
            </Card>

            <div style={{ fontSize: 11, color: 'var(--grey)', textAlign: 'center', lineHeight: 1.6 }}>
              Booking ID: <code style={{ fontFamily: 'var(--font-mono), monospace' }}>{booking.id.slice(0, 8)}</code><br />
              Created {new Date(booking.created_at).toLocaleString('en-US')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
    pending:    { bg: 'rgba(255,170,0,0.06)',  border: 'rgba(255,170,0,0.3)',  color: '#ffaa00', label: 'Pending' },
    accepted:   { bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.4)', color: '#1D9E75', label: 'Accepted' },
    declined:   { bg: 'rgba(255,34,51,0.06)',  border: 'rgba(255,34,51,0.3)',  color: '#ff2233', label: 'Declined' },
    in_progress:{ bg: 'rgba(80,150,255,0.08)', border: 'rgba(80,150,255,0.35)',color: '#5096ff', label: 'In Progress' },
    completed:  { bg: 'rgba(29,158,117,0.12)', border: 'rgba(29,158,117,0.5)', color: '#1D9E75', label: 'Completed' },
    cancelled:  { bg: 'rgba(180,180,180,0.05)',border: 'rgba(180,180,180,0.25)',color: '#999',   label: 'Cancelled' },
  }
  const s = map[status] || map.pending
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '8px 14px', fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {s.label}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--dark)', border: '1px solid var(--border)', padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.28em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      <div>{children}</div>
    </div>
  )
}

function Row({ label, value, muted, success }: { label: string; value: string; muted?: boolean; success?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: success ? '#1D9E75' : muted ? 'var(--grey)' : 'var(--white)' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function banner(kind: 'success' | 'warn'): React.CSSProperties {
  const map = {
    success: { bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.35)', color: '#1D9E75' },
    warn:    { bg: 'rgba(255,170,0,0.06)',  border: 'rgba(255,170,0,0.3)',   color: '#ffaa00' },
  }
  const s = map[kind]
  return {
    padding: '12px 16px',
    background: s.bg,
    border: `1px solid ${s.border}`,
    color: s.color,
    fontFamily: 'var(--font-mono), monospace',
    fontSize: 11,
    letterSpacing: '0.05em',
    marginBottom: 24,
  }
}
