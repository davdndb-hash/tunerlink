'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Shop = {
  id: string
  name: string
  city: string | null
  state: string | null
  dyno_brand: string | null
  dyno_supports_awd: boolean | null
  dyno_indoor: boolean | null
}

type Package = {
  id: string
  name: string
  description: string | null
  num_pulls: number
  includes_afr_sweep: boolean
  includes_data_logging: boolean
  price_cents: number
  duration_minutes: number
}

export default function BookDinoPage() {
  const params = useParams<{ shopId: string }>()
  const shopId = params?.shopId

  const [shop, setShop] = useState<Shop | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (!shopId) return
    let cancelled = false
    const load = async () => {
      const [{ data: shopRow }, { data: pkgs }, { data: { user } }] = await Promise.all([
        supabase.from('shops')
          .select('id, name, city, state, dyno_brand, dyno_supports_awd, dyno_indoor')
          .eq('id', shopId)
          .eq('is_approved', true)
          .maybeSingle(),
        supabase.from('dyno_packages')
          .select('id, name, description, num_pulls, includes_afr_sweep, includes_data_logging, price_cents, duration_minutes')
          .eq('shop_id', shopId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase.auth.getUser(),
      ])
      if (cancelled) return
      setShop(shopRow as Shop)
      setPackages((pkgs as Package[]) || [])
      setAuthed(!!user)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [shopId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authed) {
      window.location.href = `/auth/login?next=/book/dino/${shopId}`
      return
    }
    if (!selectedPkg || !date) {
      setError('Pick a package and a date.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitting(false)
      return
    }

    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        shop_id: shopId,
        customer_id: user.id,
        booking_type: 'dyno',
        dyno_package_id: selectedPkg,
        scheduled_date: date,
        scheduled_time: time || null,
        notes: notes || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (bookingErr || !booking) {
      setError(bookingErr?.message || 'Could not create booking.')
      setSubmitting(false)
      return
    }

    // Redirect to deposit checkout (route already in place at /api/stripe — extend as needed)
    window.location.href = `/dashboard/bookings/${booking.id}?fresh=1`
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--grey)', display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase' }}>Loading…</div>
  }

  if (!shop) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'grid', placeItems: 'center', padding: 40, textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>Shop not found.</h1>
          <Link href="/dinos" className="btn-tl btn-red" style={{ padding: '12px 32px', fontSize: 11 }}>← Back to Dyno Pulls</Link>
        </div>
      </div>
    )
  }

  const selected = packages.find(p => p.id === selectedPkg)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 500, padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dinos" className="nav-link">← Back to Dynos</Link>
      </nav>

      <section style={{ padding: '64px 52px 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="label-tl">Booking</div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 12 }}>
          {shop.name}
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: 14 }}>
          {[shop.city, shop.state].filter(Boolean).join(', ')} · {shop.dyno_brand || 'Dyno'}{shop.dyno_supports_awd ? ' · AWD' : ''}{shop.dyno_indoor ? ' · Indoor' : ''}
        </p>
      </section>

      <section style={{ padding: '52px', maxWidth: 920, margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* PACKAGES */}
          <div>
            <div className="label-tl" style={{ marginBottom: 16 }}>1. Pick a package</div>
            {packages.length === 0 ? (
              <div style={{ padding: 24, border: '1px solid var(--border)', background: 'var(--dark)', color: 'var(--grey)' }}>
                This shop hasn't published their dyno packages yet. <Link href="/contact" style={{ color: '#ff2233' }}>Request a custom quote</Link>.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {packages.map(pkg => {
                  const active = selectedPkg === pkg.id
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkg(pkg.id)}
                      style={{
                        textAlign: 'left',
                        background: active ? 'rgba(255,34,51,0.06)' : 'var(--panel)',
                        border: `1px solid ${active ? '#ff2233' : 'var(--border)'}`,
                        padding: 24,
                        cursor: 'pointer',
                        color: 'var(--white)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase' }}>{pkg.name}</div>
                        <div style={{ fontWeight: 700, fontSize: 22, color: '#ff2233' }}>${(pkg.price_cents / 100).toFixed(0)}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--grey)', marginBottom: 12 }}>
                        {pkg.num_pulls} pull{pkg.num_pulls > 1 ? 's' : ''} · {pkg.duration_minutes} min
                      </div>
                      {pkg.description && <div style={{ fontSize: 13, color: 'var(--lgrey)', lineHeight: 1.6, marginBottom: 8 }}>{pkg.description}</div>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {pkg.includes_afr_sweep && <span style={{ fontSize: 9, padding: '3px 7px', border: '1px solid var(--border)', color: 'var(--lgrey)', letterSpacing: '.1em', textTransform: 'uppercase' }}>AFR Sweep</span>}
                        {pkg.includes_data_logging && <span style={{ fontSize: 9, padding: '3px 7px', border: '1px solid var(--border)', color: 'var(--lgrey)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Data Log</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* DATE/TIME */}
          <div>
            <div className="label-tl" style={{ marginBottom: 16 }}>2. Pick a date</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Date *</label>
                <input className="input-tl" type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Time (optional)</label>
                <input className="input-tl" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Vehicle / Notes (optional)</label>
            <textarea className="input-tl" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="2018 STi, EFR 8374, E85, looking for power baseline..." style={{ resize: 'vertical' }} />
          </div>

          {selected && (
            <div style={{ padding: 24, background: 'var(--dark)', border: '1px solid var(--border)' }}>
              <div className="label-tl" style={{ marginBottom: 8 }}>Summary</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--lgrey)' }}>{selected.name}</span>
                <span style={{ fontWeight: 700 }}>${(selected.price_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', border: '1px solid rgba(255,34,51,0.3)', background: 'rgba(255,34,51,0.05)', color: '#ff2233', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em' }}>↳ {error}</div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedPkg || !date}
            className="btn-tl btn-red"
            style={{ padding: '16px', fontSize: 12, opacity: (submitting || !selectedPkg || !date) ? 0.5 : 1 }}
          >
            {submitting ? 'Booking…' : authed ? 'Request Booking' : 'Sign In to Book'}
          </button>

          <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--grey)', textAlign: 'center', textTransform: 'uppercase' }}>
            Shop confirms before any payment is taken.
          </p>
        </form>
      </section>
    </div>
  )
}
