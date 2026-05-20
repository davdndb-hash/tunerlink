'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [claimBanner, setClaimBanner] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null)
  const [shopStats, setShopStats] = useState<any>(null)
  const [customerStats, setCustomerStats] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        window.location.href = '/auth/login'
        return
      }
      setUser(user)

      // If a ?claim=<shopId> is in the URL, try to claim the shop.
      // This runs the first time a newly-approved shop owner hits the dashboard.
      const url = new URL(window.location.href)
      const claimShopId = url.searchParams.get('claim')
      if (claimShopId && session?.access_token) {
        try {
          const res = await fetch('/api/shop/claim', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ shopId: claimShopId }),
          })
          const json = await res.json()
          if (res.ok) {
            setClaimBanner({ kind: 'success', msg: '✓ Your shop has been claimed. Head to Shop Profile to finish setup.' })
          } else if (!json?.alreadyOwned) {
            setClaimBanner({ kind: 'error', msg: `Couldn't claim shop: ${json?.error || 'unknown error'}` })
          }
        } catch (e: any) {
          setClaimBanner({ kind: 'error', msg: `Couldn't claim shop: ${e?.message || 'network error'}` })
        } finally {
          // Drop the ?claim= param so refreshes don't retrigger
          url.searchParams.delete('claim')
          window.history.replaceState({}, '', url.toString())
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)

      // Best-effort stats — never block the dashboard if these fail.
      try {
        if (profile?.role === 'shop') {
          const { data: myShop } = await supabase
            .from('shops')
            .select('id, description, stripe_charges_enabled, is_approved')
            .eq('owner_id', user.id)
            .maybeSingle()

          if (myShop?.id) {
            const [bookingsRes, servicesRes, availRes, reviewsRes, revenueRes] = await Promise.all([
              supabase.from('bookings').select('id, status, total_amount, deposit_paid, final_paid', { count: 'exact' }).eq('shop_id', myShop.id),
              supabase.from('services').select('id', { count: 'exact', head: true }).eq('shop_id', myShop.id).eq('is_active', true),
              supabase.from('availability').select('id', { count: 'exact', head: true }).eq('shop_id', myShop.id),
              supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('shop_id', myShop.id),
              supabase.from('payments').select('amount_cents, status').eq('shop_id', myShop.id),
            ])

            const allBookings = (bookingsRes.data || []) as any[]
            const pending = allBookings.filter(b => b.status === 'pending').length
            const total = bookingsRes.count || 0
            const reviews = reviewsRes.count || 0
            const serviceCount = servicesRes.count || 0
            const availCount = availRes.count || 0
            const revenueCents = ((revenueRes.data || []) as any[])
              .filter(p => p.status === 'succeeded')
              .reduce((sum, p) => sum + (p.amount_cents || 0), 0)

            setShopStats({
              total,
              pending,
              reviews,
              revenueDollars: Math.round(revenueCents / 100),
              hasProfile: !!(myShop.description && myShop.description.length > 0),
              hasServices: serviceCount > 0,
              hasAvailability: availCount > 0,
              hasStripe: !!myShop.stripe_charges_enabled,
              isApproved: !!myShop.is_approved,
            })
          }
        } else {
          const [bookingsRes, vehiclesRes] = await Promise.all([
            supabase.from('bookings').select('id, status, booking_date, booking_time, shop:shops(id, name), service:services(id, name)').eq('customer_id', user.id).order('booking_date', { ascending: false }).limit(5),
            supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          ])
          setCustomerStats({
            recent: bookingsRes.data || [],
            vehicleCount: vehiclesRes.count || 0,
          })
        }
      } catch { /* ignore stat errors */ }

      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', color: 'var(--grey)', textTransform: 'uppercase' }}>Loading...</div>
      </div>
    )
  }

  const isShop = profile?.role === 'shop'
  const isAdmin = profile?.role === 'admin'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--grey)', textTransform: 'uppercase' }}>
            {profile?.full_name || user?.email}
          </span>
          <button onClick={handleSignOut} className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ padding: '52px' }}>

        {/* Welcome */}
        <div className="label-tl">Dashboard</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 48 }}>
          Welcome back,<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {profile?.full_name?.split(' ')[0] || 'Friend'}.
          </em>
        </h1>

        {claimBanner && (
          <div style={{
            marginBottom: 32,
            padding: '14px 18px',
            border: `1px solid ${claimBanner.kind === 'success' ? 'rgba(29,158,117,0.4)' : 'rgba(255,34,51,0.3)'}`,
            background: claimBanner.kind === 'success' ? 'rgba(29,158,117,0.08)' : 'rgba(255,34,51,0.06)',
            color: claimBanner.kind === 'success' ? '#1D9E75' : '#ff6677',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 12,
            letterSpacing: '0.05em',
          }}>
            {claimBanner.msg}
          </div>
        )}

        {isAdmin && <AdminPanel />}
        {isShop ? <ShopDashboard profile={profile} stats={shopStats} /> : <CustomerDashboard profile={profile} stats={customerStats} />}
      </div>
    </div>
  )
}

