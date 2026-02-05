import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import MaintenanceBanner from "@/components/MaintenanceBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jukebox Duo - Listen Together, No Matter Where You Are",
  description: "Create synchronized music listening rooms directly in your browser. Optimized for the best experience on desktop and browser. Share YouTube music in perfect sync with friends, no extensions required.",
  keywords: ["music sharing", "synchronized music", "YouTube music", "browser music party", "desktop music sync", "collaborative playlists", "real-time music"],
  authors: [{ name: "Jukebox Duo Team" }],
  creator: "Jukebox Duo",
  publisher: "Jukebox Duo",
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
    canonical: "https://jukeboxduo.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",

  // Open Graph (social preview)
  openGraph: {
    title: "Jukebox Duo - Listen Together, No Matter Where You Are",
    description: "Create synchronized music listening rooms with friends. Share YouTube music, create playlists, and enjoy music together in real-time.",
    url: "https://jukeboxduo.com",
    siteName: "Jukebox Duo",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jukebox Duo — Listen together with friends in real-time",
        type: "image/png",
      }
    ],
  },

  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "Jukebox Duo - Listen Together, No Matter Where You Are",
    description: "Create synchronized music listening rooms with friends. Share YouTube music, create playlists, and enjoy music together in real-time.",
    images: ["/og-image.png"],
    creator: "@ashwanivermax", // Add your Twitter handle if you have one
  },

  // Additional metadata for better SEO
  category: "music",
  classification: "music sharing application",
  other: {
    "color-scheme": "dark",
  },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-6660595040751061" />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4JB3MF5MXZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4JB3MF5MXZ');
          `}
        </Script>

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Jukebox Duo",
              "description": "Create synchronized music listening rooms with friends. Share YouTube music, create playlists, and enjoy music together in real-time.",
              "url": "https://jukeboxduo.com",
              "applicationCategory": "MusicApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Jukebox Duo Team"
              },
              "featureList": [
                "Synchronized music listening",
                "YouTube music sharing",
                "Real-time collaboration",
                "Virtual music rooms",
                "Playlist creation",
                "Cross-platform compatibility"
              ],
              "screenshot": "https://jukeboxduo.com/og-image.png",
              "softwareVersion": "1.0.0"
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          <MaintenanceBanner />
          {children}
          <Script id="feedinbox-config" strategy="afterInteractive">
            {`
            window.feedinboxConfig = {
              projectKey: "cmj3omf3600035qx2fnqkgkot"
            };
          `}
          </Script>

          {/* 2. Widget Script */}
          <Script
            src="https://www.feedinbox.com/widget.js"
            strategy="lazyOnload"
          />


        </Providers>
        <Analytics />
      </body>
    </html>
  );
}