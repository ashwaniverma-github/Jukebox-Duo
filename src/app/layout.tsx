import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jukebox Duo",
  description: "Listen Together, No Matter Where You Are",
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
    title: "Jukebox Duo",
    description: "Listen Together, No Matter Where You Are",
    url: "https://jukeboxduo.com",                // <- update to your production URL
    siteName: "Jukebox Duo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jukebox Duo — Listen together"
      }
    ],
    type: "website"
  },

  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "Jukebox Duo",
    description: "Listen Together, No Matter Where You Are",
    images: ["/og-image.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        
      </body>
    </html>
  );
}
