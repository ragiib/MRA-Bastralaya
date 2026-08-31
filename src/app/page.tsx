import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import StoreIntro from '@/components/home/StoreIntro';
import TrustSection from '@/components/home/TrustSection';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickViewModal from '@/components/ui/QuickViewModal';
import ToastNotification from '@/components/ui/ToastNotification';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      {/* Top Header & Announcement Bar Navigation */}
      <Header />

      {/* Main Homepage Flow */}
      <div className="flex-1">
        {/* 1. Hero Section: Complete Store Representation */}
        <HeroSection />

        {/* 2. Three Main Departments: Sarees, Ladies Suits, Bed Sheets */}
        <CategorySection />

        {/* 3. Short Brand/Store Introduction */}
        <StoreIntro />

        {/* 4. Trust/Service Section Using Only Verified Information */}
        <TrustSection />
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

