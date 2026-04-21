'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function B2CPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,.97)', position: 'sticky', top: 0, zIndex: 500, backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontSize: 22, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--white)' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#ff2233' }}>TL</div>
          TUNER<em style={{ fontStyle: 'normal', color: '#ff2233' }}>LINK</em>
        </Link>
        <div style={{ display: 'flex', gap: 40 }}>
          <Link href="/shops" className="nav-link" style={{ color: 'var(--white)' }}>Find a Shop</Link>
          <Link href="/features" className="nav-link">Features</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/list-shop" className="nav-link">List My Shop</Link>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11 }}>Sign In</Link>
          <Link href="/auth/signup" className="btn-tl btn-red" style={{ padding: '10px 22px', fontSize: 11 }}>Get Started</Link>
        </div>
      </nav>

      <section style={{ padding: '100px 52px 80px', background: 'var(--dark)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 20% 50%,rgba(255,34,51,.12),transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="label-tl">Public Access · For Car Owners</div>
          <h1 style={{ fontSize: 'clamp(60px,9vw,140px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .88, marginBottom: 24 }}>
            For<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Owners.</em>
          </h1>
          <p style={{ color: 'var(--grey)', fontSize: 16, maxWidth: 560, lineHeight: 1.85, marginBottom: 40 }}>
            Tell us your car. Tell us what you want. We show you every verified specialist in your area — rated, reviewed, and ready to book.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/shops" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>Search Shops Now</Link>
            <Link href="/auth/signup" className="btn-tl" style={{ padding: '16px 44px', fontSize: 12 }}>Create Free Account</Link>
          </div>
        </div>
      </section>

      {/* WAITLIST FORM */}
      <WaitlistSection />

      <section style={{ padding: '100px 52px' }}>
        <div className="label-tl">For Owners</div>
        <h2 style={{ fontSize: 'clamp(48px,6vw,90px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
          Three Steps<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>To Power.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { n: '01', t: 'Describe Your Car', d: 'Year, make, model, current mods, and what you want to achieve. Attach your full vehicle profile so shops know exactly what is coming in.' },
            { n: '02', t: 'Compare and Book', d: 'Browse verified specialists near you. Read real reviews, view dyno results, and book instantly or request a custom quote.' },
            { n: '03', t: 'Get It Done', d: 'Show up prepared. Your shop already knows your build and your goals. Pay securely — funds released only when you approve the work.' },
          ].map(step => (
            <div key={step.n} style={{ background: 'var(--dark)', padding: '48px 40px' }}>
              <div style={{ fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,.04)', lineHeight: 1, marginBottom: 24 }}>{step.n}</div>
              <div style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>{step.t}</div>
              <div style={{ fontSize: 14, color: 'var(--grey)', lineHeight: 1.8 }}>{step.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 52px', background: 'var(--dark)' }}>
        <div className="label-tl">Why TunerLink</div>
        <h2 style={{ fontSize: 'clamp(48px,6vw,90px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
          Built On<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Trust.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { num: 'Verification', icon: '✅', title: 'Every Shop Is Verified', desc: 'Identity, license, and insurance checked by our team. Certification badges tied to real credentials — no fake claims.' },
            { num: 'Reviews', icon: '⭐', title: 'Reviews You Can Trust', desc: 'Only verified completed bookings can leave reviews. No anonymous posts. No gaming the system.' },
            { num: 'Payment', icon: '🔒', title: 'Secure Escrow', desc: 'Your money is held safely until you approve the work. Dispute resolution team on standby if anything goes wrong.' },
          ].map(f => (
            <div key={f.num} style={{ background: 'var(--dark)', padding: '48px 40px', transition: 'background .3s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--panel)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--dark)'}>
              <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.32em', color: '#ff2233', marginBottom: 28, textTransform: 'uppercase' }}>{f.num}</div>
              <span style={{ fontSize: 34, marginBottom: 18, display: 'block' }}>{f.icon}</span>
              <div style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.82 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)', padding: '80px 52px', textAlign: 'center', background: 'var(--black)' }}>
        <h2 style={{ fontSize: 'clamp(48px,8vw,110px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .9, marginBottom: 40 }}>
          Your Build<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Starts Here.</em>
        </h2>
        <Link href="/shops" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>Find Your Tuner</Link>
      </div>

      <footer style={{ padding: '32px 52px', background: 'var(--dark)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.2em' }}>© 2025 TUNERLINK LLC</span>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['Shops','/shops'],['Features','/features'],['About','/about'],['Terms','/terms'],['Privacy','/privacy'],['Contact','/contact']].map(([l,h]) => (
            <Link key={l} href={h} style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.15em', textDecoration: 'none', textTransform: 'uppercase' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}

function WaitlistSection() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    city: '',
    state: 'FL',
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    project_type: '',
    budget_range: '',
    goals: '',
    referral_source: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const payload: any = {
        ...form,
        email: form.email.trim().toLowerCase(),
        vehicle_year: form.vehicle_year ? parseInt(form.vehicle_year, 10) : null,
      }
      Object.keys(payload).forEach(k => payload[k] === '' && delete payload[k])

      const { error } = await supabase
        .from('customer_waitlist')
        .upsert(payload, { onConflict: 'email' })

      if (error) throw error
      setStatus('sent')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section id="waitlist" style={{ padding: '100px 52px', background: 'var(--dark)' }}>
      <div className="label-tl">Early Access</div>
      <h2 style={{ fontSize: 'clamp(48px,6vw,90px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .93, marginBottom: 24 }}>
        Get Matched<br />
        <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>First.</em>
      </h2>
      <p style={{ color: 'var(--grey)', fontSize: 15, maxWidth: 560, lineHeight: 1.8, marginBottom: 40 }}>
        Tell us about your build. We&rsquo;ll match you with the right specialists in your area and notify you the moment full booking goes live.
      </p>

      {status === 'sent' ? (
        <div style={{ maxWidth: 720, padding: '64px 32px', border: '1px solid #1D9E75', background: 'rgba(29,158,117,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏁</div>
          <div style={{ fontWeight: 800, fontSize: 28, textTransform: 'uppercase', marginBottom: 12, color: '#1D9E75' }}>You&rsquo;re on the list</div>
          <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.7 }}>
            We&rsquo;ll reach out as soon as we have shops matched for your build. In the meantime, browse our verified directory.
          </p>
          <Link href="/shops" className="btn-tl btn-red" style={{ padding: '14px 32px', fontSize: 11 }}>Browse Shops</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 880, border: '1px solid var(--border)', padding: 40, background: 'var(--black)' }}>
          <Row>
            <Field label="Your Name" required>
              <input className="input-tl" value={form.full_name} onChange={e => update('full_name', e.target.value)} required />
            </Field>
            <Field label="Email" required>
              <input className="input-tl" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
            </Field>
          </Row>
          <Row>
            <Field label="City">
              <input className="input-tl" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Tampa" />
            </Field>
            <Field label="State">
              <input className="input-tl" value={form.state} onChange={e => update('state', e.target.value)} maxLength={2} />
            </Field>
          </Row>

          <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />
          <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.25em', color: '#ff2233', textTransform: 'uppercase', marginBottom: 16 }}>Your Build</div>

          <Row triple>
            <Field label="Year">
              <input className="input-tl" type="number" value={form.vehicle_year} onChange={e => update('vehicle_year', e.target.value)} placeholder="2003" min={1900} max={2030} />
            </Field>
            <Field label="Make">
              <input className="input-tl" value={form.vehicle_make} onChange={e => update('vehicle_make', e.target.value)} placeholder="Nissan" />
            </Field>
            <Field label="Model">
              <input className="input-tl" value={form.vehicle_model} onChange={e => update('vehicle_model', e.target.value)} placeholder="350Z" />
            </Field>
          </Row>

          <Row>
            <Field label="Project Type">
              <select className="input-tl" value={form.project_type} onChange={e => update('project_type', e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Choose one...</option>
                <option value="dyno_tune">Dyno Tune</option>
                <option value="forced_induction">Turbo / Supercharger Install</option>
                <option value="engine_build">Engine Build</option>
                <option value="suspension">Suspension / Handling</option>
                <option value="fabrication">Custom Fabrication</option>
                <option value="track_prep">Track / Race Prep</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Budget Range">
              <select className="input-tl" value={form.budget_range} onChange={e => update('budget_range', e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Choose one...</option>
                <option value="under_1k">Under $1,000</option>
                <option value="1k_3k">$1,000 – $3,000</option>
                <option value="3k_8k">$3,000 – $8,000</option>
                <option value="8k_20k">$8,000 – $20,000</option>
                <option value="20k_plus">$20,000+</option>
              </select>
            </Field>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Field label="Goals (optional)">
              <textarea
                className="input-tl"
                value={form.goals}
                onChange={e => update('goals', e.target.value)}
                rows={3}
                placeholder="What are you trying to achieve? Power numbers, daily driver, track times — whatever matters to you."
                style={{ resize: 'vertical', minHeight: 90, fontFamily: 'inherit' }}
              />
            </Field>
          </div>

          <div style={{ marginTop: 16 }}>
            <Field label="How did you hear about us? (optional)">
              <input className="input-tl" value={form.referral_source} onChange={e => update('referral_source', e.target.value)} placeholder="Friend, Instagram, Google, etc." />
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
            style={{ marginTop: 24, padding: '16px 44px', fontSize: 12, opacity: status === 'sending' ? 0.6 : 1, cursor: status === 'sending' ? 'wait' : 'pointer' }}
          >
            {status === 'sending' ? 'Submitting...' : 'Join the Waitlist'}
          </button>

          <p style={{ marginTop: 16, fontSize: 11, color: 'var(--grey)', lineHeight: 1.6 }}>
            By submitting you agree to our <Link href="/terms" style={{ color: '#ff2233' }}>Terms</Link> and <Link href="/privacy" style={{ color: '#ff2233' }}>Privacy Policy</Link>.
          </p>
        </form>
      )}
    </section>
  )
}

function Row({ children, triple }: { children: React.ReactNode; triple?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: triple ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 16, marginBottom: 16 }}>
      {children}
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
