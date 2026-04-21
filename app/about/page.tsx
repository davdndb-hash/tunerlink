'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,0.97)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 40 }}>
          <Link href="/shops" className="nav-link">Find a Shop</Link>
          <Link href="/about" className="nav-link" style={{ color: 'var(--white)' }}>About</Link>
          <Link href="/list-shop" className="nav-link">List My Shop</Link>
        </div>
        <Link href="/auth/signup" className="btn-tl btn-red" style={{ padding: '10px 22px', fontSize: 11 }}>Get Started</Link>
      </nav>

      {/* HERO */}
      <section style={{ padding: '100px 52px 80px', background: 'var(--dark)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 70% 40%, rgba(255,34,51,0.1), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div className="label-tl">About TunerLink</div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(56px, 9vw, 130px)', textTransform: 'uppercase', lineHeight: 0.88, marginBottom: 28 }}>
            Built By<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Enthusiasts.</em>
          </h1>
          <p style={{ color: 'var(--grey)', fontSize: 16, lineHeight: 1.85, maxWidth: 560 }}>
            We didn't build a marketplace and bolt on automotive. We built it from inside the scene — because we lived the problem ourselves.
          </p>
        </div>
      </section>

      {/* ORIGIN */}
      <section style={{ padding: '100px 52px', background: 'var(--dark)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="label-tl">Origin</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(40px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
              The<br />
              <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Story.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ color: 'var(--lgrey)', fontSize: 15, lineHeight: 1.85 }}>
              TunerLink started with a simple frustration — spending weeks trying to find a shop that actually understood a built motor. Not a general mechanic. Not someone who'd "take a look at it." A specialist. Someone who had tuned that engine, that setup, that style of build before.
            </p>
            <p style={{ color: 'var(--lgrey)', fontSize: 15, lineHeight: 1.85 }}>
              The shops were out there. They just weren't findable. Hidden behind word-of-mouth, buried in forum threads, invisible to anyone who hadn't been in the scene for years. Meanwhile, great customers were showing up to the wrong shops and great shops were sitting on empty bays.
            </p>
            <p style={{ color: 'var(--lgrey)', fontSize: 15, lineHeight: 1.85 }}>
              <strong style={{ color: 'var(--white)' }}>That's the gap TunerLink exists to close.</strong> A dedicated platform — not a classifieds board, not a Facebook group, not a generic service app. Something built from the ground up for the way performance shops actually work.
            </p>
            <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '14px 36px', fontSize: 12, alignSelf: 'flex-start', marginTop: 8 }}>
              List Your Shop — Free
            </Link>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section style={{ padding: '100px 52px', background: 'var(--black)' }}>
        <div className="label-tl">The Problem</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(40px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 64 }}>
          Why This<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Needed To Exist.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            {
              side: 'For Customers',
              color: '#378ADD',
              items: [
                'Google returns oil change shops for "performance tuning"',
                'Yelp has no way to filter by specialty or platform',
                'Forum recommendations are outdated or regional',
                'You call around and still can\'t verify who\'s actually qualified',
                'You show up and explain your whole build from scratch',
              ]
            },
            {
              side: 'For Shops',
              color: '#1D9E75',
              items: [
                'New customers only come through referrals or luck',
                'No way to showcase specialties to the right audience',
                'Walk-ins don\'t know what they need or what\'s on their car',
                'Booking is handled by phone, text, and memory',
                'Reputation lives on Google — nowhere built for this scene',
              ]
            }
          ].map(col => (
            <div key={col.side} style={{ background: 'var(--dark)', padding: '52px 44px' }}>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.32em', color: col.color, textTransform: 'uppercase', marginBottom: 24 }}>{col.side}</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {col.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--lgrey)', lineHeight: 1.6 }}>
                    <span style={{ color: '#ff2233', flexShrink: 0, marginTop: 2 }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section style={{ padding: '100px 52px', background: 'var(--dark)' }}>
        <div className="label-tl">What We Stand For</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(40px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 64 }}>
          Three Things We<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Won't Compromise.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { n: '01', t: 'Community Over Commerce', d: 'We exist to serve the performance community — not extract from it. Every product decision gets measured against whether it actually helps shops do better work and helps customers find the right one.' },
            { n: '02', t: 'Precision Over Scale', d: "We'd rather have 500 genuinely excellent verified shops than 5,000 unvetted listings. Quality of match matters more than volume. A bad recommendation poisons the whole experience for everyone." },
            { n: '03', t: 'Transparency Always', d: "No hidden fees. No algorithm that promotes whoever pays the most. Pricing, reviews, and search placement work the way we say they do — and we'll tell you exactly how." },
          ].map(v => (
            <div key={v.n} style={{ borderLeft: '2px solid #ff2233', paddingLeft: 28 }}>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.32em', color: '#ff2233', marginBottom: 16, textTransform: 'uppercase' }}>{v.n}</div>
              <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--white)', lineHeight: 1.2 }}>{v.t}</div>
              <p style={{ fontSize: 14, color: 'var(--grey)', lineHeight: 1.85 }}>{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section style={{ padding: '100px 52px', background: 'var(--black)' }}>
        <div className="label-tl">Where We Are</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(40px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 64 }}>
          The<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Roadmap.</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
          {[
            { tag: 'NOW', label: 'Founding Shop Program', desc: 'Hand-selecting the first performance shops in Central Florida. Free listing, founding status, direct input on product direction.', active: true, href: '/list-shop', cta: 'Apply Now →' },
            { tag: 'Q3', label: 'Platform Beta Launch', desc: 'Live booking, vehicle profiles, shop search and filter, and customer-facing discovery goes live for the waitlist.', active: false },
            { tag: 'Q4', label: 'Public Launch + Florida Expansion', desc: 'Open shop applications statewide. Payments, reviews, and verified badge system go live. Mobile app enters beta.', active: false },
            { tag: '2026', label: 'National Rollout', desc: 'Expand to all 50 states. Remote tuning marketplace. Parts sourcing integrations.', active: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 36, alignItems: 'flex-start', paddingBottom: i < 3 ? 48 : 0 }}>
              <div style={{ width: 40, height: 40, border: `2px solid ${item.active ? '#ff2233' : 'var(--border)'}`, background: item.active ? '#ff2233' : 'var(--panel)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono), monospace', fontSize: 9, color: item.active ? '#000' : 'var(--grey)', fontWeight: 700, letterSpacing: '0.1em', zIndex: 1 }}>
                {item.tag}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, color: 'var(--white)' }}>{item.label}</div>
                <p style={{ fontSize: 14, color: 'var(--grey)', lineHeight: 1.8, maxWidth: 560, marginBottom: item.href ? 12 : 0 }}>{item.desc}</p>
                {item.href && (
                  <Link href={item.href} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.15em', color: '#ff2233', textDecoration: 'none', textTransform: 'uppercase' }}>{item.cta}</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 52px', background: 'var(--dark)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 72px)', textTransform: 'uppercase', lineHeight: 0.95 }}>
            Be Part Of<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>The Movement.</em>
          </h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>List Your Shop — Free</Link>
            <Link href="/shops" className="btn-tl" style={{ padding: '16px 44px', fontSize: 12 }}>Find a Tuner</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 52px', background: 'var(--black)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em' }}>© 2025 TUNERLINK LLC</span>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '0.2em' }}>BUILT FOR ENTHUSIASTS · POWERED BY PASSION</span>
      </footer>
    </div>
  )
}