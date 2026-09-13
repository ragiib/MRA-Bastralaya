import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickViewModal from '@/components/ui/QuickViewModal';
import ToastNotification from '@/components/ui/ToastNotification';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      {/* Top Header & Announcement Bar Navigation */}
      <Header />

      {/* Main Homepage Flow: Clear Navigation & Departments */}
      <div className="flex-1">
        <HeroSection />
        <CategorySection />
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

