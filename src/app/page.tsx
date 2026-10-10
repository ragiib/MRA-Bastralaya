import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import CartDrawer from '@/components/ui/CartDrawer';
import ToastNotification from '@/components/ui/ToastNotification';
import FestiveHomepageBanner from '@/components/festival/FestiveHomepageBanner';
import PujaSpecialSection from '@/components/festival/PujaSpecialSection';
import FestiveOverlayClientWrapper from '@/components/festival/FestiveOverlayClientWrapper';
import { ProductRepository } from '@/lib/repositories/product.repository';
import { isFestivalActive } from '@/config/festival';
import { ProductItem } from '@/types/product';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch up to 8 active products with sale prices for the optional Puja Special row
  let pujaSpecialProducts: ProductItem[] = [];
  if (isFestivalActive()) {
    try {
      const allActive = await ProductRepository.getCustomerProducts();
      pujaSpecialProducts = allActive
        .filter((p) => p.salePrice && p.salePrice < p.price)
        .slice(0, 8);
    } catch {
      pujaSpecialProducts = [];
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      {/* Top Header & Announcement Bar Navigation */}
      <Header />

      {/* Festive Launch Banner (Mounted above Hero without removing or altering Hero) */}
      <FestiveHomepageBanner />

      {/* Main Homepage Flow: Clear Navigation & Departments */}
      <div className="flex-1">
        <HeroSection />
        {pujaSpecialProducts.length > 0 && (
          <PujaSpecialSection products={pujaSpecialProducts} />
        )}
        <CategorySection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Interactive Global UI Drawers & Modals */}
      <CartDrawer />
      <ToastNotification />

      {/* Opening Greeting Overlay (SSR false via client wrapper, loads only after page interactive) */}
      <FestiveOverlayClientWrapper />
    </main>
  );
}
