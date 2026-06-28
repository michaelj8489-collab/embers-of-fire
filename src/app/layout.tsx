import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, Cormorant } from "next/font/google";
import "./globals.css";
import Script from 'next/script'; 

const cinzelDec = Cinzel_Decorative({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: "--font-cinzel-dec",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: 'Rise Radio Network | Embers of Light Hub',
  manifest: '/manifest.json', 
  description: 'The exclusive sanctuary and hub for the Rise Radio community. Join the awareness.',
  openGraph: {
    title: 'Rise Radio Network | Embers of Light Hub',
    description: 'Join the sanctuary. Fuel the journey.',
    siteName: 'Rise Radio Network',
    locale: 'en_US',
    type: 'website',
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
        <Script 
          src="https://js.stripe.com/v3/" 
          strategy="lazyOnload" 
        />
        <link rel="preconnect" href="https://zeno.fm" />
        <link rel="preconnect" href="https://zenoimages.s3.us-west-001.backblazeb2.com" />
      </head>
      <body className={`${cinzelDec.variable} ${cinzel.variable} ${cormorant.variable} antialiased bg-black text-white`}>
        {children}
        {/* Notice BottomNav is COMPLETELY gone from here! */}
      </body>
    </html>
  );
}