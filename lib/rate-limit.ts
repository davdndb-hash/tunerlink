/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 *
 * Suitable for low/medium traffic. Each Vercel serverless instance keeps its
 * own counter — for production-grade rate limiting across instances, swap
 * the store for Upstash Redis or Vercel KV.
 *
 * Usage:
 *   const limit = rateLimit({ windowMs: 60_000, max: 5 })
 *   const { ok, retryAfter } = limit(getClientIp(req))
 *   if (!ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
 */

import type { NextRequest } from 'next/server'

type Bucket = { count: number; resetAt: number }

// Module-level Map persists across requests within the same warm Lambda.
const stores = new Map<string, Map<string, Bucket>>()

function getStore(name: string): Map<string, Bucket> {
  let s = stores.get(name)
  if (!s) {
    s = new Map()
    stores.set(name, s)
  }
  return s
}

export function rateLimit(opts: { windowMs: number; max: number; name?: string }) {
  const { windowMs, max, name = 'default' } = opts
  const store = getStore(name)

  return function check(key: string): { ok: boolean; retryAfter: number; remaining: number } {
    const now = Date.now()
    const bucket = store.get(key)

    if (!bucket || bucket.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return { ok: true, retryAfter: 0, remaining: max - 1 }
    }

    if (bucket.count >= max) {
      return {
        ok: false,
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
        remaining: 0,
      }
    }

    bucket.count++
    return { ok: true, retryAfter: 0, remaining: max - bucket.count }
  }
}

/**
 * Best-effort client IP extraction from common Vercel/proxy headers.
 * Falls back to a fixed string so dev environments still rate-limit.
 */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
