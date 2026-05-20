'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

/**
 * Shop availability editor.
 *
 * The `availability` table has no unique (shop_id, day_of_week) index, so to
 * keep things simple we treat the week as 7 rows and on save:
 *   1) delete all availability rows for this shop
 *   2) insert a fresh 7-row snapshot
 *
 * RLS ("Shop owners can manage availability") scopes both operations to the
 * signed-in owner's shop.
 */

const DAYS = [
  { idx: 0, label: 'Sunday' },
  { idx: 1, label: 'Monday' },
  { idx: 2, label: 'Tuesday' },
  { idx: 3, label: 'Wednesday' },
  { idx: 4, label: 'Thursday' },
  { idx: 5, label: 'Friday' },
  { idx: 6, label: 'Saturday' },
]

type Row = {
  day_of_week: number
  open_time: string    // 'HH:mm'
  close_time: string   // 'HH:mm'
  is_closed: boolean
}

const DEFAULTS: Row[] = DAYS.map(d => ({
  day_of_week: d.idx,
  open_time: '09:00',
  close_time: '17:00',
  // Sunday closed by default
  is_closed: d.idx === 0,
}))

/** 'HH:mm:ss' or 'HH:mm' → 'HH:mm' */
const normTime = (t: string | null | undefined): string => {
  if (!t) return '09:00'
  const m = /^([0-9]{2}):([0-9]{2})/.exec(t)
  return m ? `${m[1]}:${m[2]}` : '09:00'
}

export default function ShopAvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [shopId, setShopId] = useState<string | null>(null)
  const [rows, setRows] = useState<Row[]>(DEFAULTS)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/shop/availability'
        return
      }

      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (!shop) {
        setLoading(false)
        return
      }
      setShopId(shop.id)

      const { data: avail } = await supabase
        .from('availability')
        .select('day_of_week, open_time, close_time, is_closed')
        .eq('shop_id', shop.id)

      if (avail && avail.length > 0) {
        // Merge: start from defaults, overlay any rows we found.
        // If multiple rows exist for the same day (legacy) the later one wins.
        const merged = [...DEFAULTS]
        for (const r of avail) {
          const i = merged.findIndex(m => m.day_of_week === r.day_of_week)
          if (i >= 0) {
            merged[i] = {
              day_of_week: r.day_of_week as number,
              open_time: normTime(r.open_time as any),
              close_time: normTime(r.close_time as any),
              is_closed: !!r.is_closed,
            }
          }
        }
        setRows(merged)
      }

      setLoading(false)
    }
    init()
  }, [])

  const updateRow = (idx: number, patch: Partial<Row>) => {
    setRows(prev => prev.map(r => (r.day_of_week === idx ? { ...r, ...patch } : r)))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopId) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    // Validate: for open days, close_time must be after open_time
    for (const r of rows) {
      if (!r.is_closed && r.close_time <= r.open_time) {
        const label = DAYS.find(d => d.idx === r.day_of_week)?.label || ''
        setError(`${label}: closing time must be after opening time.`)
        setSaving(false)
        return
      }
    }

    // 1) wipe existing rows for this shop
    const { error: delErr } = await supabase.from('availability').delete().eq('shop_id', shopId)
    if (delErr) {
      setError(delErr.message)
      setSaving(false)
      return
    }

    // 2) insert fresh snapshot — save all 7 days (open or closed) so the
    //    shape is stable. Times are stored regardless of is_closed; the public
    //    page respects is_closed first.
    const payload = rows.map(r => ({
      shop_id: shopId,
      day_of_week: r.day_of_week,
      open_time: `${r.open_time}:00`,
      close_time: `${r.close_time}:00`,
      is_closed: r.is_closed,
    }))

    const { error: insErr } = await supabase.from('availability').insert(payload)
    if (insErr) {
      setError(insErr.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dashboard/shop" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Shop Profile</Link>
      </nav>

      <div style={{ padding: 52, maxWidth: 960, margin: '0 auto' }}>
        <Link href="/dashboard/shop" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Shop Profile
        </Link>

        <div className="label-tl" style={{ marginTop: 32 }}>Availability</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 12 }}>
          Weekly <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Hours.</em>
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 620, lineHeight: 1.7, marginBottom: 32 }}>
          Set the hours you&apos;re open to new bookings. Customers see this on your public listing.
        </p>

        {loading ? (
          <div style={{ color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
        ) : !shopId ? (
          <div style={{ border: '1px solid var(--border)', padding: 48, background: 'var(--dark)', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔧</div>
            <h2 style={{ fontWeight: 700, fontSize: 24, textTransform: 'uppercase', marginBottom: 12 }}>No Shop Linked</h2>
            <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.7 }}>
              You need an approved, claimed shop before you can set hours.
            </p>
            <Link href="/dashboard/shop" className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11 }}>
              Go to Shop Profile
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ border: '1px solid var(--border)', background: 'var(--dark)' }}>
            {success && (
              <div style={{ margin: 24, marginBottom: 0, padding: '12px 16px', border: '1px solid #1D9E75', background: 'rgba(29,158,117,0.08)', fontSize: 13, color: '#1D9E75' }}>
                ✓ Hours saved
              </div>
            )}
            {error && (
              <div style={{ margin: 24, marginBottom: 0, padding: '12px 16px', border: '1px solid #ff2233', background: 'rgba(255,34,51,0.08)', fontSize: 13, color: '#ff6677' }}>
                {error}
              </div>
            )}

            <div>
              {rows.map((r, i) => {
                const label = DAYS.find(d => d.idx === r.day_of_week)?.label || ''
                return (
                  <div key={r.day_of_week} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 160px', gap: 16, alignItems: 'center', padding: '18px 24px', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {label}
                    </div>

                    <div>
                      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 6 }}>Opens</div>
                      <input
                        type="time"
                        className="input-tl"
                        value={r.open_time}
                        onChange={e => updateRow(r.day_of_week, { open_time: e.target.value })}
                        disabled={r.is_closed}
                        style={{ opacity: r.is_closed ? 0.4 : 1 }}
                      />
                    </div>

                    <div>
                      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 6 }}>Closes</div>
                      <input
                        type="time"
                        className="input-tl"
                        value={r.close_time}
                        onChange={e => updateRow(r.day_of_week, { close_time: e.target.value })}
                        disabled={r.is_closed}
                        style={{ opacity: r.is_closed ? 0.4 : 1 }}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, justifyContent: 'flex-end' }}>
                      <input
                        type="checkbox"
                        checked={r.is_closed}
                        onChange={e => updateRow(r.day_of_week, { is_closed: e.target.checked })}
                      />
                      <span>Closed</span>
                    </label>
                  </div>
                )
              })}
            </div>

            <div style={{ padding: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="submit" disabled={saving} className="btn-tl btn-red" style={{ padding: '14px 32px', fontSize: 11, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Hours'}
              </button>
              <Link href="/dashboard/shop" className="btn-tl" style={{ padding: '14px 32px', fontSize: 11 }}>
                Back to Profile
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
