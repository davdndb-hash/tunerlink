'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Service = {
  id: string
  shop_id: string | null
  name: string
  description: string | null
  category: string | null
  price_min: number | null
  price_max: number | null
  duration_hours: number | null
  instant_book: boolean | null
  is_active: boolean | null
}

type Draft = {
  id?: string
  name: string
  description: string
  category: string
  price_min: string
  price_max: string
  duration_hours: string
  instant_book: boolean
  is_active: boolean
}

const emptyDraft = (): Draft => ({
  name: '',
  description: '',
  category: '',
  price_min: '',
  price_max: '',
  duration_hours: '',
  instant_book: false,
  is_active: true,
})

export default function ShopServicesPage() {
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/shop/services'
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
      await refresh(shop.id)
      setLoading(false)
    }
    init()
  }, [])

  const refresh = async (sid: string) => {
    const { data, error: listErr } = await supabase
      .from('services')
      .select('*')
      .eq('shop_id', sid)
      .order('created_at', { ascending: true })
    if (listErr) {
      setError(listErr.message)
      return
    }
    setServices((data || []) as Service[])
  }

  const startNew = () => setDraft(emptyDraft())
  const startEdit = (s: Service) =>
    setDraft({
      id: s.id,
      name: s.name,
      description: s.description || '',
      category: s.category || '',
      price_min: s.price_min != null ? String(s.price_min) : '',
      price_max: s.price_max != null ? String(s.price_max) : '',
      duration_hours: s.duration_hours != null ? String(s.duration_hours) : '',
      instant_book: !!s.instant_book,
      is_active: s.is_active !== false,
    })
  const cancel = () => {
    setDraft(null)
    setError(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopId || !draft) return
    setSaving(true)
    setError(null)

    const payload = {
      shop_id: shopId,
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      category: draft.category.trim() || null,
      price_min: draft.price_min ? Number(draft.price_min) : null,
      price_max: draft.price_max ? Number(draft.price_max) : null,
      duration_hours: draft.duration_hours ? Number(draft.duration_hours) : null,
      instant_book: !!draft.instant_book,
      is_active: !!draft.is_active,
    }

    if (!payload.name) {
      setError('Service name is required')
      setSaving(false)
      return
    }

    const res = draft.id
      ? await supabase.from('services').update(payload).eq('id', draft.id)
      : await supabase.from('services').insert(payload)

    if (res.error) {
      setError(res.error.message)
    } else {
      await refresh(shopId)
      setDraft(null)
    }
    setSaving(false)
  }

  const handleToggleActive = async (s: Service) => {
    if (!shopId) return
    const { error: upErr } = await supabase
      .from('services')
      .update({ is_active: !s.is_active })
      .eq('id', s.id)
    if (upErr) setError(upErr.message)
    else await refresh(shopId)
  }

  const handleDelete = async (s: Service) => {
    if (!shopId) return
    if (!confirm(`Delete "${s.name}"? This removes the service from your listing but doesn't affect past bookings.`)) return
    const { error: delErr } = await supabase.from('services').delete().eq('id', s.id)
    if (delErr) setError(delErr.message)
    else await refresh(shopId)
  }

  const fmtPrice = (s: Service) => {
    if (s.price_min && s.price_max && s.price_min !== s.price_max) return `$${s.price_min} – $${s.price_max}`
    if (s.price_min) return `$${s.price_min}+`
    if (s.price_max) return `Up to $${s.price_max}`
    return 'Quote on request'
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

      <div style={{ padding: 52, maxWidth: 1080, margin: '0 auto' }}>
        <Link href="/dashboard/shop" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Shop Profile
        </Link>

        <div className="label-tl" style={{ marginTop: 32 }}>Services</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
          Manage Your <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Menu.</em>
        </h1>

        {loading ? (
          <div style={{ color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
        ) : !shopId ? (
          <div style={{ border: '1px solid var(--border)', padding: 48, background: 'var(--dark)', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔧</div>
            <h2 style={{ fontWeight: 700, fontSize: 24, textTransform: 'uppercase', marginBottom: 12 }}>No Shop Linked</h2>
            <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.7 }}>
              You need an approved, claimed shop before you can publish services.
            </p>
            <Link href="/dashboard/shop" className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11 }}>
              Go to Shop Profile
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ marginBottom: 24, padding: '12px 16px', border: '1px solid #ff2233', background: 'rgba(255,34,51,0.08)', fontSize: 13, color: '#ff6677' }}>
                {error}
              </div>
            )}

            {draft ? (
              <form onSubmit={handleSave} style={{ border: '1px solid var(--border)', padding: 28, background: 'var(--dark)', marginBottom: 32 }}>
                <h2 style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                  {draft.id ? 'Edit Service' : 'New Service'}
                </h2>

                <Field label="Service Name" required>
                  <input className="input-tl" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required />
                </Field>

                <div style={{ marginTop: 16 }}>
                  <Field label="Description">
                    <textarea className="input-tl" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} rows={3} placeholder="What's included, what customers should expect." style={{ resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }} />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                  <Field label="Category">
                    <input className="input-tl" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} placeholder="Dyno, Fab, Paint, etc." />
                  </Field>
                  <Field label="Price Min ($)">
                    <input className="input-tl" type="number" min="0" step="1" value={draft.price_min} onChange={e => setDraft({ ...draft, price_min: e.target.value })} />
                  </Field>
                  <Field label="Price Max ($)">
                    <input className="input-tl" type="number" min="0" step="1" value={draft.price_max} onChange={e => setDraft({ ...draft, price_max: e.target.value })} />
                  </Field>
                  <Field label="Duration (hrs)">
                    <input className="input-tl" type="number" min="0" step="0.5" value={draft.duration_hours} onChange={e => setDraft({ ...draft, duration_hours: e.target.value })} />
                  </Field>
                </div>

                <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={draft.instant_book} onChange={e => setDraft({ ...draft, instant_book: e.target.checked })} />
                    <span>Instant Book (skip shop confirmation)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={draft.is_active} onChange={e => setDraft({ ...draft, is_active: e.target.checked })} />
                    <span>Active (listed publicly)</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                  <button type="submit" disabled={saving} className="btn-tl btn-red" style={{ padding: '14px 32px', fontSize: 11, opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : draft.id ? 'Save Changes' : 'Create Service'}
                  </button>
                  <button type="button" onClick={cancel} className="btn-tl" style={{ padding: '14px 32px', fontSize: 11 }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginBottom: 32 }}>
                <button onClick={startNew} className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11 }}>
                  + Add New Service
                </button>
              </div>
            )}

            {services.length === 0 ? (
              <div style={{ border: '1px solid var(--border)', padding: 48, background: 'var(--dark)', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <h2 style={{ fontWeight: 700, fontSize: 20, textTransform: 'uppercase', marginBottom: 8 }}>No services yet</h2>
                <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
                  Add your first service to start accepting bookings.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
                {services.map(s => (
                  <div key={s.id} style={{ background: 'var(--dark)', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, textTransform: 'uppercase' }}>{s.name}</span>
                        {!s.is_active && (
                          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', padding: '3px 8px', border: '1px solid var(--grey)', color: 'var(--grey)', textTransform: 'uppercase' }}>
                            Hidden
                          </span>
                        )}
                        {s.instant_book && (
                          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', padding: '3px 8px', border: '1px solid #1D9E75', color: '#1D9E75', textTransform: 'uppercase' }}>
                            Instant
                          </span>
                        )}
                        {s.category && (
                          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', padding: '3px 8px', border: '1px solid var(--border)', color: 'var(--lgrey)', textTransform: 'uppercase' }}>
                            {s.category}
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <div style={{ color: 'var(--grey)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                          {s.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 20, fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--lgrey)', letterSpacing: '0.1em' }}>
                        <span>{fmtPrice(s)}</span>
                        {s.duration_hours ? <span>{s.duration_hours}h</span> : null}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => startEdit(s)} className="btn-tl" style={{ padding: '8px 16px', fontSize: 10 }}>Edit</button>
                      <button onClick={() => handleToggleActive(s)} className="btn-tl" style={{ padding: '8px 16px', fontSize: 10 }}>
                        {s.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => handleDelete(s)} className="btn-tl" style={{ padding: '8px 16px', fontSize: 10, color: '#ff6677', borderColor: 'rgba(255,34,51,0.4)' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}{required && <span style={{ color: '#ff2233' }}> *</span>}
      </div>
      {children}
    </label>
  )
}
