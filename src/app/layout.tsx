import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Archivo, Geist_Mono } from 'next/font/google';
import Navigation from '@/components/portfolio/Navigation';
import { MotionProvider } from '@/components/portfolio/MotionPreferences';
import { siteConfig } from '@/config/site';

const archivo = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-archivo' });
const mono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' });
export const viewport: Viewport = { themeColor: '#E9E6DF' };
export const metadata: Metadata = {
  metadataBase: new URL('https://vardhansudo.me'),
  title: { default: 'Vardhan — Inside the System', template: '%s | Vardhan' },
  description: 'Full stack engineer in Cincinnati. Enterprise content platforms, interactive interfaces, and independent experiments in retrieval and browser engineering. Explore the systems behind the work.',
  alternates: { canonical: '/' },
  authors: [{ name: siteConfig.name, url: 'https://vardhansudo.me' }],
  openGraph: { title: 'Vardhan — Inside the System', description: 'Full stack engineer. Systems with depth.', siteName: 'Vardhan', url: '/', locale: 'en_US', type: 'website', images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vardhan — Inside the System. Full stack engineer in Cincinnati.' }] },
  twitter: { card: 'summary_large_image', title: 'Vardhan — Inside the System', description: 'Full stack engineer. Systems with depth.', images: ['/og-image.png'] },
  icons: { icon: '/icon.svg' },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={archivo.variable + ' ' + mono.variable}>
    <body><MotionProvider>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Navigation />
      <main id="main-content" tabIndex={-1}>{children}</main>
    </MotionProvider>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: siteConfig.name, url: 'https://vardhansudo.me', jobTitle: siteConfig.role, sameAs: Object.values(siteConfig.social) }) }} />
    </body>
  </html>;
}
