'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ShopProfileEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [shopId, setShopId] = useState<string | null>(null)

  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: 'FL',
    zip: '',
    phone: '',
    email: '',
    website: '',
    specialties: '',
    certifications: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/shop'
        return
      }
      setUserId(user.id)

      const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (shop) {
        setShopId(shop.id)
        setForm({
          name: shop.name || '',
          description: shop.description || '',
          address: shop.address || '',
          city: shop.city || '',
          state: shop.state || 'FL',
          zip: shop.zip || '',
          phone: shop.phone || '',
          email: shop.email || '',
          website: shop.website || '',
          specialties: (shop.specialties || []).join(', '),
          certifications: (shop.certifications || []).join(', '),
        })
      }

      setLoading(false)
    }
    init()
  }, [])

  const update = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const payload: any = {
      owner_id: userId,
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      specialties: form.specialties ? form.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      certifications: form.certifications ? form.certifications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      is_claimed: true,
    }

    const res = shopId
      ? await supabase.from('shops').update(payload).eq('id', shopId)
      : await supabase.from('shops').insert(payload).select('id').single()

    if (res.error) {
      setError(res.error.message)
    } else {
      setSuccess(true)
      if (!shopId && 'data' in res && res.data) setShopId((res.data as any).id)
    }
    setSaving(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dashboard" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Dashboard</Link>
      </nav>

      <div style={{ padding: 52, maxWidth: 960, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Dashboard
        </Link>

        <div className="label-tl" style={{ marginTop: 32 }}>Shop Profile</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
          {shopId ? 'Edit Your ' : 'Create Your '}
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Shop.</em>
        </h1>

        {loading ? (
          <div style={{ color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
        ) : (
          <form onSubmit={handleSave} style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)' }}>
            {success && (
              <div style={{ marginBottom: 24, padding: '12px 16px', border: '1px solid #1D9E75', background: 'rgba(29,158,117,0.08)', fontSize: 13, color: '#1D9E75' }}>
                ✓ Profile saved
              </div>
            )}
            {error && (
              <div style={{ marginBottom: 24, padding: '12px 16px', border: '1px solid #ff2233', background: 'rgba(255,34,51,0.08)', fontSize: 13, color: '#ff6677' }}>
                {error}
              </div>
            )}

            <Field label="Shop Name" required><input className="input-tl" value={form.name} onChange={e => update('name', e.target.value)} required /></Field>

            <div style={{ marginTop: 16 }}>
              <Field label="Description"><textarea className="input-tl" value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Tell customers what makes your shop different." style={{ resize: 'vertical', minHeight: 100, fontFamily: 'inherit' }} /></Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginTop: 16 }}>
              <Field label="City"><input className="input-tl" value={form.city} onChange={e => update('city', e.target.value)} /></Field>
              <Field label="State"><input className="input-tl" value={form.state} onChange={e => update('state', e.target.value)} maxLength={2} /></Field>
              <Field label="ZIP"><input className="input-tl" value={form.zip} onChange={e => update('zip', e.target.value)} /></Field>
            </div>

            <div style={{ marginTop: 16 }}>
              <Field label="Street Address"><input className="input-tl" value={form.address} onChange={e => update('address', e.target.value)} /></Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
              <Field label="Phone"><input className="input-tl" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 123-4567" /></Field>
              <Field label="Public Email"><input className="input-tl" type="email" value={form.email} onChange={e => update('email', e.target.value)} /></Field>
              <Field label="Website"><input className="input-tl" type="url" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://..." /></Field>
            </div>

            <div style={{ marginTop: 16 }}>
              <Field label="Specialties (comma-separated)"><input className="input-tl" value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="Dyno Tuning, JDM, Forced Induction" /></Field>
            </div>

            <div style={{ marginTop: 16 }}>
              <Field label="Certifications (comma-separated)"><input className="input-tl" value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="ASE Master, Cobb Pro Tuner, APR Dealer" /></Field>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button type="submit" disabled={saving} className="btn-tl btn-red" style={{ padding: '14px 36px', fontSize: 11, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : shopId ? 'Save Changes' : 'Create Profile'}
              </button>
              {shopId && (
                <Link href={`/shops/${shopId}`} className="btn-tl" style={{ padding: '14px 36px', fontSize: 11 }}>
                  View Public Page
                </Link>
              )}
            </div>
          </form>
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
