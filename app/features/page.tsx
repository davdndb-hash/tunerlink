'use client'

import Link from 'next/link'

const MATRIX = [
  { feature: 'Shop profile listing', free: true, pro: true, elite: true },
  { feature: 'ZIP-based geo search', free: true, pro: true, elite: true },
  { feature: 'Request-for-quote flow', free: true, pro: true, elite: true },
  { feature: 'In-app messaging', free: true, pro: true, elite: true },
  { feature: 'Verified reviews & ratings', free: true, pro: true, elite: true },
  { feature: 'Vehicle build profiles', free: true, pro: true, elite: true },
  { feature: 'Instant booking calendar', free: false, pro: true, elite: true },
  { feature: 'Dyno sheet uploads', free: false, pro: true, elite: true },
  { feature: 'Priority search placement', free: false, pro: true, elite: true },
  { feature: 'RFQ board — bid on jobs', free: false, pro: true, elite: true },
  { feature: 'Analytics dashboard', free: false, pro: 'Basic', elite: 'Full' },
  { feature: 'Remote tuning flag', free: false, pro: true, elite: true },
  { feature: 'Featured search listing', free: false, pro: false, elite: true },
  { feature: 'Multi-seat shop account', free: false, pro: false, elite: true },
  { feature: 'Fleet / B2B management', free: false, pro: false, elite: true },
  { feature: 'Parts sourcing commissions', free: false, pro: false, elite: true },
  { feature: 'Track day event integration', free: false, pro: false, elite: true },
  { feature: 'Dedicated account manager', free: false, pro: false, elite: true },
]

