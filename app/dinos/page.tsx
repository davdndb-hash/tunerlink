'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type DinoShop = {
  id: string
  name: string
  slug: string | null
  description: string | null
  city: string | null
  state: string | null
  phone: string | null
  rating: number | null
  review_count: number | null
  is_verified: boolean | null
  dyno_brand: string | null
  dyno_supports_awd: boolean | null
  dyno_max_hp: number | null
  dyno_indoor: boolean | null
}

const BRANDS = ['All', 'Dynojet', 'Mustang', 'Dynapack', 'SuperFlow', 'Land & Sea']

export default function DinosPage() {
  const [activeBrand, setActiveBrand] = useState('All')
  const [awdOnly, setAwdOnly] = useState(false)
  const [indoorOnly, setIndoorOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [shops, setShops] = useState<DinoShop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, slug, description, city, state, phone, rating, review_count, is_verified, dyno_brand, dyno_supports_awd, dyno_max_hp, dyno_indoor, category')
        .eq('is_approved', true)
        .in('category', ['dyno_pull', 'both'])
        .order('rating', { ascending: false, nullsFirst: false })

      if (cancelled) return
      if (error) setError(error.message)
      else setShops((data as DinoShop[]) || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return shops.filter(s => {
      if (activeBrand !== 'All' && s.dyno_brand !== activeBrand) return false
      if (awdOnly && !s.dyno_supports_awd) return false
      if (indoorOnly && !s.dyno_indoor) return false
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        (s.name?.toLowerCase().includes(q) ?? false) ||
        (s.city?.toLowerCase().includes(q) ?? false) ||
        (s.dyno_brand?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [shops, activeBrand, awdOnly, indoorOnly, search])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      <section style={{ padding: '80px 52px 48px', borderBottom: '1px solid var(--border)' }}>
        <div className="label-tl">Dyno Pulls</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(48px, 8vw, 110px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
          Book a<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dyno.</em>
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8, maxWidth: 600 }}>
          Power runs, AFR sweeps, baseline data. No tuning — just dyno time on verified equipment. Pick your brand, your run count, lock the slot.
        </p>
      </section>

      {/* FILTERS */}
      <section style={{ padding: '32px 52px', borderBottom: '1px solid var(--border)', background: 'var(--dark)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input-tl"
            placeholder="Search by name, city, or dyno brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 280px', maxWidth: 360 }}
          />
          {BRANDS.map(b => (
            <button
              key={b}
              onClick={() => setActiveBrand(b)}
              className={`tag-tl ${activeBrand === b ? 'active' : ''}`}
              style={{ background: 'transparent', border: '1px solid', cursor: 'pointer' }}
            >
              {b}
            </button>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--lgrey)', cursor: 'pointer', marginLeft: 12 }}>
            <input type="checkbox" checked={awdOnly} onChange={e => setAwdOnly(e.target.checked)} /> AWD
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--lgrey)', cursor: 'pointer' }}>
            <input type="checkbox" checked={indoorOnly} onChange={e => setIndoorOnly(e.target.checked)} /> Indoor
          </label>
        </div>
      </section>

      {/* RESULTS */}
      <section style={{ padding: '52px' }}>
        {loading && <div style={{ color: 'var(--grey)', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase' }}>Loading…</div>}
        {error && <div style={{ color: '#ff2233' }}>{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--grey)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛞</div>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>No dyno providers match those filters yet.</p>
            <Link href="/list-shop" className="btn-tl btn-red" style={{ display: 'inline-block', marginTop: 20, padding: '12px 32px', fontSize: 11 }}>
              Run a dyno? List your shop
            </Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filtered.map(s => (
              <Link
                key={s.id}
                href={`/book/dino/${s.id}`}
                style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', background: 'var(--panel)', padding: 28, transition: 'border-color .2s, transform .2s', display: 'block' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ff2233'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.28em', color: '#ff2233', textTransform: 'uppercase' }}>
                    {s.dyno_brand || 'Dyno'}
                  </div>
                  {s.is_verified && <span style={{ fontSize: 10, color: '#1D9E75', letterSpacing: '.15em' }}>✓ VERIFIED</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 22, textTransform: 'uppercase', marginBottom: 6 }}>{s.name}</div>
                <div style={{ color: 'var(--grey)', fontSize: 12, marginBottom: 16 }}>
                  {[s.city, s.state].filter(Boolean).join(', ')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {s.dyno_supports_awd && <span style={{ fontSize: 10, padding: '4px 8px', border: '1px solid var(--border)', color: 'var(--lgrey)' }}>AWD</span>}
                  {s.dyno_indoor && <span style={{ fontSize: 10, padding: '4px 8px', border: '1px solid var(--border)', color: 'var(--lgrey)' }}>INDOOR</span>}
                  {s.dyno_max_hp && <span style={{ fontSize: 10, padding: '4px 8px', border: '1px solid var(--border)', color: 'var(--lgrey)' }}>{s.dyno_max_hp} HP</span>}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#ff2233', letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  Book a Pull →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer style={{ padding: '32px 52px', background: 'var(--dark)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em' }}>© 2025 TUNERLINK LLC</span>
        <Link href="/" style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em', textDecoration: 'none' }}>← HOME</Link>
      </footer>
    </div>
  )
}
