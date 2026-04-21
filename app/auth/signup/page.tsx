'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer' | 'shop'>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>🏁</div>
        <h1 style={{ fontWeight: 800, fontSize: 48, textTransform: 'uppercase', lineHeight: 0.9 }}>
          Check Your<br />
          <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Email.</em>
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: 15, maxWidth: 400, lineHeight: 1.8 }}>
          We sent a confirmation link to <strong style={{ color: 'var(--white)' }}>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/" className="btn-tl" style={{ padding: '12px 32px', fontSize: 11 }}>Back to Home</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
        <Link href="/auth/login" className="btn-tl" style={{ padding: '10px 22px', fontSize: 11 }}>Sign In</Link>
      </nav>

      {/* FORM */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div className="label-tl" style={{ marginBottom: 16 }}>Join TunerLink</div>
          <h1 style={{ fontWeight: 800, fontSize: 48, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 32 }}>
            Create<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Account.</em>
          </h1>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 24 }}>
            {(['customer', 'shop'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: '14px',
                  background: role === r ? 'rgba(255,34,51,0.08)' : 'var(--dark)',
                  border: 'none',
                  borderBottom: role === r ? '2px solid #ff2233' : '2px solid transparent',
                  color: role === r ? 'var(--white)' : 'var(--grey)',
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {r === 'customer' ? '🚗 Car Owner' : '🔧 Shop Owner'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="btn-tl"
            style={{ width: '100%', textAlign: 'center', padding: '14px', fontSize: 12, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Full Name</label>
              <input type="text" className="input-tl" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
              <input type="email" className="input-tl" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--lgrey)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
              <input type="password" className="input-tl" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', border: '1px solid rgba(255,34,51,0.3)', background: 'rgba(255,34,51,0.05)', color: '#ff2233', fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                ↳ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-tl btn-red"
              style={{ width: '100%', textAlign: 'center', padding: '14px', fontSize: 12, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creating account...' : 'Create Account — Free'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--grey)', fontSize: 13 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#ff2233', textDecoration: 'none' }}>Sign in</Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--grey)', fontSize: 11, lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--grey)', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: 'var(--grey)', textDecoration: 'underline' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
