import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM || 'TunerLink <hello@tunerlink.co>'
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@tunerlink.co'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'davdndb@gmail.com'

if (!apiKey) {
  console.warn('[email] RESEND_API_KEY is not set. Emails will be no-ops.')
}

export const resend = apiKey ? new Resend(apiKey) : null

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://tunerlink.com'

/**
 * Wrap content in TunerLink-branded HTML shell.
 */
function shell(opts: {
  preheader?: string
  heading: string
  body: string
  ctaLabel?: string
  ctaHref?: string
}): string {
  const { preheader = '', heading, body, ctaLabel, ctaHref } = opts
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f4f0eb;">
    <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;font-size:0;line-height:0;">${preheader}</span>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#080808;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#0e0e0e;border:1px solid rgba(255,255,255,0.07);">
            <tr>
              <td style="padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.07);">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:14px;">
                      <div style="width:36px;height:36px;border:2px solid #ff2233;color:#ff2233;font-weight:700;font-size:13px;text-align:center;line-height:34px;letter-spacing:0.05em;">TL</div>
                    </td>
                    <td>
                      <span style="font-weight:700;font-size:18px;letter-spacing:0.1em;text-transform:uppercase;color:#f4f0eb;">TUNER<span style="color:#ff2233;">LINK</span></span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h1 style="margin:0 0 20px;font-size:26px;font-weight:800;text-transform:uppercase;letter-spacing:-0.01em;color:#f4f0eb;line-height:1.1;">${heading}</h1>
                <div style="font-size:15px;line-height:1.7;color:#bbb;">${body}</div>
                ${
                  ctaLabel && ctaHref
                    ? `<div style="margin-top:32px;">
                        <a href="${ctaHref}" style="display:inline-block;background:#ff2233;color:#000;text-decoration:none;padding:14px 32px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">${ctaLabel}</a>
                      </div>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.07);">
                <p style="margin:0;font-size:11px;color:#777;letter-spacing:0.05em;line-height:1.6;">
                  TunerLink LLC · Central Florida<br>
                  <a href="${SITE_URL}" style="color:#777;text-decoration:underline;">${SITE_URL.replace('https://', '')}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/**
 * Send the customer-waitlist welcome email.
 */
export async function sendWaitlistWelcome(to: string, fullName?: string | null) {
  if (!resend) return { skipped: true }
  const firstName = fullName?.split(' ')[0] || 'there'
  return resend.emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: "You're on the TunerLink list",
    html: shell({
      preheader: 'Thanks for joining the TunerLink waitlist — we\'ll be in touch as we go live in your area.',
      heading: `Welcome aboard, ${firstName}.`,
      body: `
        <p>You're officially on the TunerLink waitlist. We're rolling out across Central Florida shop-by-shop, and we'll email you the moment verified tuners are live in your zip.</p>
        <p>In the meantime, browse the shops we've already verified and start a wishlist of who you want to work with.</p>
      `,
      ctaLabel: 'Browse Verified Shops',
      ctaHref: `${SITE_URL}/shops`,
    }),
  })
}

/**
 * Send a confirmation to a shop applicant.
 */
export async function sendShopApplicationReceived(to: string, shopName: string, ownerName: string) {
  if (!resend) return { skipped: true }
  const firstName = ownerName.split(' ')[0] || 'there'
  return resend.emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `${shopName} — application received`,
    html: shell({
      preheader: 'We received your shop application and will review it within 1–2 business days.',
      heading: 'Application received.',
      body: `
        <p>Thanks ${firstName} — we received your application for <strong style="color:#f4f0eb;">${shopName}</strong>.</p>
        <p>Our team manually verifies every shop on TunerLink. We'll review your info and get back to you within <strong style="color:#f4f0eb;">1–2 business days</strong>. If we need anything else, we'll reach out at this email.</p>
        <p>Once approved, you'll get login credentials and a guided setup to claim your profile, set services, and connect Stripe for payouts.</p>
      `,
    }),
  })
}

/**
 * Notify the platform admin of a new shop application.
 */
export async function notifyAdminNewApplication(applicant: {
  shop_name: string
  owner_name: string
  email: string
  city?: string | null
  state?: string | null
  phone?: string | null
}) {
  if (!resend) return { skipped: true }
  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: applicant.email,
    subject: `[TunerLink] New shop application: ${applicant.shop_name}`,
    html: shell({
      heading: `New application: ${applicant.shop_name}`,
      body: `
        <p><strong style="color:#f4f0eb;">Owner:</strong> ${applicant.owner_name}<br>
        <strong style="color:#f4f0eb;">Email:</strong> ${applicant.email}<br>
        <strong style="color:#f4f0eb;">Phone:</strong> ${applicant.phone || '—'}<br>
        <strong style="color:#f4f0eb;">Location:</strong> ${applicant.city || '?'}, ${applicant.state || '?'}</p>
        <p>Review and approve in the admin dashboard (or directly in Supabase for now).</p>
      `,
    }),
  })
}

/**
 * Notify an applicant that their shop was approved.
 * Includes a claim link they follow to sign up and take ownership of the listing.
 */
export async function sendShopApprovalNotification(opts: {
  to: string
  ownerName: string
  shopName: string
  claimUrl: string
}) {
  if (!resend) return { skipped: true }
  const firstName = opts.ownerName.split(' ')[0] || 'there'
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    replyTo: REPLY_TO,
    subject: `${opts.shopName} is approved — claim your TunerLink profile`,
    html: shell({
      preheader: `${opts.shopName} was approved. Sign up to claim your profile and start receiving bookings.`,
      heading: 'You\u2019re in.',
      body: `
        <p>Hey ${firstName} — <strong style="color:#f4f0eb;">${opts.shopName}</strong> just got approved on TunerLink.</p>
        <p>Next step is claiming your profile so you can set services, pricing, availability, and connect Stripe for payouts. Takes about 10 minutes.</p>
        <p>Click the button below to sign up with this same email — your listing will link automatically.</p>
      `,
      ctaLabel: 'Claim Your Profile',
      ctaHref: opts.claimUrl,
    }),
  })
}

/**
 * Notify an applicant that their shop application was rejected.
 */
export async function sendShopRejectionNotification(opts: {
  to: string
  ownerName: string
  shopName: string
  reason?: string | null
}) {
  if (!resend) return { skipped: true }
  const firstName = opts.ownerName.split(' ')[0] || 'there'
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    replyTo: REPLY_TO,
    subject: `Update on your TunerLink application`,
    html: shell({
      preheader: `An update on your ${opts.shopName} application.`,
      heading: 'Application update.',
      body: `
        <p>Hey ${firstName} — thanks for applying to list <strong style="color:#f4f0eb;">${opts.shopName}</strong> on TunerLink.</p>
        <p>We weren\u2019t able to approve your application at this time.${opts.reason ? ` <br><br><em style="color:#bbb;">Reason: ${opts.reason}</em>` : ''}</p>
        <p>If you think this was a mistake or your situation has changed, reply to this email and we\u2019ll take another look.</p>
      `,
    }),
  })
}

/**
 * Notify a customer that their booking was created.
 */
export async function sendBookingCreated(opts: {
  to: string
  customerName?: string | null
  shopName: string
  serviceName: string
  bookingDate: string // ISO date
  bookingTime?: string | null
  bookingId: string
}) {
  if (!resend) return { skipped: true }
  const firstName = opts.customerName?.split(' ')[0] || 'there'
  const dateStr = new Date(opts.bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    replyTo: REPLY_TO,
    subject: `Booking confirmed at ${opts.shopName}`,
    html: shell({
      preheader: `Your appointment with ${opts.shopName} on ${dateStr}.`,
      heading: 'Booking confirmed.',
      body: `
        <p>Hey ${firstName} — your booking with <strong style="color:#f4f0eb;">${opts.shopName}</strong> is in.</p>
        <p style="background:#131313;border:1px solid rgba(255,255,255,0.07);padding:20px;margin:24px 0;">
          <strong style="color:#f4f0eb;">${opts.serviceName}</strong><br>
          ${dateStr}${opts.bookingTime ? ` · ${opts.bookingTime}` : ''}
        </p>
        <p>The shop will reach out to confirm details. You can message them directly or manage this booking in your dashboard.</p>
      `,
      ctaLabel: 'View Booking',
      ctaHref: `${SITE_URL}/dashboard/bookings`,
    }),
  })
}

/**
 * Notify a shop owner that they have a new booking request.
 */
export async function sendShopBookingNotification(opts: {
  to: string
  shopName: string
  customerName: string
  serviceName: string
  bookingDate: string
  bookingTime?: string | null
}) {
  if (!resend) return { skipped: true }
  const dateStr = new Date(opts.bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    replyTo: REPLY_TO,
    subject: `New booking request — ${opts.serviceName}`,
    html: shell({
      preheader: `${opts.customerName} just booked ${opts.serviceName} at ${opts.shopName}.`,
      heading: 'New booking request.',
      body: `
        <p><strong style="color:#f4f0eb;">${opts.customerName}</strong> just requested a booking at <strong style="color:#f4f0eb;">${opts.shopName}</strong>.</p>
        <p style="background:#131313;border:1px solid rgba(255,255,255,0.07);padding:20px;margin:24px 0;">
          <strong style="color:#f4f0eb;">${opts.serviceName}</strong><br>
          ${dateStr}${opts.bookingTime ? ` · ${opts.bookingTime}` : ''}
        </p>
        <p>Confirm or decline in your dashboard. The customer will see your response within minutes.</p>
      `,
      ctaLabel: 'Open Dashboard',
      ctaHref: `${SITE_URL}/dashboard/bookings`,
    }),
  })
}
