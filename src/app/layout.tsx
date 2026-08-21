import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import EntrySequence from "@/components/EntrySequence";
import InstrumentRail from "@/components/InstrumentRail";
import StateCursor from "@/components/StateCursor";
import { Archivo, Geist, Geist_Mono } from "next/font/google";

// Display face. The wdth axis is what makes this the loud face; headlines set
// it between 110 and 125, so it has to be requested as a variable axis here.
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-archivo",
});

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Vardhan - Full Stack Engineer",
    template: "%s | Vardhan"
  },
  description: "Vardhan is a full stack engineer in Cincinnati, Ohio. Five years on enterprise content platforms with Adobe Experience Manager, React, TypeScript, Java Spring Boot, and AWS, plus independent work in WebGL, retrieval systems, and browser tooling.",
  keywords: [
    "Full Stack Engineer",
    "Adobe Experience Manager",
    "AEM",
    "React",
    "TypeScript",
    "Java Spring Boot",
    "Node.js",
    "AWS",
    "Three.js",
    "WebGL",
    "Cincinnati",
    "Vardhan"
  ],
  authors: [{ name: "Vardhan", url: "https://vardhansudo.me" }],
  creator: "Vardhan",
  publisher: "Vardhan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vardhansudo.me'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Vardhan - Full Stack Engineer",
    description: "Enterprise content platforms by day. WebGL, retrieval systems, and browser tooling in my own repos.",
    url: "https://vardhansudo.me",
    siteName: "Vardhan",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vardhan, full stack engineer, Cincinnati Ohio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vardhan - Full Stack Engineer",
    description: "Enterprise content platforms by day. WebGL, retrieval systems, and browser tooling in my own repos.",
    images: ["/og-image.jpg"],
    // creator removed: the @vardhan_dev handle could not be verified.
  },
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
  // No `verification` block. It previously shipped the literal placeholder
  // string 'your-google-verification-code'. Add it back with a real token
  // from Search Console when you have one.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Entry sequence gate. Runs before the body paints so a
                // returning visitor never sees a flash of the overlay, and a
                // first-time visitor never sees a flash of the hero.
                try {
                  var seen = sessionStorage.getItem('entry-seen');
                  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  // Desktop only. On a throttled phone the curtain lands on
                  // top of an already slow first paint, which reads as the
                  // site being broken rather than as a deliberate beat.
                  var small = window.matchMedia('(max-width: 767px)').matches;
                  document.documentElement.dataset.entry =
                    (seen || reduced || small) ? 'seen' : 'first';
                } catch (e) {
                  document.documentElement.dataset.entry = 'seen';
                }
              })();
            `,
          }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#E8E6E1" />
        <meta name="msapplication-TileColor" content="#E8E6E1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <SmoothScrollProvider>
            <EntrySequence />
            <InstrumentRail />
            <StateCursor />
            {/* Skip to main content link for accessibility */}
            <a
              href="#main-content"
              className="u-mono sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-s2 focus:left-s2 focus:bg-signal focus:p-s2 focus:text-bone"
            >
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content">
              <PageTransition>{children}</PageTransition>
            </main>
        </SmoothScrollProvider>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Vardhan",
              "url": "https://vardhansudo.me",
              "jobTitle": "Full Stack Engineer",
              "description": "Full stack engineer in Cincinnati, Ohio. Enterprise content platforms, plus independent work in WebGL and retrieval systems.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Cincinnati",
                "addressRegion": "OH",
                "addressCountry": "US"
              },
              "knowsAbout": ["Adobe Experience Manager", "React", "TypeScript", "Java Spring Boot", "Node.js", "AWS", "Three.js", "WebGL"],
              "sameAs": [
                "https://github.com/grammerpro",
                "https://www.linkedin.com/in/sri-vardhan-7b5853184/",
                "https://leetcode.com/u/sudovardhan/"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
