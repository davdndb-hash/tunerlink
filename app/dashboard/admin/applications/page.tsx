'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Application = {
  id: string
  shop_name: string
  owner_name: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  specialties: string[] | null
  certifications: string | null
  years_in_business: string | null
  acquisition_method: string | null
  notes: string | null
  status: 'pending' | 'approved' | 'rejected' | null
  created_at: string
}

type Tab = 'pending' | 'approved' | 'rejected'

export default function AdminApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [tab, setTab] = useState<Tab>('pending')
  const [acting, setActing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const load = async (t: string, currentTab: Tab) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/applications?status=${currentTab}`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Failed (${res.status})`)
      }
      const j = await res.json()
      setApplications(j.applications || [])
    } catch (err: any) {
      setError(err.message)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/auth/login?next=/dashboard/admin/applications'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        window.location.href = '/dashboard'
        return
      }

      setToken(session.access_token)
      await load(session.access_token, tab)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (token) load(token, tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const act = async (applicationId: string, action: 'approve' | 'reject') => {
    if (!token) return
    let reason: string | null = null
    if (action === 'reject') {
      reason = window.prompt('Reason for rejection (shown to the applicant):') || null
      if (reason === null) return // they hit cancel
    } else {
      if (!window.confirm('Approve this application? The applicant will get a claim-your-profile email.')) return
    }
    setActing(applicationId)
    setBanner(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, action, reason }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || `Failed (${res.status})`)
      setBanner(action === 'approve' ? 'Approved. Applicant has been emailed their claim link.' : 'Rejected. Applicant has been notified.')
      await load(token, tab)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActing(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <DashboardNav />

      <div style={{ padding: '40px 52px 96px' }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'var(--grey)',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          ← Dashboard
        </Link>

        <div className="label-tl" style={{ marginTop: 32 }}>
          Admin
        </div>
        <h1
          style={{
            fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 64px)',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            marginBottom: 32,
          }}
        >
          Shop{' '}
          <em
            style={{
              fontStyle: 'normal',
              background: 'linear-gradient(135deg, #ff2233, #ff6600)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Applications.
          </em>
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 32 }}>
          {(['pending', 'approved', 'rejected'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={t === tab ? 'tag-tl tag-active' : 'tag-tl'}
              style={{
                padding: '10px 20px',
                fontSize: 10,
                fontFamily: 'var(--font-mono), monospace',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                border: t === tab ? '1px solid #ff2233' : '1px solid var(--border)',
                background: t === tab ? 'rgba(255,34,51,0.08)' : 'transparent',
                color: t === tab ? '#ff2233' : 'var(--grey)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {banner && (
          <div
            style={{
              border: '1px solid #1D9E75',
              background: 'rgba(29,158,117,0.08)',
              padding: 20,
              marginBottom: 24,
              color: '#1D9E75',
              fontSize: 14,
            }}
          >
            {banner}
          </div>
        )}
        {error && (
          <div
            style={{
              border: '1px solid #ff2233',
              background: 'rgba(255,34,51,0.08)',
              padding: 20,
              marginBottom: 24,
              color: '#ff6677',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: 80,
              color: 'var(--grey)',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            Loading...
          </div>
        ) : applications.length === 0 ? (
          <div
            style={{
              border: '1px solid var(--border)',
              padding: 64,
              textAlign: 'center',
              background: 'var(--dark)',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h2 style={{ fontWeight: 700, fontSize: 24, textTransform: 'uppercase', marginBottom: 8 }}>
              No {tab} applications
            </h2>
            <p style={{ color: 'var(--grey)', fontSize: 14 }}>
              {tab === 'pending'
                ? 'All caught up. New applications will appear here.'
                : `Nothing ${tab} yet.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                tab={tab}
                acting={acting === app.id}
                onApprove={() => act(app.id, 'approve')}
                onReject={() => act(app.id, 'reject')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ApplicationCard({
  app,
  tab,
  acting,
  onApprove,
  onReject,
}: {
  app: Application
  tab: Tab
  acting: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div
      style={{
        background: 'var(--dark)',
        border: '1px solid var(--border)',
        padding: 28,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: 24,
        alignItems: 'start',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'var(--grey)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {new Date(app.created_at).toLocaleDateString()} · {app.city || '?'}, {app.state || '?'}
        </div>
        <div style={{ fontWeight: 800, fontSize: 22, textTransform: 'uppercase', marginBottom: 6 }}>
          {app.shop_name}
        </div>
        <div style={{ color: 'var(--lgrey)', fontSize: 14, marginBottom: 14 }}>
          {app.owner_name} · <a href={`mailto:${app.email}`} style={{ color: '#ff2233' }}>{app.email}</a>
          {app.phone ? ` · ${app.phone}` : ''}
        </div>
        {app.specialties && app.specialties.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {app.specialties.map((s, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 9,
                  padding: '3px 8px',
                  border: '1px solid var(--border)',
                  color: 'var(--lgrey)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ color: 'var(--lgrey)', fontSize: 13, lineHeight: 1.7 }}>
        <Detail label="Years in business" value={app.years_in_business} />
        <Detail label="Certifications" value={app.certifications} />
        <Detail label="Found us via" value={app.acquisition_method} />
        {app.notes && <Detail label="Notes" value={app.notes} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
        {tab === 'pending' ? (
          <>
            <button
              onClick={onApprove}
              disabled={acting}
              className="btn-tl btn-red"
              style={{ padding: '10px 20px', fontSize: 10, opacity: acting ? 0.5 : 1 }}
            >
              {acting ? '...' : 'Approve'}
            </button>
            <button
              onClick={onReject}
              disabled={acting}
              className="btn-tl"
              style={{ padding: '10px 20px', fontSize: 10, opacity: acting ? 0.5 : 1 }}
            >
              Reject
            </button>
          </>
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 10,
              padding: '6px 12px',
              border: `1px solid ${tab === 'approved' ? '#1D9E75' : 'var(--grey)'}`,
              color: tab === 'approved' ? '#1D9E75' : 'var(--grey)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {tab}
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 6 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 9,
          letterSpacing: '0.2em',
          color: 'var(--grey)',
          textTransform: 'uppercase',
          marginRight: 8,
        }}
      >
        {label}:
      </span>
      <span style={{ color: 'var(--lgrey)' }}>{value}</span>
    </div>
  )
}

function DashboardNav() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 52px',
        background: 'rgba(8,8,8,0.97)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 500,
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #ff2233',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#ff2233',
          }}
        >
          TL
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--white)',
          }}
        >
          TUNER<span style={{ color: '#ff2233' }}>LINK</span>
        </span>
      </Link>
      <Link href="/dashboard" className="btn-tl" style={{ padding: '8px 18px', fontSize: 10 }}>
        Dashboard
      </Link>
    </nav>
  )
}
