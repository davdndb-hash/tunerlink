'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const SPECIALTIES = [
  'Dyno Tuning', 'Engine Builds', 'Forced Induction', 'Suspension',
  'JDM', 'European', 'Domestic/Muscle', 'Diesel', 'E85/Flex Fuel',
  'Fabrication', 'Track/Race', 'Remote Tuning',
]

export default function ListShopPage() {
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [years, setYears] = useState('')
  const [acquisition, setAcquisition] = useState('')
  const [certs, setCerts] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopName || !ownerName || !email || !phone || !city) {
      setError('Please fill in all required fields.')
      return
    }
    if (selectedTags.length === 0) {
      setError('Please select at least one specialty.')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.from('shop_applications').insert({
      shop_name: shopName,
      owner_name: ownerName,
      email,
      phone,
      city,
      state,
      specialties: selectedTags,
      certifications: certs,
      years_in_business: years,
      acquisition_method: acquisition,
      notes,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Fire-and-forget: send confirmation to applicant + notify admin
      fetch('/api/email/shop-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      }).catch(() => {})

      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🏁</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(40px, 6vw, 80px)', textTransform: 'uppercase', lineHeight: 0.9 }}>
          You're In.<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Welcome.</em>
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: 15, maxWidth: 440, lineHeight: 1.8 }}>
          We've got your application for <strong style={{ color: 'var(--white)' }}>{shopName}</strong>. Someone from our team will be in touch within 48 hours — a real call, not an automated email.
        </p>
        <p style={{ color: 'var(--grey)', fontSize: 14, maxWidth: 440, lineHeight: 1.8 }}>
          Welcome to the founding shop program.
        </p>
        <Link href="/" className="btn-tl btn-red" style={{ padding: '14px 40px', fontSize: 12, marginTop: 8 }}>Back to Home</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,0.97)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/shops" className="nav-link">Browse Shops</Link>
        <Link href="/auth/login" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11 }}>Sign In</Link>
      </nav>

      {/* HERO */}
      <section style={{ padding: '80px 52px 64px', background: 'var(--dark)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 80% at 80% 50%, rgba(255,34,51,0.08), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <div className="label-tl">Founding Shop Program</div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(48px, 7vw, 96px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
            List Your<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Shop.</em>
          </h1>
          <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8, maxWidth: 520, marginBottom: 40 }}>
            We're hand-picking the first shops on TunerLink. No cost, no commitment — just a seat at the table before we open to the public.
          </p>

          {/* Benefits */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
            {[
              { icon: '📍', label: 'Listed First', sub: 'Founding shops appear at the top of local search — permanently.' },
              { icon: '🆓', label: 'Free Until Launch', sub: 'No subscription, no setup fee. First month on us after launch.' },
              { icon: '🔧', label: 'You Help Build This', sub: 'Direct input on how the platform works. We build around you.' },
            ].map(b => (
              <div key={b.label} style={{ background: 'var(--black)', padding: '28px 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{b.label}</div>
                <div style={{ color: 'var(--grey)', fontSize: 13, lineHeight: 1.7 }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section style={{ padding: '64px 52px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="label-tl">Apply Now</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(32px, 4vw, 56px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 40 }}>
            Tell Us About<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your Shop.</em>
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Shop Name *</label>
                <input className="input-tl" placeholder="e.g. Dyno Solution Orlando" value={shopName} onChange={e => setShopName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Your Name *</label>
                <input className="input-tl" placeholder="First & last name" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Phone *</label>
                <input className="input-tl" type="tel" placeholder="(407) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email *</label>
                <input className="input-tl" type="email" placeholder="you@yourshop.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>City *</label>
                <input className="input-tl" placeholder="e.g. Kissimmee" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>State *</label>
                <input className="input-tl" placeholder="FL" value={state} onChange={e => setState(e.target.value)} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Years in Business</label>
                <select className="input-tl" value={years} onChange={e => setYears(e.target.value)} style={{ background: 'var(--panel)', color: years ? 'var(--white)' : 'var(--grey)' }}>
                  <option value="">Select...</option>
                  <option>Less than 1 year</option>
                  <option>1–3 years</option>
                  <option>3–5 years</option>
                  <option>5–10 years</option>
                  <option>10+ years</option>
                </select>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                Specialties * <span style={{ color: 'var(--grey)' }}>(select all that apply)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SPECIALTIES.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`tag-tl ${selectedTags.includes(tag) ? 'active' : ''}`}
                    style={{ background: 'transparent', border: '1px solid', cursor: 'pointer' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Certs */}
            <div>
              <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Certifications <span style={{ color: 'var(--grey)' }}>(optional)</span>
              </label>
              <input className="input-tl" placeholder="e.g. Cobb ProTuner, HP Tuners, Haltech Certified..." value={certs} onChange={e => setCerts(e.target.value)} />
            </div>

            {/* Acquisition */}
            <div>
              <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>How do you currently get new customers?</label>
              <select className="input-tl" value={acquisition} onChange={e => setAcquisition(e.target.value)} style={{ background: 'var(--panel)', color: acquisition ? 'var(--white)' : 'var(--grey)' }}>
                <option value="">Select...</option>
                <option>Mostly word of mouth / referrals</option>
                <option>Google / search</option>
                <option>Instagram or social media</option>
                <option>Mix of all of the above</option>
                <option>We're at capacity and not actively seeking new work</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Anything else you want us to know?</label>
              <textarea
                className="input-tl"
                rows={4}
                placeholder="Your setup, what makes your shop different, questions for us..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: 'vertical', minHeight: 100 }}
              />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', border: '1px solid rgba(255,34,51,0.3)', background: 'rgba(255,34,51,0.05)', color: '#ff2233', fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.1em' }}>
                ↳ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-tl btn-red"
              style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: 12, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Application — It\'s Free'}
            </button>

            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--grey)', textAlign: 'center', textTransform: 'uppercase' }}>
              We'll reach out within 48 hours. No spam, no obligation.
            </p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 52px', background: 'var(--dark)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em' }}>© 2025 TUNERLINK LLC</span>
        <Link href="/shops" style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em', textDecoration: 'none' }}>BROWSE SHOPS →</Link>
      </footer>
    </div>
  )
}