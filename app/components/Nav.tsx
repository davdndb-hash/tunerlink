'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS: [string, string][] = [
  ['Shops', '/shops'],
  ['Dyno Pulls', '/dinos'],
  ['Features', '/features'],
  ['About', '/about'],
  ['List My Shop', '/list-shop'],
  ['For Owners', '/b2c'],
  ['For Shops', '/b2b'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const opaque = !isHome || scrolled

  return (
    <nav style={{
      position: isHome ? 'fixed' : 'sticky',
      top: 0, left: 0, right: 0,
      zIndex: 500,
      padding: opaque ? '14px 52px' : '22px 52px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: opaque
        ? 'rgba(8,8,8,.97)'
        : 'linear-gradient(180deg, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0.0) 100%)',
      backdropFilter: 'blur(10px)',
      borderBottom: opaque ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all .3s',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontFamily: "var(--font-display), 'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: '.12em', color: 'var(--white)', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#ff2233', fontFamily: 'monospace' }}>TL</div>
        TUNER<em style={{ fontStyle: 'normal', color: '#ff2233' }}>LINK</em>
      </Link>

      {/* Links */}
      <ul style={{ display: 'flex', gap: 28, listStyle: 'none', padding: 0, margin: 0, flexWrap: 'nowrap' }}>
        {NAV_LINKS.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="nav-link"
              style={pathname === href ? { color: 'var(--white)' } : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right actions — Sign In always visible */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <Link href="/auth/login" className="nav-link" style={{ letterSpacing: '.18em', whiteSpace: 'nowrap' }}>
          Sign In
        </Link>
        <Link href="/shops" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11, whiteSpace: 'nowrap' }}>
          Find a Tuner
        </Link>
        <Link href="/list-shop" className="btn-tl btn-red" style={{ padding: '10px 22px', fontSize: 11, whiteSpace: 'nowrap' }}>
          List Your Shop
        </Link>
      </div>
    </nav>
  )
}