function Cell({ val }: { val: boolean | string }) {
  if (val === true) return <span style={{ color: '#ff2233', fontSize: 16, filter: 'drop-shadow(0 0 4px #ff2233)' }}>✓</span>
  if (val === false) return <span style={{ color: 'var(--grey)' }}>—</span>
  return <span style={{ fontSize: 12, color: 'var(--lgrey)' }}>{val}</span>
}

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,.97)', position: 'sticky', top: 0, zIndex: 500, backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: '.12em', color: 'var(--white)' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#ff2233', fontFamily: 'monospace' }}>TL</div>
          TUNER<em style={{ fontStyle: 'normal', color: '#ff2233' }}>LINK</em>
        </Link>
        <div style={{ display: 'flex', gap: 40 }}>
          <Link href="/shops" className="nav-link">Find a Shop</Link>
          <Link href="/features" className="nav-link" style={{ color: 'var(--white)' }}>Features</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/list-shop" className="nav-link">List My Shop</Link>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11 }}>Sign In</Link>
          <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '10px 22px', fontSize: 11 }}>List Your Shop</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '100px 52px 80px', background: 'var(--dark)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 80% 40%,rgba(255,34,51,.1),transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="label-tl">Platform Features</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(60px,9vw,140px)', textTransform: 'uppercase', lineHeight: .88, marginBottom: 24 }}>
            Every Tool<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>You Need.</em>
          </h1>
          <p style={{ color: 'var(--grey)', fontSize: 15, maxWidth: 560, lineHeight: 1.85 }}>
            TunerLink was built from the ground up for the automotive performance world — not adapted from a generic service marketplace.
          </p>
        </div>
      </section>

      {/* FEATURE MATRIX */}
      <section style={{ padding: '100px 52px', background: 'var(--dark)' }}>
        <div className="label-tl">Comparison</div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,6vw,90px)', textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
          Feature<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Matrix.</em>
        </h2>
        <div style={{ border: '1px solid var(--border)', overflowX: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '18px 26px', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--white)' }}>Feature</div>
            {['Free','Pro','Elite'].map(t => (
              <div key={t} style={{ padding: '18px 26px', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: t === 'Pro' ? '#ff2233' : 'var(--white)', borderLeft: '1px solid var(--border)', textAlign: 'center' }}>{t}</div>
            ))}
          </div>
          {/* Rows */}
          {MATRIX.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: i < MATRIX.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'var(--dark)' : 'rgba(255,255,255,.01)' }}>
              <div style={{ padding: '18px 26px', fontSize: 13, color: 'var(--lgrey)', display: 'flex', alignItems: 'center' }}>{row.feature}</div>
              {[row.free, row.pro, row.elite].map((val, j) => (
                <div key={j} style={{ padding: '18px 26px', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: j === 1 ? 'rgba(255,34,51,.03)' : 'transparent' }}>
                  <Cell val={val} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* DEEP DIVE FEATURES */}
      <section style={{ padding: '100px 52px' }}>
        <div className="label-tl">Deep Dive</div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,6vw,90px)', textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
          Platform<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Details.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {[
            { num: 'Intelligence', icon: '🤖', title: 'Smart\nMatching', desc: 'Describe your vehicle and goals. Platform surfaces top matched shops by specialization, certifications, proximity, and rating.' },
            { num: 'Mobile', icon: '📱', title: 'Full Mobile\nApp', desc: 'iOS and Android apps with full feature parity. GPS-based nearby shop discovery, push notifications, in-app messaging.' },
            { num: 'Events', icon: '🏁', title: 'Track Day\nIntegration', desc: 'Shops flag attendance at local events. Customers at the same track day can book on-site support instantly.' },
            { num: 'History', icon: '📁', title: 'Vehicle Build\nProfiles', desc: 'Track your full modification history, past ECU tunes, and service records. Share a link before every appointment.' },
            { num: 'Trust', icon: '🏅', title: 'Certification\nBadges', desc: 'Cobb ProTuner, Haltech Certified, APR Dealer — all platform-verified. No self-reported credentials allowed.' },
            { num: 'Supply', icon: '🔩', title: 'Parts\nSourcing', desc: 'Quote labor and parts together via partner integrations. Earn commission on every part. Customers get it all in one place.' },
          ].map(f => (
            <div key={f.num} style={{ background: 'var(--dark)', padding: '48px 40px', position: 'relative', overflow: 'hidden', transition: 'background .3s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--panel)'; const bar = (e.currentTarget as HTMLElement).querySelector('.fbar') as HTMLElement; if (bar) bar.style.transform = 'scaleX(1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--dark)'; const bar = (e.currentTarget as HTMLElement).querySelector('.fbar') as HTMLElement; if (bar) bar.style.transform = 'scaleX(0)' }}>
              <div className="fbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#ff2233,#ff6600)', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform .4s' }} />
              <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.32em', color: '#ff2233', marginBottom: 28, textTransform: 'uppercase' }}>{f.num}</div>
              <span style={{ fontSize: 34, marginBottom: 18, display: 'block', filter: 'drop-shadow(0 0 8px rgba(255,34,51,.3))' }}>{f.icon}</span>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14, lineHeight: 1.1, whiteSpace: 'pre-line' }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.82 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '100px 52px', background: 'var(--dark)' }}>
        <div className="label-tl">Pricing</div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,6vw,90px)', textTransform: 'uppercase', lineHeight: .93, marginBottom: 60 }}>
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
                <sup style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: 'var(--lgrey)', marginTop: 12 }}>$</sup>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, lineHeight: 1, color: 'var(--white)' }}>{plan.price}</span>
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

      {/* CTA */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 52px', textAlign: 'center', background: 'var(--black)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 100% at 50% 50%,rgba(255,34,51,.07),transparent)', pointerEvents: 'none' }} />
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,8vw,110px)', textTransform: 'uppercase', lineHeight: .9, marginBottom: 40, position: 'relative' }}>
          Experience<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>The Platform.</em>
        </h2>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link href="/shops" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>Find a Tuner</Link>
          <Link href="/list-shop" className="btn-tl" style={{ padding: '16px 44px', fontSize: 12 }}>List Your Shop</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '64px 52px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 44 }}>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '.1em', color: 'var(--white)', marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#ff2233' }}>TL</div>
            TUNER<em style={{ fontStyle: 'normal', color: '#ff2233' }}>LINK</em>
          </Link>
          <p style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.72, maxWidth: 220 }}>The premier marketplace for automotive performance tuning specialists.</p>
        </div>
        {[
          { h: 'Platform', links: [['Find a Tuner','/shops'],['List Your Shop','/list-shop'],['Features','/features']] },
          { h: 'Company', links: [['About Us','/about'],['Contact','/contact']] },
          { h: 'Legal', links: [['Terms','/terms'],['Privacy','/privacy']] },
        ].map(col => (
          <div key={col.h}>
            <h4 style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 18 }}>{col.h}</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map(([label, href]) => (
                <li key={label}><Link href={href} style={{ fontSize: 13, color: 'var(--grey)', textDecoration: 'none' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
      <div style={{ padding: '14px 52px', background: 'var(--black)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.2em' }}>© 2025 TUNERLINK LLC</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.2em' }}>Built for enthusiasts · Powered by passion</span>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  )
}