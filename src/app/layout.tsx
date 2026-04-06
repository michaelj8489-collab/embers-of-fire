import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, Cormorant } from "next/font/google";
import "./globals.css";

const cinzelDec = Cinzel_Decorative({
  weight: ['400', '700', '900'],
  subsets: ["latin"],
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
  title: "Embers of Light Hub",
  description: "The exclusive sanctuary for the Rise Radio Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzelDec.variable} ${cinzel.variable} ${cormorant.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}