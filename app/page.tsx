'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const curRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (curRef.current) {
        curRef.current.style.transform = `translate(${e.clientX - 9}px,${e.clientY - 9}px)`
      }
    }
    document.addEventListener('mousemove', move, { passive: true })
    return () => document.removeEventListener('mousemove', move)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize, { passive: true })
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.4 + .3, age: 0, life: Math.random() * 200 + 100,
      col: Math.random() > .7 ? '#ff2233' : '#ff6600'
    }))
    const reset = (p: typeof pts[0]) => { p.x = Math.random() * W; p.y = Math.random() * H; p.vx = (Math.random() - .5) * .28; p.vy = (Math.random() - .5) * .28; p.age = 0; p.life = Math.random() * 200 + 100 }
    let raf: number
    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]; a.x += a.vx; a.y += a.vy; a.age++
        if (a.x < 0 || a.x > W || a.y < 0 || a.y > H || a.age > a.life) reset(a)
        const op = Math.sin((a.age / a.life) * Math.PI) * .5
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy)
          if (d < 90) { ctx.save(); ctx.globalAlpha = (1 - d / 90) * .07 * op; ctx.strokeStyle = '#ff2233'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore() }
        }
        ctx.save(); ctx.globalAlpha = op; ctx.fillStyle = a.col; ctx.shadowBlur = 6; ctx.shadowColor = a.col; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes mPulse{0%{opacity:.7;transform:scale(1)}100%{opacity:1;transform:scale(1.05)}}
        @keyframes fLine{0%,100%{opacity:.5;transform:scaleX(.95)}50%{opacity:1;transform:scaleX(1)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes dp{0%,100%{opacity:1;box-shadow:0 0 8px #ff2233}50%{opacity:.4;box-shadow:0 0 2px #ff2233}}
        @keyframes ctaP{0%{opacity:.5}100%{opacity:1}}
        @keyframes gP{0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1)}50%{opacity:.9;transform:translate(-50%,-50%) scale(1.15)}}
        body{cursor:crosshair}
        .ap-panel:hover .ap-hover-bg{opacity:1!important}
        .ap-panel:hover .ap-num-bg{color:rgba(255,255,255,.04)!important}
        .cc-card:hover{border-color:#ff2233!important;transform:translateY(-6px)!important}
        .fc-card:hover{background:var(--panel)!important}
        .fc-card:hover .fc-top-bar{transform:scaleX(1)!important}
        .fc-card:hover .fc-arrow{opacity:1!important;transform:translate(3px,-3px)!important}
      `}</style>

      <div ref={curRef} style={{ width: 18, height: 18, border: '2px solid #ff2233', borderRadius: '50%', position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999, mixBlendMode: 'exclusion', transition: 'width .15s,height .15s' }} />
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: .45 }} />

      <div style={{ position: 'relative', zIndex: 1, background: 'var(--black)', color: 'var(--white)' }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, padding: scrolled ? '14px 52px' : '22px 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(8,8,8,.94)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent', transition: 'all .3s' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: '.12em', color: 'var(--white)' }}>
            <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#ff2233', fontFamily: 'monospace' }}>TL</div>
            TUNER<em style={{ fontStyle: 'normal', color: '#ff2233' }}>LINK</em>
          </Link>
          <ul style={{ display: 'flex', gap: 40, listStyle: 'none', padding: 0 }}>
          {[['Shops', '/shops'], ['Features', '/features'], ['About', '/about'], ['List My Shop', '/list-shop'], ['For Owners', '/b2c'], ['For Shops', '/b2b']].map(([l, h]) => (
              <li key={l}><Link href={h} className="nav-link">{l}</Link></li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/shops" className="btn-tl" style={{ padding: '11px 26px', fontSize: 11 }}>Find a Tuner</Link>
            <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '11px 26px', fontSize: 11 }}>List Your Shop</Link>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 52px 80px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 60% at 75% 35%,rgba(255,34,51,.18) 0%,transparent 55%),radial-gradient(ellipse 35% 40% at 20% 70%,rgba(255,102,0,.1) 0%,transparent 50%)', animation: 'mPulse 8s ease-in-out infinite alternate', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px)', opacity: .4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '.38em', color: '#ff2233', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 36, height: 1, background: 'linear-gradient(90deg,#ff2233,#ff6600)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ animation: 'blink .8s step-end infinite' }}>▌</span>
              The Performance Shop Marketplace
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(80px,12vw,180px)', lineHeight: .88, textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 30 }}>
              Find Your<br />
              <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block', filter: 'drop-shadow(0 0 40px rgba(255,34,51,.4))' }}>Specialist.</em>
            </h1>
            <p style={{ fontSize: 16, fontWeight: 300, color: 'var(--grey)', maxWidth: 500, lineHeight: 1.75, marginBottom: 44 }}>
              The premier platform connecting car owners with verified local performance shops — matched by specialty, vehicle, and location.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/shops" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>I Need a Tuner</Link>
              <Link href="/list-shop" className="btn-tl" style={{ padding: '16px 44px', fontSize: 12 }}>List My Business</Link>
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--border)', marginTop: 64 }}>
              {[['21+', 'Verified Shops'], ['10', 'Specializations'], ['Tampa–PSL', 'Coverage Area'], ['Free', 'To List']].map(([n, l], i) => (
                <div key={l} style={{ flex: 1, padding: '32px 0', borderRight: i < 3 ? '1px solid var(--border)' : 'none', paddingRight: 24 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 54, lineHeight: 1, background: 'linear-gradient(135deg,#fff,#bbb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{n}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.28em', color: 'var(--grey)', textTransform: 'uppercase', marginTop: 8 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#ff2233,#ff6600,#ff2233,transparent)', animation: 'fLine 3s ease-in-out infinite' }} />
        </section>

        {/* TICKER */}
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', overflow: 'hidden', whiteSpace: 'nowrap', background: 'linear-gradient(90deg,var(--dark),#0f0f0f,var(--dark))', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 120, background: 'linear-gradient(90deg,var(--dark),transparent)', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 120, background: 'linear-gradient(270deg,var(--dark),transparent)', zIndex: 1 }} />
          <div style={{ display: 'inline-flex', animation: 'tick 28s linear infinite' }}>
            {['Diesel Performance','Turbo Builds','Supercharged','JDM Specialist','Euro Tuning','American Muscle','Off-Road & Truck','Track & Motorsport','E85 / Flex Fuel','Remote Tuning','Diesel Performance','Turbo Builds','Supercharged','JDM Specialist','Euro Tuning','American Muscle','Off-Road & Truck','Track & Motorsport','E85 / Flex Fuel','Remote Tuning'].map((item, i) => (
              <span key={i} style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', padding: '0 36px', color: 'var(--grey)', display: 'inline-flex', alignItems: 'center', gap: 18 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff2233', flexShrink: 0, boxShadow: '0 0 6px #ff2233', display: 'inline-block' }} />{item}
              </span>
            ))}
          </div>
        </div>

        {/* SPLIT B2C / B2B */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '96vh' }}>
          {[
            { tag: 'Public Access · B2C', title: 'For\nOwners.', desc: 'You have the car. We have the shops. Search by make, model, ZIP, and specialization — book in minutes.', items: ['Search verified performance shops','Filter by specialty, distance & rating','Instant book or request a quote','Attach your vehicle profile & mods','Verified reviews only'], cta: 'Explore Now', ctaRed: true, href: '/shops', num: '01', bg: 'var(--dark)', border: true },
            { tag: 'Business Access · B2B', title: 'For\nShops.', desc: 'List your services, certifications, and portfolio. Reach customers who need exactly what you specialize in.', items: ['Full shop profile & portfolio','Service catalog with live pricing','Booking & scheduling tools','Analytics dashboard','Verified badge eligibility'], cta: 'Apply Now', ctaRed: false, href: '/list-shop', num: '02', bg: 'var(--black)', border: false },
          ].map((panel) => (
            <Link key={panel.num} href={panel.href} className="ap-panel" style={{ padding: '110px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'crosshair', background: panel.bg, borderRight: panel.border ? '1px solid var(--border)' : 'none', textDecoration: 'none', color: 'var(--white)' }}>
              <div className="ap-hover-bg" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 80% at 40% 50%,rgba(255,34,51,.1),transparent)', opacity: 0, transition: 'opacity .5s', pointerEvents: 'none' }} />
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '.28em', color: '#ff2233', textTransform: 'uppercase', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2233', boxShadow: '0 0 8px #ff2233', display: 'inline-block', animation: 'dp 2s ease-in-out infinite' }} />
                {panel.tag}
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(64px,9vw,128px)', lineHeight: .88, textTransform: 'uppercase', marginBottom: 28, letterSpacing: '.01em', whiteSpace: 'pre-line' }}>{panel.title}</div>
              <p style={{ fontSize: 15, color: 'var(--grey)', lineHeight: 1.82, maxWidth: 400, marginBottom: 44 }}>{panel.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 44, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {panel.items.map(item => (
                  <li key={item} style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '.15em', color: 'var(--lgrey)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#ff2233', fontSize: 14 }}>→</span>{item}
                  </li>
                ))}
              </ul>
              <span className={`btn-tl${panel.ctaRed ? ' btn-red' : ''}`} style={{ padding: '16px 44px', fontSize: 12, alignSelf: 'flex-start', borderColor: panel.ctaRed ? undefined : 'rgba(255,255,255,.25)' }}>{panel.cta}</span>
              <div className="ap-num-bg" style={{ position: 'absolute', right: 40, bottom: 40, fontFamily: "'Bebas Neue',sans-serif", fontSize: 200, lineHeight: 1, color: 'rgba(255,255,255,.025)', pointerEvents: 'none', letterSpacing: '-.05em', transition: 'color .5s' }}>{panel.num}</div>
            </Link>
          ))}
        </div>

        {/* TUNING CLASSES */}
        <section id="cls" style={{ padding: '120px 52px', background: 'var(--dark)' }}>
          <div className="label-tl">Specializations</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,7vw,100px)', textTransform: 'uppercase', lineHeight: .93 }}>
            10 Tuning<br /><em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Classes.</em>
          </h2>
          <div style={{ display: 'flex', gap: 18, overflowX: 'auto', marginTop: 60, paddingBottom: 12 }}>
            {[['01','Diesel\nPerformance','Duramax · Cummins · Power Stroke · TDI'],['02','Turbo\nBuilds','STi · EVO · EcoBoost · Supra GR · GTR'],['03','Super-\ncharged','Hellcat · GT500 · ZL1 · CTS-V · LSx'],['04','JDM\nSpecialist','Civic · RX-7 · Silvia · Skyline · EVO'],['05','Euro\nTuning','BMW · Audi · VW · Porsche · Mercedes'],['06','American\nMuscle','Mustang · Camaro · Charger · Corvette'],['07','Off-Road\n& Truck','F-250 · Cummins · Wrangler · Tacoma'],['08','Track &\nMotorsport','Time Attack · NASA · SCCA · Drift'],['09','E85 /\nFlex Fuel','Ethanol · Flex Sensor · Custom Maps'],['10','Remote\nTuning','Mail-in ECU · OBD Remote · Nationwide']].map(([n,name,ex]) => (
              <div key={n} className="cc-card" style={{ flexShrink: 0, width: 270, border: '1px solid var(--border)', padding: '38px 30px', background: 'var(--panel)', position: 'relative', overflow: 'hidden', transition: 'border-color .3s,transform .35s', cursor: 'crosshair' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.3em', color: '#ff2233', textTransform: 'uppercase', marginBottom: 18 }}>Class {n}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 18, whiteSpace: 'pre-line' }}>{name}</div>
                <div style={{ fontSize: 12, color: 'var(--grey)', lineHeight: 1.7 }}>{ex}</div>
                <div style={{ position: 'absolute', bottom: -24, right: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 108, color: 'rgba(255,255,255,.03)', lineHeight: 1, pointerEvents: 'none' }}>{n}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PLATFORM FEATURES */}
        <section style={{ padding: '120px 52px' }}>
          <div className="label-tl">Platform</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,7vw,100px)', textTransform: 'uppercase', lineHeight: .93 }}>
            Built For<br /><em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Performance.</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginTop: 72 }}>
            {[['01 — Discovery','🔍','Smart Search\n& Filter','ZIP-based geo-search. Filter by specialty, vehicle, certification, dyno availability, and price range.'],['02 — Booking','📅','Instant Book\nor Quote','Real-time scheduling. Instant Book or Request Quote flows. Automated confirmations.'],['03 — Trust','🛡','Verified\nBadges','Identity, license, insurance, and certifications verified. Only real completions unlock reviews.'],['04 — Payments','💳','Escrow\nPayment','Platform holds deposit securely. Released to shop on customer sign-off. Dispute resolution included.'],['05 — Data','📈','Dyno Sheet\nPortfolio','Before/after dyno logs attached to every completed job. Visible on profiles and build history.'],['06 — Business','🏢','Shop\nAccounts','Multi-vehicle fleet management. Assign jobs. Track active projects with shop-level analytics.']].map(([num,icon,title,desc]) => (
              <div key={num} className="fc-card" style={{ background: 'var(--dark)', padding: '48px 40px', position: 'relative', overflow: 'hidden', transition: 'background .3s' }}>
                <div className="fc-top-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#ff2233,#ff6600)', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform .4s' }} />
                <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.32em', color: '#ff2233', marginBottom: 28, textTransform: 'uppercase' }}>{num}</div>
                <span style={{ fontSize: 34, marginBottom: 18, display: 'block', filter: 'drop-shadow(0 0 8px rgba(255,34,51,.3))' }}>{icon}</span>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14, lineHeight: 1.1, whiteSpace: 'pre-line' }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.82 }}>{desc}</div>
                <div className="fc-arrow" style={{ position: 'absolute', bottom: 32, right: 32, color: '#ff2233', fontSize: 22, opacity: 0, transition: 'opacity .25s,transform .25s' }}>↗</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/shops" className="btn-tl btn-red" style={{ padding: '16px 44px', fontSize: 12 }}>Browse All Shops</Link>
          </div>
        </section>

        {/* CTA STRIP */}
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '110px 52px', textAlign: 'center', background: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 110% at 50% 50%,rgba(255,34,51,.09),transparent)', animation: 'ctaP 6s ease-in-out infinite alternate', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(52px,10vw,130px)', textTransform: 'uppercase', lineHeight: .9, letterSpacing: '.01em', marginBottom: 48, position: 'relative' }}>
            Ready To<br /><em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff2233,#ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 40px rgba(255,34,51,.5))' }}>Tune Up?</em>
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
            { h: 'Platform', links: [['Find a Tuner','/shops'],['List Your Shop','/list-shop'],['Features','/features'],['Tuning Classes','/#cls']] },
            { h: 'Company', links: [['About Us','/about'],['Contact','/contact']] },
            { h: 'Legal', links: [['Terms of Service','/terms'],['Privacy Policy','/privacy']] },
          ].map(col => (
            <div key={col.h}>
              <h4 style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 18 }}>{col.h}</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(([label,href]) => (
                  <li key={label}><Link href={href} style={{ fontSize: 13, color: 'var(--grey)', textDecoration: 'none' }}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </footer>
        <div style={{ padding: '14px 52px', background: 'var(--black)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.2em' }}>© 2025 TUNERLINK LLC — All rights reserved</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--grey)', letterSpacing: '.2em' }}>Built for enthusiasts · Powered by passion</span>
        </div>
      </div>
    </>
  )
}