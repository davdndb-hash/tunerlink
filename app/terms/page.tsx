import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'TunerLink terms of service and user agreement.',
}

export default function TermsPage() {
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
          Terms of <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, #ff2233, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Service.</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: 48 }}>
          Last updated: April 21, 2026
        </p>

        <div style={{ color: 'var(--lgrey)', fontSize: 15, lineHeight: 1.9 }}>
          <Section title="1. Agreement to Terms">
            By accessing or using TunerLink (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). The Service is operated by TunerLink LLC, a Florida limited liability company (&ldquo;TunerLink&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). If you do not agree to these Terms, you must not use the Service.
          </Section>

          <Section title="2. What TunerLink Does">
            TunerLink is a two-sided marketplace that connects car owners with independent automotive performance shops. We provide listing, discovery, communication, scheduling, and payment tools. We are not a party to any service agreement between a customer and a shop. We do not perform automotive work, and we make no representations or warranties regarding the quality, safety, legality, or fitness of any shop&rsquo;s work.
          </Section>

          <Section title="3. Eligibility">
            You must be at least 18 years old and capable of forming a binding contract to use TunerLink. By using the Service you represent that you meet these requirements. Business accounts may only be created by individuals with authority to bind the represented business.
          </Section>

          <Section title="4. Accounts">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate and complete information and to keep that information up to date. We may suspend or terminate accounts that violate these Terms.
          </Section>

          <Section title="5. Shop Listings">
            Shop listings may be created (a) by shop owners who submit an application through the Service, or (b) by TunerLink using publicly available business information. Listings created by TunerLink are marked as unclaimed. Any shop owner may claim their listing at no cost by verifying ownership through our application process. If you are a shop owner and wish to have your listing removed rather than claimed, email <a href="mailto:hello@tunerlink.com" style={{ color: '#ff2233' }}>hello@tunerlink.com</a> and we will remove it within 7 business days.
          </Section>

          <Section title="6. Bookings and Payments">
            When a customer books a service, a contract is formed directly between the customer and the shop. TunerLink may act as a limited payment agent, collecting deposits and final payments through our payment processor (Stripe) and remitting funds to shops after the work is approved. TunerLink charges a platform fee disclosed at checkout. All fees are non-refundable except as required by law.
          </Section>

          <Section title="7. Shop Verification and Badges">
            TunerLink displays badges indicating verification steps we have completed (identity, license, insurance, etc.). Verification is a limited check and does not constitute an endorsement, certification, or guarantee. Customers are responsible for their own due diligence.
          </Section>

          <Section title="8. Reviews">
            Only customers with a completed booking through TunerLink may post reviews. Reviews must reflect the reviewer&rsquo;s honest, firsthand experience. We reserve the right to remove reviews that violate our content policies.
          </Section>

          <Section title="9. Prohibited Conduct">
            You may not: (a) use the Service for any unlawful purpose; (b) post false, misleading, or defamatory content; (c) scrape, mirror, or reverse engineer the Service; (d) circumvent our payment system; (e) harass, abuse, or threaten other users; or (f) interfere with the operation of the Service.
          </Section>

          <Section title="10. Intellectual Property">
            The Service and all related content (excluding user content) are owned by TunerLink LLC and protected by copyright, trademark, and other laws. You receive a limited, non-exclusive, non-transferable license to use the Service in accordance with these Terms.
          </Section>

          <Section title="11. Disclaimers">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND. TUNERLINK DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. TUNERLINK IS NOT RESPONSIBLE FOR THE QUALITY, SAFETY, OR LEGALITY OF ANY WORK PERFORMED BY SHOPS LISTED ON THE SERVICE.
          </Section>

          <Section title="12. Limitation of Liability">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TUNERLINK&rsquo;S TOTAL LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT OF FEES YOU PAID TO TUNERLINK IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS.
          </Section>

          <Section title="13. Dispute Resolution">
            Any dispute arising out of these Terms or your use of the Service shall be resolved in the state or federal courts located in Hillsborough County, Florida. You and TunerLink each waive any right to a jury trial or class action.
          </Section>

          <Section title="14. Changes to These Terms">
            We may update these Terms at any time. We will notify registered users of material changes. Continued use of the Service after a change takes effect constitutes acceptance of the revised Terms.
          </Section>

          <Section title="15. Contact">
            Questions about these Terms? Email <a href="mailto:hello@tunerlink.com" style={{ color: '#ff2233' }}>hello@tunerlink.com</a>.
          </Section>
        </div>

        <div style={{ marginTop: 64, padding: '32px', border: '1px solid var(--border)', background: 'var(--dark)', textAlign: 'center' }}>
          <p style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 20 }}>
            See also: <Link href="/privacy" style={{ color: '#ff2233' }}>Privacy Policy</Link> · <Link href="/contact" style={{ color: '#ff2233' }}>Contact</Link>
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
