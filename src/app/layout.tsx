import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import InteractiveCursor from "@/components/InteractiveCursor";
import ThemeProvider from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";
import AssistantWidget from "@/react/AssistantWidget";
import ScrollToTopRocket from "@/components/ScrollToTopRocket";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vardhan - Creative Developer | 3D Web Experiences & AI Integration",
  description: "Creative developer crafting sleek web experiences with AI, 3D & creativity. Specializing in Next.js, Three.js, React, and modern web technologies.",
  keywords: [
    "creative developer",
    "web developer",
    "frontend developer",
    "3D web development",
    "Three.js",
    "Next.js",
    "React",
    "AI integration",
    "portfolio",
    "Vardhan"
  ],
  authors: [{ name: "Vardhan", url: "https://vardhan-portfolio.com" }],
  creator: "Vardhan",
  publisher: "Vardhan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vardhan-portfolio.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Vardhan - Creative Developer | 3D Web Experiences",
    description: "Creative developer crafting sleek web experiences with AI, 3D & creativity. Explore my portfolio of innovative web projects.",
  url: "https://vardhan-portfolio.com",
    siteName: "Vardhan Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vardhan - Creative Developer Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vardhan - Creative Developer | 3D Web Experiences",
    description: "Creative developer crafting sleek web experiences with AI, 3D & creativity.",
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
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'auto';
                const resolved = theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
                if (resolved === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
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
          <Navbar />
          <InteractiveCursor />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <AssistantWidget
            theme="auto"
            kbUrl="/src/assistant-widget/kb-user.json"
            avatarUrl="/assets/avatar.svg"
            agentName="Vardhan"
            enableVoice={false}
            showButton={true}
          />
          <ScrollToTopRocket />
        </ThemeProvider>
      </body>
    </html>
  );
}
