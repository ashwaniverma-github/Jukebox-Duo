import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jukebox Duo - Listen Together, No Matter Where You Are",
  description: "Create synchronized music listening rooms with friends. Share YouTube music, create playlists, and enjoy music together in real-time. Perfect for long-distance relationships, virtual hangouts, and shared music experiences.",
  keywords: ["music sharing", "synchronized music", "YouTube music", "virtual hangouts", "music rooms", "collaborative playlists", "real-time music", "social music app"],
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
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE", // Add your Google Search Console verification code
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
    creator: "@jukeboxduo", // Add your Twitter handle if you have one
  },

  // Additional metadata for better SEO
  category: "music",
  classification: "music sharing application",
  other: {
    "theme-color": "#000000",
    "color-scheme": "dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
        
      </body>
    </html>
  );
}
