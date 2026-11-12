import { useState } from 'react';
import { Menu, X, Lock } from 'lucide-react';

export type ActiveTab = 'reservas' | 'nosotros' | 'tarjeta' | 'tienda' | 'resenas' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isAdminAuthed: boolean;
}

const NAV_ITEMS: { id: Exclude<ActiveTab, 'admin'>; label: string }[] = [
  { id: 'reservas', label: 'Reservas' },
  { id: 'nosotros', label: 'Sobre Nosotros' },
  { id: 'tarjeta', label: 'Mi Tarjeta' },
  { id: 'tienda', label: 'Tienda' },
  { id: 'resenas', label: 'Reseñas' },
];

export default function Navbar({ activeTab, onSelectTab, isAdminAuthed }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0A09]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand */}
        <button
          type="button"
          onClick={() => handleNavClick('reservas')}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md"
        >
          <img
            src="/assets/aistudio/logo_barber_f88eecbf.jpeg"
            alt="YUMBA Barber Studio Logo"
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-md object-cover border border-white/15"
          />
          <span className="font-display text-lg font-bold tracking-wider text-[#F5F2EC] whitespace-nowrap shrink-0">
            YUMBA
          </span>
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded ${
                  isActive
                    ? 'text-[#D4AF37]'
                    : 'text-[#B5AEA4] hover:text-[#F5F2EC]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-[#D4AF37]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('admin')}
            className={`hidden md:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
              activeTab === 'admin' || isAdminAuthed
                ? 'bg-[#D4AF37] text-[#0B0A09] hover:bg-[#E2BE48]'
                : 'border border-white/15 bg-[#151311] text-[#F5F2EC] hover:border-[#D4AF37]/60 hover:text-[#D4AF37]'
            }`}
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isAdminAuthed ? 'Panel Admin' : 'Admin'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-[#151311] text-[#F5F2EC]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#12100E] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                      : 'text-[#D6CFC5] hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#0B0A09]"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>{isAdminAuthed ? 'Panel Admin' : 'Acceso Admin'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
