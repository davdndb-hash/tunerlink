import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How TunerLink collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--white)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 52px', background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #ff2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ff2233' }}>TL</div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>TUNER<span style={{ color: '#ff2233' }}>LINK</span></span>
        </Link>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div className="label-tl">Legal</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(40px, 6vw, 72px)', textTransform: 'uppercase', lineHeight: 0.92, marginBottom: 24 }}>
          Privacy <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Policy.</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 48 }}>
          Last updated: April 21, 2026
        </p>

        <div style={{ color: 'var(--lgrey)', fontSize: 15, lineHeight: 1.9 }}>
          <Section title="1. Introduction">
            TunerLink LLC (&ldquo;TunerLink&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have. This Policy applies to the TunerLink website, mobile site, and any related services (the &ldquo;Service&rdquo;).
          </Section>

          <Section title="2. Information We Collect">
            We collect information in three ways:
            <br /><br />
            <strong style={{ color: 'var(--white)' }}>Information you provide:</strong> name, email, phone, city, vehicle details, shop business details, payment information (processed by Stripe), messages, reviews, and any content you submit.
            <br /><br />
            <strong style={{ color: 'var(--white)' }}>Information collected automatically:</strong> IP address, device type, browser, pages visited, referring URL, and rough location derived from your IP.
            <br /><br />
            <strong style={{ color: 'var(--white)' }}>Information from third parties:</strong> Google (if you sign in with Google), publicly available business information for unclaimed shop listings.
          </Section>

          <Section title="3. How We Use Information">
            We use your information to operate, maintain, and improve the Service; to facilitate bookings between customers and shops; to process payments; to communicate with you about your account, bookings, and support issues; to prevent fraud and abuse; to comply with legal obligations; and to send marketing messages (which you can opt out of at any time).
          </Section>

          <Section title="4. How We Share Information">
            We share information:
            <br />
            <strong style={{ color: 'var(--white)' }}>With shops:</strong> When you book or message a shop, we share the details needed to fulfill the service.
            <br />
            <strong style={{ color: 'var(--white)' }}>With service providers:</strong> Supabase (hosting and database), Stripe (payments), Resend (email), Vercel (hosting), and analytics providers.
            <br />
            <strong style={{ color: 'var(--white)' }}>For legal reasons:</strong> To comply with law, respond to lawful requests, enforce our Terms, or protect the rights, property, or safety of TunerLink, our users, or others.
            <br />
            <strong style={{ color: 'var(--white)' }}>With your consent:</strong> In any other case where you direct us to share.
            <br /><br />
            We do not sell your personal information.
          </Section>

          <Section title="5. Your Choices">
            You can update your account information at any time from your dashboard. You can delete your account by emailing <a href="mailto:hello@tunerlink.com" style={{ color: '#ff2233' }}>hello@tunerlink.com</a>. You can opt out of marketing emails using the unsubscribe link in any marketing message.
          </Section>

          <Section title="6. Data Retention">
            We retain account information for as long as your account is active and for a reasonable period afterward to support audits, resolve disputes, and comply with legal obligations. Transaction records may be retained for up to 7 years as required by tax and financial regulations.
          </Section>

          <Section title="7. Security">
            We use reasonable technical and organizational safeguards to protect your information, including TLS encryption in transit, encrypted storage, role-based access controls, and regular security reviews. No system is perfectly secure; we cannot guarantee absolute security.
          </Section>

          <Section title="8. Children">
            The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, contact us and we will delete it.
          </Section>

          <Section title="9. California, Colorado, Virginia, and Other State Rights">
            Depending on where you live, you may have rights to access, correct, or delete the personal information we hold about you, and to opt out of certain processing. To exercise these rights, email <a href="mailto:privacy@tunerlink.com" style={{ color: '#ff2233' }}>privacy@tunerlink.com</a>. We will verify your request and respond within the time required by applicable law.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Policy from time to time. We will post the updated version with a new &ldquo;Last updated&rdquo; date and, for material changes, notify registered users by email or in-app notice.
          </Section>

          <Section title="11. Contact">
            Questions or concerns? Email <a href="mailto:privacy@tunerlink.com" style={{ color: '#ff2233' }}>privacy@tunerlink.com</a>.
          </Section>
        </div>

        <div style={{ marginTop: 64, padding: '32px', border: '1px solid var(--border)', background: 'var(--dark)', textAlign: 'center' }}>
          <p style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 20 }}>
            See also: <Link href="/terms" style={{ color: '#ff2233' }}>Terms of Service</Link> · <Link href="/contact" style={{ color: '#ff2233' }}>Contact</Link>
          </p>
          <Link href="/" className="btn-tl" style={{ padding: '12px 28px', fontSize: 11 }}>Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--white)', marginBottom: 12 }}>{title}</h2>
      <div>{children}</div>
    </div>
  )
}
