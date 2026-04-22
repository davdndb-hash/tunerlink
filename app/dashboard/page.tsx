'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
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

        {isAdmin && <AdminPanel />}
        {isShop ? <ShopDashboard profile={profile} /> : <CustomerDashboard profile={profile} />}
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

function CustomerDashboard({ profile }: { profile: any }) {
  return (
    <div>
      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 48 }}>
        {[
          { icon: '🔍', label: 'Find a Shop', sub: 'Browse 21 verified shops', href: '/shops', cta: 'Browse Shops' },
          { icon: '📅', label: 'My Bookings', sub: 'View upcoming appointments', href: '/dashboard/bookings', cta: 'View Bookings' },
          { icon: '🚗', label: 'My Vehicles', sub: 'Manage your car profiles', href: '/dashboard/vehicles', cta: 'Manage Vehicles' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--dark)', padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{card.sub}</div>
            <Link href={card.href} className="btn-tl btn-red" style={{ padding: '10px 20px', fontSize: 10 }}>{card.cta}</Link>
          </div>
        ))}
      </div>

      {/* Recent bookings placeholder */}
      <div className="label-tl">Recent Bookings</div>
      <div style={{ border: '1px solid var(--border)', padding: '48px', textAlign: 'center', background: 'var(--dark)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <div style={{ fontWeight: 700, fontSize: 20, textTransform: 'uppercase', marginBottom: 8 }}>No bookings yet</div>
        <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.7 }}>
          Find a performance shop near you and book your first appointment.
        </p>
        <Link href="/shops" className="btn-tl btn-red" style={{ padding: '12px 32px', fontSize: 11 }}>Find a Shop</Link>
      </div>
    </div>
  )
}

function ShopDashboard({ profile }: { profile: any }) {
  return (
    <div>
      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 48 }}>
        {[
          { icon: '📋', label: 'Bookings', sub: 'Manage incoming requests', href: '/dashboard/bookings', cta: 'View Bookings' },
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
          { n: '0', label: 'Total Bookings' },
          { n: '0', label: 'Pending Requests' },
          { n: '0', label: 'Reviews' },
          { n: '$0', label: 'Revenue' },
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
        {[
          { label: 'Create your account', done: true },
          { label: 'Complete your shop profile', done: false, href: '/dashboard/shop' },
          { label: 'Add your services & pricing', done: false, href: '/dashboard/shop' },
          { label: 'Set your availability', done: false, href: '/dashboard/shop' },
          { label: 'Connect Stripe to receive payments', done: false, href: '/dashboard/payments' },
          { label: 'Go live — get your first booking', done: false, href: '/shops' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
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