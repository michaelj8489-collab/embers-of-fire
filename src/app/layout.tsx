import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, Cormorant } from "next/font/google";
import "./globals.css";
import Script from 'next/script'; // Added this import

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
  description: 'The exclusive sanctuary and hub for the Rise Radio community. Join the awareness.',
  openGraph: {
    title: 'Rise Radio Network | Embers of Light Hub',
    description: 'Join the sanctuary. Fuel the journey.',
    url: 'https://embers-of-light-d763.vercel.app',
    siteName: 'Rise Radio Network',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Embers of Light Phoenix Logo',
      },
    ],
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
        {/* This line loads the Stripe engine so your buttons work */}
        <Script 
          src="https://js.stripe.com/v3/" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className={`${cinzelDec.variable} ${cinzel.variable} ${cormorant.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}