'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Shop = {
  id: string
  name: string
  slug: string | null
  description: string | null
  city: string | null
  state: string | null
  phone: string | null
  rating: number | null
  review_count: number | null
  specialties: string[] | null
  is_verified: boolean | null
  is_claimed: boolean | null
  badge_dyno_onsite: boolean | null
  badge_top_rated: boolean | null
}

const TAGS = ['Dyno Tuning', 'Forced Induction', 'JDM', 'European', 'Domestic/Muscle', 'Engine Builds', 'Fabrication', 'Suspension', 'Remote Tuning', 'Track/Race']

function StarRating({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.floor(rating)))
  return (
    <span style={{ color: '#ff2233', fontSize: 13 }}>
      {'★'.repeat(r)}{'☆'.repeat(5 - r)}
    </span>
  )
}

export default function ShopsPage() {
  const [activeTag, setActiveTag] = useState('All')
  const [search, setSearch] = useState('')
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, slug, description, city, state, phone, rating, review_count, specialties, is_verified, is_claimed, badge_dyno_onsite, badge_top_rated')
        .eq('is_approved', true)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('review_count', { ascending: false, nullsFirst: false })

      if (cancelled) return
      if (error) {
        setError(error.message)
      } else {
        setShops((data as Shop[]) || [])
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return shops.filter(shop => {
      const specialties = shop.specialties || []
      const matchTag = activeTag === 'All' || specialties.includes(activeTag)
      const q = search.trim().toLowerCase()
      const matchSearch = q === '' ||
        (shop.name?.toLowerCase().includes(q) ?? false) ||
        (shop.city?.toLowerCase().includes(q) ?? false) ||
        specialties.some(s => s.toLowerCase().includes(q))
      return matchTag && matchSearch
    })
  }, [shops, activeTag, search])

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const tag of TAGS) {
      counts[tag] = shops.filter(s => (s.specialties || []).includes(tag)).length
    }
    return counts
  }, [shops])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 40 }}>
          <Link href="/shops" className="nav-link" style={{ color: 'var(--white)' }}>Find a Shop</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/list-shop" className="nav-link">List My Shop</Link>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11 }}>Sign In</Link>
          <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '10px 22px', fontSize: 11 }}>List Your Shop</Link>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ padding: '64px 52px 40px', background: 'var(--dark)', borderBottom: '1px solid var(--border)' }}>
        <div className="label-tl">Shop Directory</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(48px, 7vw, 96px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
          Central Florida<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Performance Shops.</em>
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: 15, maxWidth: 620, lineHeight: 1.8, marginBottom: 16 }}>
          {loading ? 'Loading directory...' : `${shops.length} performance shops across the Tampa to Port St. Lucie corridor — tagged by specialty so you find the right one for your build.`}
        </p>

        {/* Unclaimed disclaimer */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px solid var(--border)', background: 'var(--black)', marginBottom: 28 }}>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.22em', color: 'var(--grey)', textTransform: 'uppercase' }}>
            Some listings are aggregated from public directories.
          </span>
          <Link href="/list-shop" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.22em', color: '#ff2233', textTransform: 'uppercase', textDecoration: 'none' }}>
            Claim yours →
          </Link>
        </div>

        {/* Search */}
        <input
          className="input-tl"
          style={{ display: 'block', maxWidth: 480, marginBottom: 24 }}
          placeholder="Search by shop name, city, or specialty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Filter tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            onClick={() => setActiveTag('All')}
            className={`tag-tl ${activeTag === 'All' ? 'active' : ''}`}
            style={{ background: 'transparent', border: '1px solid', cursor: 'pointer' }}
          >
            All Shops ({shops.length})
          </button>
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`tag-tl ${activeTag === tag ? 'active' : ''}`}
              style={{ background: 'transparent', border: '1px solid', cursor: 'pointer' }}
            >
              {tag} ({tagCounts[tag] ?? 0})
            </button>
          ))}
        </div>
      </section>

      {/* SHOP GRID */}
      <section style={{ padding: '40px 52px' }}>
        {error ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid #ff2233', color: '#ff6677' }}>
            <div style={{ fontWeight: 800, fontSize: 24, textTransform: 'uppercase', marginBottom: 12 }}>Could not load shops</div>
            <p style={{ color: 'var(--grey)' }}>{error}</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '120px 40px', color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Loading directory...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 800, fontSize: 32, textTransform: 'uppercase', marginBottom: 12 }}>No shops found</div>
            <p style={{ color: 'var(--grey)' }}>Try a different filter — or <Link href="/list-shop" style={{ color: '#ff2233' }}>list your shop</Link> if it should be here.</p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', marginBottom: 20, textTransform: 'uppercase' }}>
              Showing {filtered.length} shop{filtered.length !== 1 ? 's' : ''}
              {activeTag !== 'All' ? ` · ${activeTag}` : ''}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
              {filtered.map(shop => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* LIST YOUR SHOP CTA */}
      <section style={{ padding: '64px 52px', background: 'var(--dark)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="label-tl" style={{ justifyContent: 'center' }}>Is your shop missing or unclaimed?</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(32px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 24 }}>
          Claim or Add.<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>It&rsquo;s Free.</em>
        </h2>
        <p style={{ color: 'var(--grey)', fontSize: 15, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.8 }}>
          Founding shops get verified status, featured placement, and direct input on how the platform gets built.
        </p>
        <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>Apply Now — Free</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 52px', background: 'var(--black)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em' }}>© 2025 TUNERLINK LLC</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['Contact','/contact']].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.15em', textDecoration: 'none', textTransform: 'uppercase' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}

function ShopCard({ shop }: { shop: Shop }) {
  const unclaimed = shop.is_claimed === false
  return (
    <div className="card-tl" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #ff2233, #ff6600)', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s' }} className="hover-bar" />

      {/* Status row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 18 }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.28em', color: '#ff2233', textTransform: 'uppercase' }}>
          {shop.city}{shop.state ? `, ${shop.state}` : ''}
        </span>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--lgrey)' }}>
          <StarRating rating={Number(shop.rating) || 0} /> {Number(shop.rating || 0).toFixed(1)} <span style={{ color: 'var(--grey)', fontSize: 10 }}>({shop.review_count ?? 0})</span>
        </span>
      </div>

      {/* Name + verification badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1, color: 'var(--white)', flex: 1 }}>{shop.name}</div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {shop.is_verified && (
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 8, padding: '3px 7px', border: '1px solid #1D9E75', color: '#1D9E75', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Verified</span>
        )}
        {unclaimed && (
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 8, padding: '3px 7px', border: '1px solid var(--grey)', color: 'var(--grey)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Unclaimed</span>
        )}
        {shop.badge_dyno_onsite && (
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 8, padding: '3px 7px', border: '1px solid var(--lgrey)', color: 'var(--lgrey)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Dyno On-Site</span>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.7, flexGrow: 1 }}>
        {shop.description || 'Shop profile coming soon.'}
      </p>

      {/* Specialty tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(shop.specialties || []).slice(0, 4).map(tag => (
          <span key={tag} className="tag-tl" style={{ fontSize: 9, padding: '3px 8px' }}>{tag}</span>
        ))}
      </div>

      {/* Phone + CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--lgrey)', letterSpacing: '0.1em' }}>📞 {shop.phone || 'Contact via TunerLink'}</span>
        <Link
          href={`/shops/${shop.id}`}
          className="btn-tl btn-red"
          style={{ padding: '8px 18px', fontSize: 10 }}
        >
          View Shop
        </Link>
      </div>
    </div>
  )
}
