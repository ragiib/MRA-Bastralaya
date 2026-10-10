import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ShopProvider } from '@/context/ShopContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
  : 'https://mrabastralaya.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MRA Bastralaya',
    template: '%s | MRA Bastralaya',
  },
  description: 'Shop authentic sarees, elegant ladies suits, and premium bed sheets at MRA Bastralaya.',
  keywords: ['MRA Bastralaya', 'Sarees', 'Ladies Suits', 'Bed Sheets', 'Silk Sarees', 'Handloom Sarees', 'Cotton Bed Sheets'],
  openGraph: {
    title: {
      default: 'MRA Bastralaya',
      template: '%s | MRA Bastralaya',
    },
    description: 'Shop authentic sarees, elegant ladies suits, and premium bed sheets at MRA Bastralaya.',
    url: siteUrl,
    siteName: 'MRA Bastralaya',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'MRA Bastralaya',
      template: '%s | MRA Bastralaya',
    },
    description: 'Shop authentic sarees, elegant ladies suits, and premium bed sheets at MRA Bastralaya.',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="bg-[#FAF7F2] text-[#1A1315] antialiased selection:bg-[#D4AF37]/30 selection:text-[#6B0D2F]">
        <ShopProvider>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
