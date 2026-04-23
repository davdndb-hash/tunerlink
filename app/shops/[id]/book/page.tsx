'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Service = {
  id: string
  name: string
  description: string | null
  category: string | null
  price_min: number | null
  price_max: number | null
  duration_hours: number | null
  instant_book: boolean | null
  is_active: boolean | null
}

type Vehicle = {
  id: string
  year: number | null
  make: string | null
  model: string | null
  trim: string | null
}

type Shop = {
  id: string
  name: string
  city: string | null
  state: string | null
}

export default function BookShopPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const shopId = params?.id as string

  const [authChecked, setAuthChecked] = useState(false)
  const [shop, setShop] = useState<Shop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [serviceId, setServiceId] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [notes, setNotes] = useState('')
  const [customerGoals, setCustomerGoals] = useState('')

  useEffect(() => {
    let cancelled = false

    async function init() {
      // Auth gate — redirect to login with next= if not signed in
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const next = encodeURIComponent(`/shops/${shopId}/book`)
        window.location.href = `/auth/login?next=${next}`
        return
      }
      if (cancelled) return
      setAuthChecked(true)

      // Load shop, services, and customer's vehicles in parallel
      const [shopRes, servicesRes, vehiclesRes] = await Promise.all([
        supabase
          .from('shops')
          .select('id, name, city, state, is_approved')
          .eq('id', shopId)
          .maybeSingle(),
        supabase
          .from('services')
          .select('id, name, description, category, price_min, price_max, duration_hours, instant_book, is_active')
          .eq('shop_id', shopId)
          .eq('is_active', true)
          .order('price_min', { ascending: true, nullsFirst: false }),
        supabase
          .from('vehicles')
          .select('id, year, make, model, trim')
          .eq('owner_id', session.user.id)
          .order('created_at', { ascending: false }),
      ])

      if (cancelled) return

      if (shopRes.error || !shopRes.data) {
        setError('Shop not found.')
        setLoading(false)
        return
      }
      if (!shopRes.data.is_approved) {
        setError('This shop is not currently accepting bookings.')
        setLoading(false)
        return
      }

      setShop({ id: shopRes.data.id, name: shopRes.data.name, city: shopRes.data.city, state: shopRes.data.state })
      setServices(servicesRes.data || [])
      setVehicles(vehiclesRes.data || [])
      if ((servicesRes.data || []).length === 1) {
        setServiceId((servicesRes.data || [])[0].id)
      }
      // Default to two days from today
      const d = new Date()
      d.setDate(d.getDate() + 2)
      setBookingDate(d.toISOString().split('T')[0])

      setLoading(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [shopId])

  const selected = services.find(s => s.id === serviceId)
  const total = Number(selected?.price_min || 0)
  const deposit = total ? Math.round(total * 0.5 * 100) / 100 : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!serviceId) {
      setError('Please pick a service.')
      return
    }
    if (!bookingDate) {
      setError('Please pick a date.')
      return
    }

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = `/auth/login?next=${encodeURIComponent(`/shops/${shopId}/book`)}`
        return
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          shopId,
          serviceId,
          bookingDate,
          bookingTime: bookingTime || null,
          vehicleId: vehicleId || null,
          notes: notes || null,
          customerGoals: customerGoals || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || 'Could not create booking.')
        setSubmitting(false)
        return
      }
      router.push(`/dashboard/bookings/${json.id}?created=1`)
    } catch (err: any) {
      setError(err?.message || 'Network error.')
      setSubmitting(false)
    }
  }

  if (!authChecked || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', color: 'var(--grey)', textTransform: 'uppercase' }}>Loading...</div>
      </div>
    )
  }

  if (error && !shop) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontSize: 18, marginBottom: 16, color: '#ff2233' }}>{error}</div>
        <Link href="/shops" className="btn-tl">Back to Shops</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href={`/shops/${shopId}`} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>← Back to shop</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 96px' }}>
        <div className="label-tl">Booking Request</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 12 }}>
          Book{' '}
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {shop?.name}.
          </em>
        </h1>
        {(shop?.city || shop?.state) && (
          <div style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 36 }}>
            {[shop?.city, shop?.state].filter(Boolean).join(', ')}
          </div>
        )}

        {services.length === 0 ? (
          <div style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No bookable services yet</div>
            <div style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 20 }}>
              This shop hasn&rsquo;t published any services. Reach out directly for a quote.
            </div>
            <Link href={`/shops/${shopId}`} className="btn-tl">View Shop Profile</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Service */}
            <div>
              <label style={labelStyle}>Service *</label>
              <select className="input-tl" value={serviceId} onChange={e => setServiceId(e.target.value)} required style={{ width: '100%' }}>
                <option value="">Select a service…</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.price_min ? ` — from $${Number(s.price_min).toFixed(0)}` : ''}
                    {s.duration_hours ? ` · ${Number(s.duration_hours)}h` : ''}
                  </option>
                ))}
              </select>
              {selected?.description && (
                <div style={{ color: 'var(--grey)', fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>{selected.description}</div>
              )}
            </div>

            {/* Date + Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Preferred date *</label>
                <input
                  type="date"
                  className="input-tl"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Time</label>
                <input
                  type="time"
                  className="input-tl"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Vehicle */}
            <div>
              <label style={labelStyle}>Vehicle</label>
              {vehicles.length === 0 ? (
                <div style={{ padding: '12px 16px', border: '1px dashed var(--border)', background: 'var(--dark)', color: 'var(--grey)', fontSize: 13 }}>
                  No vehicles on file. You can add details in the notes below, or{' '}
                  <Link href="/dashboard/vehicles" style={{ color: '#ff2233' }}>add one</Link> after submitting.
                </div>
              ) : (
                <select className="input-tl" value={vehicleId} onChange={e => setVehicleId(e.target.value)} style={{ width: '100%' }}>
                  <option value="">No vehicle selected</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {[v.year, v.make, v.model, v.trim].filter(Boolean).join(' ')}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Goals */}
            <div>
              <label style={labelStyle}>What are you trying to achieve?</label>
              <textarea
                className="input-tl"
                value={customerGoals}
                onChange={e => setCustomerGoals(e.target.value)}
                placeholder="e.g. 400whp daily driver, smooth low-end, no compromises on reliability."
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Anything the shop should know?</label>
              <textarea
                className="input-tl"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Existing mods, drop-off preferences, scheduling constraints…"
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Pricing summary */}
            {selected && total > 0 && (
              <div style={{ background: 'var(--dark)', border: '1px solid var(--border)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: 'var(--grey)', fontSize: 13 }}>Service starts at</span>
                  <span style={{ fontWeight: 700 }}>${total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: 'var(--grey)', fontSize: 13 }}>Deposit due on acceptance</span>
                  <span style={{ fontWeight: 700, color: '#ff2233' }}>${deposit.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', color: 'var(--grey)', fontSize: 11, lineHeight: 1.6 }}>
                  No charge today. The shop will review your request and send a final quote. Pay the deposit only after they accept.
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '12px 16px', border: '1px solid rgba(255,34,51,0.3)', background: 'rgba(255,34,51,0.05)', color: '#ff2233', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.05em' }}>
                ↳ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-tl btn-red"
              style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: 12, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Sending request…' : 'Send Booking Request'}
            </button>

            <p style={{ color: 'var(--grey)', fontSize: 11, textAlign: 'center', marginTop: -8 }}>
              By sending this request you agree to our{' '}
              <Link href="/terms" style={{ color: '#ff2233' }}>Terms</Link> and{' '}
              <Link href="/privacy" style={{ color: '#ff2233' }}>Privacy Policy</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'var(--lgrey)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 8,
}
