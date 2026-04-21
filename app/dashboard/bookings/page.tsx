'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Booking = {
  id: string
  status: string | null
  booking_date: string | null
  booking_time: string | null
  notes: string | null
  customer_goals: string | null
  total_amount: number | null
  deposit_paid: boolean | null
  final_paid: boolean | null
  created_at: string
  shop: { id: string; name: string; city: string | null; state: string | null; phone: string | null } | null
  service: { id: string; name: string | null } | null
  customer: { id: string; full_name: string | null; email: string | null } | null
}

export default function BookingsPage() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [role, setRole] = useState<'customer' | 'shop' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/bookings'
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const userRole = profile?.role === 'shop' ? 'shop' : 'customer'
      setRole(userRole)

      let query = supabase
        .from('bookings')
        .select(`
          id, status, booking_date, booking_time, notes, customer_goals, total_amount,
          deposit_paid, final_paid, created_at,
          shop:shops(id, name, city, state, phone),
          service:services(id, name),
          customer:profiles!bookings_customer_id_fkey(id, full_name, email)
        `)
        .order('booking_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (userRole === 'customer') {
        query = query.eq('customer_id', user.id)
      } else {
        // Shop view: join via owned shop_id
        const { data: ownedShops } = await supabase.from('shops').select('id').eq('owner_id', user.id)
        const ids = (ownedShops || []).map(s => s.id)
        if (ids.length === 0) {
          setBookings([])
          setLoading(false)
          return
        }
        query = query.in('shop_id', ids)
      }

      const { data, error } = await query
      if (error) {
        setError(error.message)
      } else {
        setBookings((data as any) || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <DashboardNav />

      <div style={{ padding: 52 }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Dashboard
        </Link>

        <div className="label-tl" style={{ marginTop: 32 }}>Bookings</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
          {role === 'shop' ? 'Incoming' : 'Your'} <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Bookings.</em>
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
        ) : error ? (
          <div style={{ border: '1px solid #ff2233', padding: 32, color: '#ff6677' }}>{error}</div>
        ) : bookings.length === 0 ? (
          <div style={{ border: '1px solid var(--border)', padding: 64, textAlign: 'center', background: 'var(--dark)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📅</div>
            <h2 style={{ fontWeight: 700, fontSize: 24, textTransform: 'uppercase', marginBottom: 8 }}>No bookings yet</h2>
            <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.7 }}>
              {role === 'shop'
                ? 'Customer bookings will appear here once they start rolling in. Complete your shop profile to get more visibility.'
                : 'You haven\u2019t booked any work yet. Browse verified specialists near you to get started.'}
            </p>
            <Link href={role === 'shop' ? '/dashboard/shop' : '/shops'} className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11 }}>
              {role === 'shop' ? 'Complete Profile' : 'Find a Shop'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {bookings.map(b => <BookingRow key={b.id} booking={b} role={role} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function BookingRow({ booking, role }: { booking: Booking; role: 'customer' | 'shop' | null }) {
  const statusColor: Record<string, string> = {
    pending: '#ffaa00',
    confirmed: '#1D9E75',
    in_progress: '#5288ff',
    completed: '#1D9E75',
    cancelled: 'var(--grey)',
    disputed: '#ff2233',
  }
  const color = statusColor[booking.status || 'pending'] || 'var(--grey)'

  return (
    <div style={{ background: 'var(--dark)', padding: '24px 28px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 24, alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, textTransform: 'uppercase', marginBottom: 4 }}>
          {booking.shop?.name || 'Shop'} {role === 'shop' && booking.customer?.full_name && `· ${booking.customer.full_name}`}
        </div>
        <div style={{ color: 'var(--grey)', fontSize: 13 }}>{booking.service?.name || 'Service'}</div>
      </div>
      <div style={{ color: 'var(--lgrey)', fontSize: 13 }}>
        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'TBD'}
        {booking.booking_time && <div style={{ fontSize: 12, color: 'var(--grey)' }}>{booking.booking_time}</div>}
      </div>
      <div>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, padding: '4px 10px', border: `1px solid ${color}`, color, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {booking.status || 'pending'}
        </span>
      </div>
      <div style={{ color: 'var(--white)', fontWeight: 600, fontSize: 16 }}>
        {booking.total_amount ? `$${Number(booking.total_amount).toLocaleString()}` : '—'}
      </div>
    </div>
  )
}

function DashboardNav() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
        <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
      </Link>
      <Link href="/dashboard" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Dashboard</Link>
    </nav>
  )
}
