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
    apple: "/icons.svg",
  },
  manifest: "/manifest.json",
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
