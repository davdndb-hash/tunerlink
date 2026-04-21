'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function MessagesPage() {
  const [loading, setLoading] = useState(true)
  const [threads, setThreads] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login?next=/dashboard/messages'
        return
      }

      // Grab bookings the user participates in (as customer or shop owner),
      // latest messages under each.
      const { data: ownedShops } = await supabase.from('shops').select('id').eq('owner_id', user.id)
      const shopIds = (ownedShops || []).map(s => s.id)

      let bookingsQuery = supabase.from('bookings').select('id, shop:shops(id, name), customer:profiles!bookings_customer_id_fkey(id, full_name)')
      if (shopIds.length > 0) {
        bookingsQuery = bookingsQuery.or(`customer_id.eq.${user.id},shop_id.in.(${shopIds.join(',')})`)
      } else {
        bookingsQuery = bookingsQuery.eq('customer_id', user.id)
      }
      const { data: bookings } = await bookingsQuery

      const bookingIds = (bookings || []).map(b => b.id)
      if (bookingIds.length === 0) {
        setThreads([])
        setLoading(false)
        return
      }

      const { data: latestMessages } = await supabase
        .from('messages')
        .select('booking_id, content, created_at')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false })

      const lastByBooking: Record<string, any> = {}
      for (const m of latestMessages || []) {
        if (!lastByBooking[m.booking_id]) lastByBooking[m.booking_id] = m
      }

      const built = (bookings || []).map((b: any) => ({
        booking_id: b.id,
        shop_name: b.shop?.name,
        customer_name: b.customer?.full_name,
        last_message: lastByBooking[b.id],
      }))

      setThreads(built)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/dashboard" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>Dashboard</Link>
      </nav>

      <div style={{ padding: 52 }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Dashboard
        </Link>

        <div className="label-tl" style={{ marginTop: 32 }}>Messages</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
          Your <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Threads.</em>
        </h1>

        {loading ? (
          <div style={{ color: 'var(--grey)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</div>
        ) : threads.length === 0 ? (
          <div style={{ border: '1px solid var(--border)', padding: 64, textAlign: 'center', background: 'var(--dark)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <h2 style={{ fontWeight: 700, fontSize: 24, textTransform: 'uppercase', marginBottom: 8 }}>No conversations yet</h2>
            <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.7 }}>
              Messages tied to bookings and quotes show up here. Start a booking to begin a conversation.
            </p>
            <Link href="/shops" className="btn-tl btn-red" style={{ padding: '12px 28px', fontSize: 11 }}>Find a Shop</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {threads.map(t => (
              <Link key={t.booking_id} href={`/dashboard/bookings?thread=${t.booking_id}`} style={{ textDecoration: 'none', color: 'inherit', background: 'var(--dark)', padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 3fr auto', gap: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase' }}>{t.shop_name || t.customer_name || 'Thread'}</div>
                <div style={{ color: 'var(--grey)', fontSize: 13, lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.last_message?.content || 'No messages yet'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.15em' }}>
                  {t.last_message?.created_at ? new Date(t.last_message.created_at).toLocaleDateString() : ''}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
