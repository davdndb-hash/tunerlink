import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/diag-email
 *
 * Admin-free (safe because it returns only diagnostic metadata, no secret values)
 * diagnostic endpoint for Resend deliverability.
 *
 * Reports:
 *   - whether RESEND_API_KEY is set
 *   - whether EMAIL_FROM is set and what it resolves to (value echoed for diag)
 *   - the list of domains configured in Resend (including verification status)
 *   - a live test-send to davdndb@gmail.com and the verbatim Resend SDK response
 */
export async function GET(_req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'TunerLink <hello@tunerlink.co>'
  const replyTo = process.env.EMAIL_REPLY_TO || 'hello@tunerlink.co'

  const out: any = {
    env: {
      hasResendApiKey: Boolean(apiKey),
      apiKeyPrefix: apiKey ? `${apiKey.slice(0, 7)}…` : null,
      emailFrom: from,
      emailReplyTo: replyTo,
    },
    domains: null as any,
    testSend: null as any,
  }

  if (!apiKey) {
    return NextResponse.json({ ...out, error: 'RESEND_API_KEY missing' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  // 1) List domains + their verification status
  try {
    const domainsResp = await resend.domains.list()
    out.domains = domainsResp
  } catch (err: any) {
    out.domains = { error: err?.message || String(err) }
  }

  // 2) Attempt a real send to davdndb@gmail.com and capture the verbatim response
  try {
    const sendResp = await resend.emails.send({
      from,
      to: 'davdndb@gmail.com',
      replyTo,
      subject: '[TunerLink] Diagnostic — Resend deliverability test',
      html:
        '<p>This is a diagnostic send from <strong>/api/admin/diag-email</strong> to verify Resend is configured correctly.</p>' +
        '<p>If you received this, delivery is working and the issue was elsewhere.</p>',
    })
    out.testSend = sendResp
  } catch (err: any) {
    out.testSend = { thrown: err?.message || String(err) }
  }

  return NextResponse.json(out)
}
