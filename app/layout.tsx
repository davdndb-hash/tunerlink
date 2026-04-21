import type { Metadata } from 'next'
import { Rajdhani, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
})

const mono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tunerlink.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TunerLink — Find Your Performance Specialist',
    template: '%s · TunerLink',
  },
  description:
    'TunerLink connects car owners with verified performance tuning shops across Central Florida. Browse dyno tuners, fabricators, and engine builders by specialty — book direct, pay securely.',
  keywords: [
    'performance tuning',
    'dyno tuning',
    'car tuning shops',
    'central florida tuners',
    'tampa dyno tuning',
    'orlando performance shops',
    'ECU tuning',
    'turbo install',
    'engine builds',
    'JDM tuning',
    'European tuning',
    'TunerLink',
  ],
  authors: [{ name: 'TunerLink LLC' }],
  creator: 'TunerLink LLC',
  publisher: 'TunerLink LLC',
  applicationName: 'TunerLink',
  category: 'automotive',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'TunerLink',
    title: 'TunerLink — Find Your Performance Specialist',
    description:
      'Verified performance tuning shops across Central Florida. Book direct, pay securely, get the build you want.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TunerLink — Find Your Performance Specialist',
    description:
      'Verified performance tuning shops across Central Florida. Book direct, pay securely.',
    creator: '@tunerlink',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  themeColor: '#080808',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${rajdhani.variable} ${mono.variable}`} style={{ fontFamily: 'var(--font-body), sans-serif' }}>
        {children}
      </body>
    </html>
  )
}