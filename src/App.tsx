import { useCallback, useEffect, useState } from 'react';
import Navbar, { type ActiveTab } from './components/Navbar';
import HeroFader from './components/HeroFader';
import BookingSection from './components/BookingSection';
import AboutSection from './components/AboutSection';
import VipCardSection from './components/VipCardSection';
import StoreSection from './components/StoreSection';
import ReviewsSection from './components/ReviewsSection';
import AdminPanel from './components/AdminPanel';
import CreditsFooter from './components/CreditsFooter';
import type { BookedSlot, BootstrapPayload, Product, Review } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('reservas');
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminPin, setAdminPin] = useState<string | null>(null);

  const loadBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const json = (await res.json()) as BootstrapPayload;
        setData(json);
      }
    } catch {
      // Handled gracefully below
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBooking = () => {
    setActiveTab('reservas');
    window.setTimeout(() => {
      document.getElementById('reservas-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleBookingCreated = (newSlot: BookedSlot) => {
    setData((prev) =>
      prev
        ? { ...prev, bookedSlots: [...prev.bookedSlots, newSlot] }
        : prev
    );
  };

  const handleProductPurchased = (updatedProduct: Product) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            products: prev.products.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            ),
          }
        : prev
    );
  };

  const handleReviewAdded = (review: Review) => {
    setData((prev) =>
      prev
        ? { ...prev, reviews: [review, ...prev.reviews] }
        : prev
    );
  };

  const studioPhoneDisplay = data?.studioPhoneDisplay || '+51 967 887 427';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0A09] text-[#F5F2EC]">
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isAdminAuthed={Boolean(adminPin)}
      />

      <main className="flex-1">
        {activeTab === 'reservas' && (
          <>
            <HeroFader
              onBookNow={scrollToBooking}
              studioPhoneDisplay={studioPhoneDisplay}
            />
            {loading && !data ? (
              <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-[#9E9589]">
                Cargando agenda, barberos y servicios de YUMBA Barber Studio...
              </div>
            ) : data ? (
              <BookingSection
                barbers={data.barbers}
                services={data.services}
                bookedSlots={data.bookedSlots}
                studioPhoneDisplay={studioPhoneDisplay}
                onBookingCreated={handleBookingCreated}
              />
            ) : (
              <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-red-300">
                No se pudo conectar con el servidor de reservas. Recarga la página.
              </div>
            )}
          </>
        )}

        {activeTab === 'nosotros' && (
          <AboutSection studioPhoneDisplay={studioPhoneDisplay} />
        )}

        {activeTab === 'tarjeta' && <VipCardSection />}

        {activeTab === 'tienda' && data && (
          <StoreSection
            products={data.products}
            studioPhoneDisplay={studioPhoneDisplay}
            onProductPurchased={handleProductPurchased}
          />
        )}

        {activeTab === 'resenas' && data && (
          <ReviewsSection
            reviews={data.reviews}
            onReviewAdded={handleReviewAdded}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            adminPin={adminPin}
            onLoginSuccess={(pin) => setAdminPin(pin)}
            onLogout={() => setAdminPin(null)}
            onDataMutated={loadBootstrap}
          />
        )}
      </main>

      <CreditsFooter
        studioPhoneDisplay={studioPhoneDisplay}
        onSelectTab={handleSelectTab}
      />
    </div>
  );
}
