import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { safeJsonLd } from '@/lib/safe-json-ld';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jukeboxduo.com'),
  title: "Jukebox Duo - Listen to Music Together with Friends Online",
  description: "Listen to music with friends online in real-time. Free music listening rooms with synchronized playback — no downloads, no ads. The best Spotify Jam alternative for couples, study groups & friend groups.",
  keywords: ["listen to music together", "listen with friends online", "music listening room", "spotify jam alternative", "listen together app", "collaborative playlists", "synchronized music playback", "playlist name generator", "music sharing app"],
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

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: "/icons.svg",
  },
  manifest: "/manifest.json",

  // Open Graph (social preview)
  openGraph: {
    title: "Jukebox Duo - Listen to Music Together with Friends Online",
    description: "Listen to music with friends online in real-time. Free music listening rooms — no downloads, no ads. The best Spotify Jam alternative.",
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
    title: "Jukebox Duo - Listen to Music Together with Friends Online",
    description: "Listen to music with friends online in real-time. Free music listening rooms — no downloads, no ads. The best Spotify Jam alternative.",
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
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Jukebox Duo",
              "description": "Listen to music with friends online in real-time. Free music listening rooms with synchronized playback. The best Spotify Jam alternative for couples and groups.",
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
                "Listen to music together with friends online",
                "Real-time synchronized playback",
                "Free Spotify Jam alternative",
                "Virtual music listening rooms",
                "Collaborative playlist creation",
                "No downloads required — works in browser",
                "Ad-free music experience",
                "Playlist name generator tool"
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
          {/* Feedinbox widget */}
          <script async src="https://www.feedinbox.com/widget.js" data-project-key="cmj3omf3600035qx2fnqkgkot"></script>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}