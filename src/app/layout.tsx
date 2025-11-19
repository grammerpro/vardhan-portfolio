import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import InteractiveCursor from "@/components/InteractiveCursor";
import ThemeProvider from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";
import AssistantWidget from "@/react/AssistantWidget";
import ScrollToTopRocket from "@/components/ScrollToTopRocket";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: {
    default: "Vardhan - Creative Developer | WebGL & AI Design",
    template: "%s | Vardhan"
  },
  description: "Portfolio of Vardhan - Frontend engineer specializing in immersive 3D web experiences, AI-assisted workflows, and polished product launches. Expert in WebGL, Three.js, React, and Next.js.",
  keywords: [
    "WebGL",
    "Three.js",
    "Frontend Developer",
    "React",
    "Next.js",
    "creative developer",
    "3D web development",
    "AI integration",
    "immersive web experiences",
    "portfolio",
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
    title: "Vardhan - Creative Developer | WebGL & AI Design",
    description: "Designing immersive web moments with purpose. Frontend engineer specializing in 3D web experiences, AI workflows, and modern web technologies.",
    url: "https://vardhansudo.me",
    siteName: "Vardhan Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vardhan - Creative Developer Portfolio showcasing WebGL and Three.js projects",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vardhan - Creative Developer | WebGL & AI Design",
    description: "Designing immersive web moments with purpose. Specializing in WebGL, Three.js, and modern web experiences.",
    images: ["/og-image.jpg"],
    creator: "@vardhan_dev",
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'auto';
                  const resolved = theme === 'auto' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
                    : theme;
                  if (resolved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
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
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          {/* Skip to main content link for accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:p-4 focus:bg-purple-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:bg-fuchsia-600 dark:focus:ring-fuchsia-400"
          >
            Skip to main content
          </a>
          <Navbar />
          <InteractiveCursor />
          <main id="main-content">
            <PageTransition>{children}</PageTransition>
          </main>
          <AssistantWidget
            theme="auto"
            kbUrl="/data/resume.json"
            avatarUrl="/assets/avatar.svg"
            agentName="Vardhan"
            enableVoice={true}
            showButton={true}
          />
          <ScrollToTopRocket />
        </ThemeProvider>
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Vardhan",
              "url": "https://vardhansudo.me",
              "jobTitle": "Creative Developer",
              "description": "Frontend engineer specializing in immersive 3D web experiences and AI-assisted workflows",
              "knowsAbout": ["WebGL", "Three.js", "React", "Next.js", "AI Design", "Frontend Development"],
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
