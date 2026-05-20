'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/profile'
        return
      }
      setEmail(user.email || '')
      const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle()
      if (profile) {
        setFullName(profile.full_name || '')
        setPhone(profile.phone || '')
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, phone })

    if (error) setError(error.message)
    else setSaved(true)
    setSaving(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 500, padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dashboard" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Dashboard</Link>
      </nav>

      <section style={{ padding: '52px', maxWidth: 600, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>← Dashboard</Link>
        <div className="label-tl" style={{ marginTop: 24 }}>Account</div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
          Your <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Profile.</em>
        </h1>

        {loading ? (
          <div style={{ color: 'var(--grey)' }}>Loading…</div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
              <input className="input-tl" type="email" value={email} disabled style={{ opacity: 0.6 }} />
              <p style={{ fontSize: 11, color: 'var(--grey)', marginTop: 6 }}>Contact support to change your email.</p>
            </div>
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Full Name</label>
              <input className="input-tl" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Phone</label>
              <input className="input-tl" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            {error && <div style={{ padding: '12px 16px', border: '1px solid rgba(255,34,51,0.3)', background: 'rgba(255,34,51,0.05)', color: '#ff2233', fontSize: 12 }}>↳ {error}</div>}
            {saved && <div style={{ padding: '12px 16px', border: '1px solid #1D9E75', background: 'rgba(29,158,117,0.1)', color: '#1D9E75', fontSize: 12 }}>✓ Saved</div>}

            <button type="submit" disabled={saving} className="btn-tl btn-red" style={{ padding: '14px', fontSize: 12, opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
