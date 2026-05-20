'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const TUNER_SPECIALTIES = [
  'Dyno Tuning', 'Engine Builds', 'Forced Induction', 'Suspension',
  'JDM', 'European', 'Domestic/Muscle', 'Diesel', 'E85/Flex Fuel',
  'Fabrication', 'Track/Race', 'Remote Tuning',
]

const DYNO_BRANDS = ['Dynojet', 'Mustang', 'Dynapack', 'SuperFlow', 'Land & Sea', 'Other']

type Category = 'tuner' | 'dyno_pull' | 'both'

export default function ListShopPage() {
  const [category, setCategory] = useState<Category>('tuner')

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

  // Dyno-only fields
  const [dynoBrand, setDynoBrand] = useState('')
  const [dynoSupportsAwd, setDynoSupportsAwd] = useState(false)
  const [dynoMaxHp, setDynoMaxHp] = useState('')
  const [dynoIndoor, setDynoIndoor] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const showsTunerFields = category === 'tuner' || category === 'both'
  const showsDynoFields = category === 'dyno_pull' || category === 'both'

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
    if (showsTunerFields && selectedTags.length === 0) {
      setError('Please select at least one specialty.')
      return
    }
    if (showsDynoFields && !dynoBrand) {
      setError('Please tell us what dyno you run.')
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
      category,
      specialties: showsTunerFields ? selectedTags : [],
      certifications: certs,
      years_in_business: years,
      acquisition_method: acquisition,
      notes,
      dyno_brand: showsDynoFields ? dynoBrand : null,
      dyno_supports_awd: showsDynoFields ? dynoSupportsAwd : false,
      dyno_max_hp: showsDynoFields && dynoMaxHp ? parseInt(dynoMaxHp, 10) : null,
      dyno_indoor: showsDynoFields ? dynoIndoor : false,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
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
          Welcome to the founding {category === 'dyno_pull' ? 'dyno' : 'shop'} program.
        </p>
        <Link href="/" className="btn-tl btn-red" style={{ padding: '14px 40px', fontSize: 12, marginTop: 8 }}>Back to Home</Link>
      </div>
    )
  }

  const CategoryButton = ({ value, title, sub }: { value: Category; title: string; sub: string }) => {
    const active = category === value
    return (
      <button
        type="button"
        onClick={() => setCategory(value)}
        style={{
          flex: 1,
          padding: '20px 18px',
          background: active ? 'rgba(255,34,51,0.06)' : 'var(--panel)',
          border: `1px solid ${active ? '#ff2233' : 'var(--border)'}`,
          color: 'var(--white)',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all .2s',
        }}
      >
        <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.22em', color: active ? '#ff2233' : 'var(--grey)', textTransform: 'uppercase', marginBottom: 8 }}>
          {active ? '● Selected' : '○ Select'}
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--grey)', lineHeight: 1.6 }}>{sub}</div>
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,0.97)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/shops" className="nav-link">Browse Shops</Link>
        <Link href="/auth/login" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11 }}>Sign In</Link>
      </nav>

      <section style={{ padding: '80px 52px 64px', background: 'var(--dark)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 80% at 80% 50%, rgba(255,34,51,0.08), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <div className="label-tl">Founding Shop Program</div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(48px, 7vw, 96px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
            List Your<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Shop.</em>
          </h1>
          <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8, maxWidth: 520, marginBottom: 40 }}>
            We're hand-picking the first shops on TunerLink. Tuners or dyno-pull-only providers — both welcome.
          </p>
        </div>
      </section>

      <section style={{ padding: '64px 52px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* CATEGORY TOGGLE */}
          <div style={{ marginBottom: 40 }}>
            <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              What are you offering? *
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <CategoryButton value="tuner" title="Tuner Shop" sub="Dyno tuning, engine builds, forced induction, fabrication." />
              <CategoryButton value="dyno_pull" title="Dyno Pulls Only" sub="You run the dyno. Customers come for power runs and data, not tuning." />
              <CategoryButton value="both" title="Both" sub="Full tuning shop that also rents dyno time to outside customers." />
            </div>
          </div>

          <div className="label-tl">Apply Now</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(32px, 4vw, 56px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 40 }}>
            Tell Us About<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your Shop.</em>
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Shop Name *</label>
                <input className="input-tl" placeholder="e.g. Dyno Solution Orlando" value={shopName} onChange={e => setShopName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Your Name *</label>
                <input className="input-tl" placeholder="First & last name" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Phone *</label>
                <input className="input-tl" type="tel" placeholder="(407) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email *</label>
                <input className="input-tl" type="email" placeholder="you@yourshop.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>City *</label>
                <input className="input-tl" placeholder="e.g. Kissimmee" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>State *</label>
                <input className="input-tl" placeholder="FL" value={state} onChange={e => setState(e.target.value)} />
              </div>
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Years in Business</label>
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

            {/* TUNER FIELDS */}
            {showsTunerFields && (
              <div>
                <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                  Specialties * <span style={{ color: 'var(--grey)' }}>(select all that apply)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TUNER_SPECIALTIES.map(tag => (
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
            )}

            {/* DYNO FIELDS */}
            {showsDynoFields && (
              <>
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div className="label-tl" style={{ marginBottom: 16 }}>Dyno Setup</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Dyno Brand *</label>
                    <select className="input-tl" value={dynoBrand} onChange={e => setDynoBrand(e.target.value)} style={{ background: 'var(--panel)', color: dynoBrand ? 'var(--white)' : 'var(--grey)' }} required>
                      <option value="">Select...</option>
                      {DYNO_BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Max HP Rating</label>
                    <input className="input-tl" type="number" placeholder="e.g. 1500" value={dynoMaxHp} onChange={e => setDynoMaxHp(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, paddingTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--lgrey)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={dynoSupportsAwd} onChange={e => setDynoSupportsAwd(e.target.checked)} />
                    Supports AWD
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--lgrey)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={dynoIndoor} onChange={e => setDynoIndoor(e.target.checked)} />
                    Indoor / weather-protected
                  </label>
                </div>
              </>
            )}

            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Certifications <span style={{ color: 'var(--grey)' }}>(optional)</span>
              </label>
              <input className="input-tl" placeholder="e.g. Cobb ProTuner, HP Tuners, Haltech Certified..." value={certs} onChange={e => setCerts(e.target.value)} />
            </div>

            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>How do you currently get new customers?</label>
              <select className="input-tl" value={acquisition} onChange={e => setAcquisition(e.target.value)} style={{ background: 'var(--panel)', color: acquisition ? 'var(--white)' : 'var(--grey)' }}>
                <option value="">Select...</option>
                <option>Mostly word of mouth / referrals</option>
                <option>Google / search</option>
                <option>Instagram or social media</option>
                <option>Mix of all of the above</option>
                <option>We're at capacity and not actively seeking new work</option>
              </select>
            </div>

            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.22em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Anything else you want us to know?</label>
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
              <div style={{ padding: '12px 16px', border: '1px solid rgba(255,34,51,0.3)', background: 'rgba(255,34,51,0.05)', color: '#ff2233', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em' }}>
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

            <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--grey)', textAlign: 'center', textTransform: 'uppercase' }}>
              We'll reach out within 48 hours. No spam, no obligation.
            </p>
          </form>
        </div>
      </section>

      <footer style={{ padding: '32px 52px', background: 'var(--dark)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em' }}>© 2025 TUNERLINK LLC</span>
        <Link href="/shops" style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em', textDecoration: 'none' }}>BROWSE SHOPS →</Link>
      </footer>
    </div>
  )
}
