import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import HeritageBanner from '@/components/home/HeritageBanner';
import WhyUs from '@/components/home/WhyUs';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickViewModal from '@/components/ui/QuickViewModal';
import ToastNotification from '@/components/ui/ToastNotification';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      {/* Top Header & Navigation */}
      <Header />

      {/* Main Homepage Flow */}
      <div className="flex-1">
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <HeritageBanner />
        <WhyUs />
        <TestimonialsSection />
        <NewsletterSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Interactive Global UI Drawers & Modals */}
      <CartDrawer />
      <QuickViewModal />
      <ToastNotification />
    </main>
  );
}
