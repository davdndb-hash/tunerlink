'use client'

import Link from 'next/link'

export default function B2BPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,.97)', position: 'sticky', top: 0, zIndex: 500, backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontSize: 22, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--white)' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#ff2233' }}>TL</div>
          TUNER<em style={{ fontStyle: 'normal', color: '#ff2233' }}>LINK</em>
        </Link>
        <div style={{ display: 'flex', gap: 40 }}>
          <Link href="/shops" className="nav-link">Find a Shop</Link>
          <Link href="/features" className="nav-link">Features</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/list-shop" className="nav-link" style={{ color: 'var(--white)' }}>List My Shop</Link>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11 }}>Sign In</Link>
          <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '10px 22px', fontSize: 11 }}>Apply Now</Link>
        </div>
      </nav>

      <section style={{ padding: '100px 52px 80px', background: 'var(--dark)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 80% 50%,rgba(255,102,0,.1),transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="label-tl">Business Access · B2B</div>
          <h1 style={{ fontSize: 'clamp(60px,9vw,140px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .88, marginBottom: 24 }}>
            For<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Shops.</em>
          </h1>
          <p style={{ color: 'var(--grey)', fontSize: 16, maxWidth: 560, lineHeight: 1.85, marginBottom: 40 }}>
            Stop waiting for referrals. TunerLink puts your business in front of customers actively searching for your exact specialty.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>Apply for Business Account</Link>
            <Link href="/features" className="btn-tl" style={{ padding: '16px 44px', fontSize: 12 }}>See Pricing</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 52px', background: 'var(--dark)' }}>
        <div className="label-tl">Process</div>
        <h2 style={{ fontSize: 'clamp(48px,6vw,90px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
          How It<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Works.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { n: '01', t: 'Apply and Verify', d: 'Submit your business info, license, insurance, and certifications. Our team verifies and approves within 48 hours.' },
            { n: '02', t: 'Build Profile', d: 'Choose your specialties, list services with prices, upload dyno sheets and build gallery photos.' },
            { n: '03', t: 'Go Live', d: 'Your profile appears in local search immediately. Customers book, request quotes, or message directly.' },
            { n: '04', t: 'Get Paid', d: 'Accept bookings, complete jobs, receive payment through secure escrow. No chasing invoices.' },
          ].map(step => (
            <div key={step.n} style={{ background: 'var(--dark)', padding: '48px 32px' }}>
              <div style={{ fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,.04)', lineHeight: 1, marginBottom: 24 }}>{step.n}</div>
              <div style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>{step.t}</div>
              <div style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.8 }}>{step.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 52px' }}>
        <div className="label-tl">Included</div>
        <h2 style={{ fontSize: 'clamp(48px,6vw,90px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
          Your<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Profile.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { num: 'Business Tools', icon: '🏪', title: 'Rich Profile and Portfolio', desc: 'Gallery, dyno results, certifications, build showcases, and live availability calendar — all in one page.' },
            { num: 'Leads', icon: '📋', title: 'RFQ Board and Bidding', desc: 'Customers post project requests. You respond with itemized quotes. Win jobs without a single cold call.' },
            { num: 'Analytics', icon: '📊', title: 'Business Dashboard', desc: 'Track views, conversion rates, revenue trends, inquiry volume by service, and rating performance.' },
            { num: 'Fleet', icon: '🚗', title: 'Multi-Vehicle Job Tracking', desc: 'Accept fleet accounts. Manage multiple active jobs. Assign team members to specific vehicles.' },
            { num: 'Reach', icon: '📡', title: 'Remote Tuning Flag', desc: 'Offer mail-in ECU or OBD-remote sessions. Unlock a nationwide client pool beyond your local market.' },
            { num: 'Revenue', icon: '🔩', title: 'Parts Sourcing Integration', desc: 'Quote parts alongside labor through partner suppliers. Earn referral commissions on every component.' },
          ].map(f => (
            <div key={f.num} style={{ background: 'var(--dark)', padding: '48px 40px', transition: 'background .3s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--panel)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--dark)'}>
              <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.32em', color: '#ff2233', marginBottom: 28, textTransform: 'uppercase' }}>{f.num}</div>
              <span style={{ fontSize: 34, marginBottom: 18, display: 'block', filter: 'drop-shadow(0 0 8px rgba(255,34,51,.3))' }}>{f.icon}</span>
              <div style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.82 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 52px', background: 'var(--dark)' }}>
        <div className="label-tl">Pricing</div>
        <h2 style={{ fontSize: 'clamp(48px,6vw,90px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
          Simple<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Tiers.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { tier: 'Free', price: '0', per: 'per month — always free', hot: false, feats: ['Basic profile listing','Up to 5 services listed','Request-quote only booking','5 portfolio photos','Standard search placement','Community reviews'], cta: 'Get Started', ctaRed: false },
            { tier: 'Pro', price: '29', per: 'per month', hot: true, feats: ['Full profile + dyno sheet uploads','Unlimited services','Instant Book enabled','50 portfolio photos','Priority search placement','RFQ board access','Analytics dashboard','Verified badge eligibility'], cta: 'Start Free Trial', ctaRed: true },
            { tier: 'Elite', price: '79', per: 'per month', hot: false, feats: ['Everything in Pro','Featured placement in search','Multi-seat shop account','Fleet / B2B account access','Full analytics suite','Parts sourcing commissions','Track day event integration','Dedicated account manager'], cta: 'Contact Sales', ctaRed: false },
          ].map(plan => (
            <div key={plan.tier} style={{ background: plan.hot ? 'var(--panel)' : 'var(--dark)', padding: '48px 40px', position: 'relative', borderTop: plan.hot ? '2px solid #ff2233' : '2px solid transparent' }}>
              {plan.hot && <div style={{ position: 'absolute', top: -1, left: 40, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', background: '#ff2233', color: '#000', padding: '4px 12px', fontWeight: 700 }}>Most Popular</div>}
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--lgrey)', marginBottom: 20 }}>{plan.tier}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2, marginBottom: 8 }}>
                <sup style={{ fontSize: 24, color: 'var(--lgrey)', marginTop: 12 }}>$</sup>
                <span style={{ fontSize: 72, lineHeight: 1, color: 'var(--white)', fontWeight: 800 }}>{plan.price}</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '.15em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 32 }}>{plan.per}</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {plan.feats.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--lgrey)', lineHeight: 1.5 }}>
                    <span style={{ color: '#ff2233', flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/list-shop" className={`btn-tl${plan.ctaRed ? ' btn-red' : ''}`} style={{ width: '100%', textAlign: 'center', padding: '14px', fontSize: 11, display: 'block' }}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)', padding: '80px 52px', textAlign: 'center', background: 'var(--black)' }}>
        <h2 style={{ fontSize: 'clamp(48px,8vw,110px)', fontWeight: 800, textTransform: 'uppercase', lineHeight: .9, marginBottom: 40 }}>
          Your Next Customer<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Is Searching.</em>
        </h2>
        <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>Apply Now — Free</Link>
      </div>

      <footer style={{ padding: '32px 52px', background: 'var(--dark)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.2em' }}>© 2025 TUNERLINK LLC</span>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['Shops','/shops'],['Features','/features'],['About','/about'],['List My Shop','/list-shop']].map(([l,h]) => (
            <Link key={l} href={h} style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.15em', textDecoration: 'none', textTransform: 'uppercase' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}