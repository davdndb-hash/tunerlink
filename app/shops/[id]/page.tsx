'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Shop = {
  id: string
  name: string
  slug: string | null
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  phone: string | null
  email: string | null
  website: string | null
  specialties: string[] | null
  certifications: string[] | null
  rating: number | null
  review_count: number | null
  is_verified: boolean | null
  is_claimed: boolean | null
  badge_identity: boolean | null
  badge_licensed: boolean | null
  badge_insured: boolean | null
  badge_dyno_onsite: boolean | null
  badge_top_rated: boolean | null
  cover_image_url: string | null
}

type Service = {
  id: string
  name: string
  description: string | null
  category: string | null
  price_min: number | null
  price_max: number | null
  duration_hours: number | null
  instant_book: boolean | null
}

type Review = {
  id: string
  rating: number | null
  content: string | null
  created_at: string
}

type Availability = {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ShopDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      const [shopRes, servicesRes, reviewsRes, availRes] = await Promise.all([
        supabase.from('shops').select('*').eq('id', id).maybeSingle(),
        supabase.from('services').select('*').eq('shop_id', id).eq('is_active', true).order('price_min', { ascending: true, nullsFirst: false }),
        supabase.from('reviews').select('id, rating, content, created_at').eq('shop_id', id).order('created_at', { ascending: false }).limit(10),
        supabase.from('availability').select('day_of_week, open_time, close_time, is_closed').eq('shop_id', id).order('day_of_week'),
      ])

      if (cancelled) return

      if (shopRes.error) {
        setError(shopRes.error.message)
      } else if (!shopRes.data) {
        setError('Shop not found.')
      } else {
        setShop(shopRes.data as Shop)
      }
      if (servicesRes.data) setServices(servicesRes.data as Service[])
      if (reviewsRes.data) setReviews(reviewsRes.data as Review[])
      if (availRes.data) setAvailability(availRes.data as Availability[])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
        Loading shop...
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', padding: 52 }}>
        <Link href="/shops" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: '#ff2233', textTransform: 'uppercase', textDecoration: 'none' }}>← Back to Shops</Link>
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
          <h1 style={{ fontWeight: 800, fontSize: 36, textTransform: 'uppercase', marginBottom: 12 }}>{error || 'Shop not found'}</h1>
          <Link href="/shops" className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11, marginTop: 20, display: 'inline-block' }}>Browse all shops</Link>
        </div>
      </div>
    )
  }

  const unclaimed = shop.is_claimed === false
  const fullAddress = [shop.address, shop.city, shop.state, shop.zip].filter(Boolean).join(', ')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/shops" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← All Shops
        </Link>
      </nav>

      {/* UNCLAIMED BANNER */}
      {unclaimed && (
        <div style={{ padding: '12px 52px', background: 'rgba(255,170,0,0.08)', borderBottom: '1px solid rgba(255,170,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.18em', color: '#ffaa00', textTransform: 'uppercase' }}>
            ⚠ This listing was aggregated from public business directories.
          </span>
          <Link href="/list-shop" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.18em', color: '#ffaa00', textTransform: 'uppercase', textDecoration: 'underline' }}>
            Own this shop? Claim it →
          </Link>
        </div>
      )}

      {/* HERO */}
      <section style={{ padding: '64px 52px 40px', background: 'var(--dark)', borderBottom: '1px solid var(--border)' }}>
        <div className="label-tl">{shop.city}{shop.state ? `, ${shop.state}` : ''}</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(40px, 6vw, 84px)', textTransform: 'uppercase', lineHeight: 0.92, marginBottom: 16 }}>
          {shop.name}
        </h1>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 13, color: 'var(--white)' }}>
            {'★'.repeat(Math.floor(Number(shop.rating) || 0))}
            <span style={{ color: 'var(--grey)' }}>{'★'.repeat(5 - Math.floor(Number(shop.rating) || 0))}</span>
            <span style={{ marginLeft: 8 }}>{Number(shop.rating || 0).toFixed(1)}</span>
            <span style={{ color: 'var(--grey)', marginLeft: 6 }}>({shop.review_count ?? 0} reviews)</span>
          </span>
          {shop.is_verified && <Badge color="#1D9E75">✓ Verified</Badge>}
          {unclaimed && <Badge color="var(--grey)">Unclaimed</Badge>}
          {shop.badge_dyno_onsite && <Badge>Dyno On-Site</Badge>}
          {shop.badge_top_rated && <Badge color="#ff2233">Top Rated</Badge>}
          {shop.badge_licensed && <Badge>Licensed</Badge>}
          {shop.badge_insured && <Badge>Insured</Badge>}
        </div>

        <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8, maxWidth: 760, marginBottom: 32 }}>
          {shop.description || 'No description available yet.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
          {(shop.specialties || []).map(tag => (
            <span key={tag} className="tag-tl" style={{ fontSize: 10, padding: '4px 10px' }}>{tag}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {unclaimed ? (
            <>
              {shop.phone && !shop.phone.toLowerCase().includes('call for') && (
                <a href={`tel:${shop.phone.replace(/\D/g, '')}`} className="btn-tl btn-red" style={{ padding: '14px 32px', fontSize: 11 }}>
                  📞 Call {shop.phone}
                </a>
              )}
              <Link href="/list-shop" className="btn-tl" style={{ padding: '14px 32px', fontSize: 11 }}>
                Claim This Listing
              </Link>
            </>
          ) : (
            <>
              <Link href={`/auth/login?next=/shops/${shop.id}`} className="btn-tl btn-red" style={{ padding: '14px 32px', fontSize: 11 }}>
                Sign In to Book
              </Link>
              {shop.phone && (
                <a href={`tel:${shop.phone.replace(/\D/g, '')}`} className="btn-tl" style={{ padding: '14px 32px', fontSize: 11 }}>
                  📞 {shop.phone}
                </a>
              )}
            </>
          )}
        </div>
      </section>

      {/* TWO COLUMN */}
      <section style={{ padding: '52px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 52 }}>
        <div>
          {/* Services */}
          <div className="label-tl">Services</div>
          {services.length === 0 ? (
            <div style={{ border: '1px solid var(--border)', padding: 32, color: 'var(--grey)', fontSize: 14, marginBottom: 48 }}>
              {unclaimed
                ? 'This shop hasn\u2019t added their service menu to TunerLink yet. Contact them directly using the phone number above, or ask them to claim their listing.'
                : 'No services listed yet.'}
            </div>
          ) : (
            <div style={{ marginBottom: 48 }}>
              {services.map(svc => (
                <div key={svc.id} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0', display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, textTransform: 'uppercase', marginBottom: 6 }}>{svc.name}</div>
                    {svc.description && <p style={{ color: 'var(--grey)', fontSize: 13, lineHeight: 1.7 }}>{svc.description}</p>}
                    {svc.duration_hours && (
                      <p style={{ color: 'var(--lgrey)', fontSize: 11, fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.15em', marginTop: 6, textTransform: 'uppercase' }}>
                        ~{svc.duration_hours} hr · {svc.instant_book ? 'Instant Book' : 'Quote Required'}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    {svc.price_min !== null && (
                      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--white)' }}>
                        ${Number(svc.price_min).toLocaleString()}{svc.price_max ? ` – $${Number(svc.price_max).toLocaleString()}` : '+'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          <div className="label-tl">Reviews</div>
          {reviews.length === 0 ? (
            <div style={{ border: '1px solid var(--border)', padding: 32, color: 'var(--grey)', fontSize: 14 }}>
              No reviews on TunerLink yet. {unclaimed && 'Aggregated rating shown above is from public sources.'}
            </div>
          ) : (
            <div>
              {reviews.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
                  <div style={{ color: '#ff2233', marginBottom: 8 }}>
                    {'★'.repeat(r.rating || 0)}<span style={{ color: 'var(--grey)' }}>{'★'.repeat(5 - (r.rating || 0))}</span>
                  </div>
                  <p style={{ color: 'var(--lgrey)', fontSize: 14, lineHeight: 1.7 }}>{r.content}</p>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div style={{ border: '1px solid var(--border)', padding: 24, marginBottom: 24, background: 'var(--dark)' }}>
            <div className="label-tl" style={{ marginBottom: 16 }}>Contact</div>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--lgrey)' }}>
              {fullAddress && <div>📍 {fullAddress}</div>}
              {shop.phone && <div>📞 <a href={`tel:${shop.phone.replace(/\D/g, '')}`} style={{ color: '#ff2233' }}>{shop.phone}</a></div>}
              {shop.email && <div>✉️ <a href={`mailto:${shop.email}`} style={{ color: '#ff2233' }}>{shop.email}</a></div>}
              {shop.website && <div>🌐 <a href={shop.website} target="_blank" rel="noopener noreferrer" style={{ color: '#ff2233' }}>Website ↗</a></div>}
            </div>
          </div>

          {availability.length > 0 && (
            <div style={{ border: '1px solid var(--border)', padding: 24, marginBottom: 24, background: 'var(--dark)' }}>
              <div className="label-tl" style={{ marginBottom: 16 }}>Hours</div>
              {availability.map(a => (
                <div key={a.day_of_week} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', color: 'var(--lgrey)', fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.1em' }}>
                  <span>{DAYS[a.day_of_week]}</span>
                  <span>{a.is_closed ? 'Closed' : `${formatTime(a.open_time)} – ${formatTime(a.close_time)}`}</span>
                </div>
              ))}
            </div>
          )}

          {(shop.certifications || []).length > 0 && (
            <div style={{ border: '1px solid var(--border)', padding: 24, background: 'var(--dark)' }}>
              <div className="label-tl" style={{ marginBottom: 16 }}>Certifications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(shop.certifications || []).map(c => (
                  <span key={c} style={{ fontSize: 12, color: 'var(--lgrey)' }}>✓ {c}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

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

function Badge({ children, color = 'var(--lgrey)' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, padding: '4px 10px', border: `1px solid ${color}`, color, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

function formatTime(t: string | null): string {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}