function AdminPanel() {
  return (
    <div style={{ marginBottom: 48 }}>
      <div className="label-tl" style={{ color: '#ff2233' }}>Admin</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid #ff2233' }}>
        {[
          { icon: '📝', label: 'Applications', sub: 'Review pending shop applications', href: '/dashboard/admin/applications', cta: 'Review Queue' },
          { icon: '🏪', label: 'Shops', sub: 'Manage all shop listings', href: '/shops', cta: 'View Shops' },
          { icon: '📊', label: 'Activity', sub: 'Bookings, payments, disputes', href: '/dashboard/bookings', cta: 'View Activity' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--dark)', padding: '32px 28px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{card.label}</div>
            <div style={{ color: 'var(--grey)', fontSize: 12, marginBottom: 18, lineHeight: 1.6 }}>{card.sub}</div>
            <Link href={card.href} className="btn-tl btn-red" style={{ padding: '9px 18px', fontSize: 10 }}>{card.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomerDashboard({ profile, stats }: { profile: any; stats: any }) {
  const recent = stats?.recent || []
  const vehicleCount = stats?.vehicleCount || 0
  return (
    <div>
      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 48 }}>
        {[
          { icon: '🔍', label: 'Find a Shop', sub: 'Browse verified shops', href: '/shops', cta: 'Browse Shops' },
          { icon: '📅', label: 'My Bookings', sub: 'View upcoming appointments', href: '/dashboard/bookings', cta: 'View Bookings' },
          { icon: '🚗', label: 'My Vehicles', sub: vehicleCount > 0 ? `${vehicleCount} vehicle${vehicleCount === 1 ? '' : 's'} on file` : 'Add your first car', href: '/dashboard/vehicles', cta: 'Manage Vehicles' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--dark)', padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{card.sub}</div>
            <Link href={card.href} className="btn-tl btn-red" style={{ padding: '10px 20px', fontSize: 10 }}>{card.cta}</Link>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="label-tl">Recent Bookings</div>
      {recent.length === 0 ? (
        <div style={{ border: '1px solid var(--border)', padding: '48px', textAlign: 'center', background: 'var(--dark)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 20, textTransform: 'uppercase', marginBottom: 8 }}>No bookings yet</div>
          <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Find a performance shop near you and book your first appointment.
          </p>
          <Link href="/shops" className="btn-tl btn-red" style={{ padding: '12px 32px', fontSize: 11 }}>Find a Shop</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {recent.map((b: any) => (
            <Link key={b.id} href={`/dashboard/bookings/${b.id}`} style={{ textDecoration: 'none', color: 'inherit', background: 'var(--dark)', padding: '20px 28px', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 20, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', marginBottom: 4 }}>{b.shop?.name || 'Shop'}</div>
                <div style={{ color: 'var(--grey)', fontSize: 12 }}>{b.service?.name || ''}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--lgrey)', letterSpacing: '0.1em' }}>
                {b.booking_date ? new Date(b.booking_date + 'T00:00:00').toLocaleDateString() : '—'}
              </div>
              <div>
                <StatusBadge status={b.status} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: '#ff2233', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                View →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string; border: string }> = {
    pending:     { bg: 'rgba(255,170,0,0.08)', fg: '#ffcf66', border: 'rgba(255,170,0,0.35)' },
    accepted:    { bg: 'rgba(29,158,117,0.08)', fg: '#1D9E75', border: 'rgba(29,158,117,0.4)' },
    in_progress: { bg: 'rgba(85,170,255,0.08)', fg: '#8cc4ff', border: 'rgba(85,170,255,0.35)' },
    completed:   { bg: 'rgba(29,158,117,0.12)', fg: '#3dcf95', border: 'rgba(29,158,117,0.5)' },
    declined:    { bg: 'rgba(255,34,51,0.08)', fg: '#ff6677', border: 'rgba(255,34,51,0.35)' },
    cancelled:   { bg: 'rgba(150,150,150,0.08)', fg: '#aaa', border: 'rgba(150,150,150,0.3)' },
  }
  const c = colors[status] || colors.pending
  return (
    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.2em', padding: '4px 10px', border: `1px solid ${c.border}`, background: c.bg, color: c.fg, textTransform: 'uppercase' }}>
      {status.replace('_', ' ')}
    </span>
  )
}

function ShopDashboard({ profile, stats }: { profile: any; stats: any }) {
  const s = stats || {}
  const checklist = [
    { label: 'Create your account', done: true, href: '' },
    { label: 'Complete your shop profile', done: !!s.hasProfile, href: '/dashboard/shop' },
    { label: 'Add your services & pricing', done: !!s.hasServices, href: '/dashboard/shop/services' },
    { label: 'Set your availability', done: !!s.hasAvailability, href: '/dashboard/shop/availability' },
    { label: 'Connect Stripe to receive payments', done: !!s.hasStripe, href: '/dashboard/payments' },
    { label: 'Go live — approved listing visible to customers', done: !!s.isApproved, href: '/shops' },
  ]

  return (
    <div>
      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 48 }}>
        {[
          { icon: '📋', label: 'Bookings', sub: s.pending ? `${s.pending} pending request${s.pending === 1 ? '' : 's'}` : 'Manage incoming requests', href: '/dashboard/bookings', cta: 'View Bookings' },
          { icon: '🏪', label: 'My Profile', sub: 'Update shop info & services', href: '/dashboard/shop', cta: 'Edit Profile' },
          { icon: '💬', label: 'Messages', sub: 'Chat with customers', href: '/dashboard/messages', cta: 'View Messages' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--dark)', padding: '40px 32px' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{card.sub}</div>
            <Link href={card.href} className="btn-tl btn-red" style={{ padding: '10px 20px', fontSize: 10 }}>{card.cta}</Link>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="label-tl">Your Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 48 }}>
        {[
          { n: String(s.total ?? 0), label: 'Total Bookings' },
          { n: String(s.pending ?? 0), label: 'Pending Requests' },
          { n: String(s.reviews ?? 0), label: 'Reviews' },
          { n: `$${Number(s.revenueDollars ?? 0).toLocaleString()}`, label: 'Revenue' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--dark)', padding: '32px 24px' }}>
            <div style={{ fontWeight: 800, fontSize: 48, lineHeight: 1, color: 'var(--white)', marginBottom: 8 }}>{stat.n}</div>
            <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.28em', color: 'var(--grey)', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Setup checklist */}
      <div className="label-tl">Setup Checklist</div>
      <div style={{ border: '1px solid var(--border)', background: 'var(--dark)' }}>
        {checklist.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: i < checklist.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 20, height: 20, border: `1px solid ${item.done ? '#1D9E75' : 'var(--border)'}`, background: item.done ? 'rgba(29,158,117,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#1D9E75', flexShrink: 0 }}>
                {item.done ? '✓' : ''}
              </div>
              <span style={{ fontSize: 14, color: item.done ? 'var(--grey)' : 'var(--white)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
            </div>
            {!item.done && item.href && (
              <Link href={item.href} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.15em', color: '#ff2233', textDecoration: 'none', textTransform: 'uppercase' }}>
                Do this →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}