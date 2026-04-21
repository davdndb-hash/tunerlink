'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('general')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      // Store as a shop_application with acquisition_method='contact_form' if topic=shop,
      // otherwise route to a generic contact_messages table if present, else store in notes.
      // Safe fallback: write to customer_waitlist with a tagged note so we don't lose the lead.
      const payload = {
        email: email.trim().toLowerCase(),
        full_name: name.trim(),
        goals: `[${topic}] ${message}`,
        referral_source: 'contact_form',
      }

      const { error } = await supabase.from('customer_waitlist').upsert(payload, {
        onConflict: 'email',
      })

      if (error) throw error
      setStatus('sent')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please email hello@tunerlink.com directly.')
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div className="label-tl">Get in Touch</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(40px, 6vw, 72px)', textTransform: 'uppercase', lineHeight: 0.92, marginBottom: 24 }}>
          Let&rsquo;s <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Talk.</em>
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8, marginBottom: 40, maxWidth: 520 }}>
          Shop question, customer feedback, press inquiry, or just want to say hi — send us a note.
          Typical response time is 1 business day.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 40 }}>
          {[
            { label: 'General', value: 'hello@tunerlink.com', href: 'mailto:hello@tunerlink.com' },
            { label: 'Shops', value: 'shops@tunerlink.com', href: 'mailto:shops@tunerlink.com' },
            { label: 'Privacy', value: 'privacy@tunerlink.com', href: 'mailto:privacy@tunerlink.com' },
          ].map(c => (
            <a key={c.label} href={c.href} style={{ background: 'var(--dark)', padding: '24px 20px', textDecoration: 'none', color: 'var(--white)' }}>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.28em', color: '#ff2233', textTransform: 'uppercase', marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: 'var(--lgrey)' }}>{c.value}</div>
            </a>
          ))}
        </div>

        {status === 'sent' ? (
          <div style={{ padding: '48px 32px', border: '1px solid #1D9E75', background: 'rgba(29,158,117,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <div style={{ fontWeight: 700, fontSize: 20, textTransform: 'uppercase', marginBottom: 8, color: '#1D9E75' }}>Message received</div>
            <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
              We&rsquo;ll get back to you within one business day. Check your inbox (including spam) for our reply.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ border: '1px solid var(--border)', padding: 32, background: 'var(--dark)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              <Field label="Your Name" required>
                <input className="input-tl" value={name} onChange={e => setName(e.target.value)} required />
              </Field>
              <Field label="Email" required>
                <input className="input-tl" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </Field>
            </div>

            <Field label="Topic" required>
              <select className="input-tl" value={topic} onChange={e => setTopic(e.target.value)} required style={{ appearance: 'none' }}>
                <option value="general">General inquiry</option>
                <option value="shop">I own a shop</option>
                <option value="customer">Customer support</option>
                <option value="press">Press / partnerships</option>
                <option value="bug">Report a bug</option>
                <option value="listing">Remove my shop listing</option>
              </select>
            </Field>

            <div style={{ marginTop: 16 }}>
              <Field label="Message" required>
                <textarea
                  className="input-tl"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  required
                  style={{ resize: 'vertical', minHeight: 140, fontFamily: 'inherit' }}
                />
              </Field>
            </div>

            {errorMsg && (
              <div style={{ marginTop: 16, padding: '12px 16px', border: '1px solid #ff2233', background: 'rgba(255,34,51,0.08)', fontSize: 13, color: '#ff6677' }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-tl btn-red"
              style={{ marginTop: 24, padding: '14px 36px', fontSize: 11, opacity: status === 'sending' ? 0.6 : 1, cursor: status === 'sending' ? 'wait' : 'pointer' }}
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--grey)', fontSize: 13 }}>
            <Link href="/terms" style={{ color: '#ff2233' }}>Terms</Link> · <Link href="/privacy" style={{ color: '#ff2233' }}>Privacy</Link>
          </p>
        </div>
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
