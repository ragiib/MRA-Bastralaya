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

export const metadata: Metadata = {
  title: 'MRA Bastralaya | Authentic Handloom & Pure Silk Sarees',
  description: 'Discover handcrafted Indian sarees, Kanjeevaram pure silk, Banarasi brocade, Paithani, and bridal sarees at MRA Bastralaya. Authentic heritage fashion since 1980.',
  keywords: ['MRA Bastralaya', 'Saree Shop', 'Pure Silk Saree', 'Kanjeevaram Saree', 'Banarasi Silk', 'Indian Handloom Saree', 'Bridal Saree'],
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
