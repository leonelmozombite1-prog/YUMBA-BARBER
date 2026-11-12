import { Code2, Phone, MapPin } from 'lucide-react';
import type { ActiveTab } from './Navbar';

interface CreditsFooterProps {
  studioPhoneDisplay: string;
  onSelectTab: (tab: ActiveTab) => void;
}

export default function CreditsFooter({
  studioPhoneDisplay,
  onSelectTab,
}: CreditsFooterProps) {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#080706]">
      {/* Credits / Author Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#15120E] via-[#12100E] to-[#17130D] p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
                <Code2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-[#D4AF37] uppercase">
                  Créditos de Desarrollo & Arquitectura Web
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#F5F2EC] sm:text-2xl">
                  Diseñado y Programado por ING. Jhojan
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B5AEA4]">
                  Sistema integral de reservas online, gestión de servicios, tarjeta virtual VIP y
                  automatización inmediata de notificaciones WhatsApp vía API de Twilio desarrollado
                  a medida por <strong className="font-semibold text-[#F5F2EC]">ING. Jhojan</strong>.
                </p>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <p className="text-xs text-[#9E9589]">Autoría de Plataforma</p>
              <p className="mt-1 font-display text-lg font-bold tracking-wide text-[#D4AF37]">
                ING. Jhojan
              </p>
              <p className="mt-0.5 text-xs text-[#777066]">
                Ingeniería Web & Automatización
              </p>
            </div>
          </div>
        </div>

        {/* Quiet Editorial Footer */}
        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/logo_barber_f88eecbf.jpeg"
                alt="YUMBA Barber Studio"
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-lg object-cover border border-white/15"
              />
              <span className="font-display text-lg font-bold tracking-wider text-[#F5F2EC]">
                YUMBA BARBER STUDIO
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#9E9589]">
              Barbería de autor, cuidado masculino y rituales clásicos en un ambiente exclusivo.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Navegación
            </h4>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#B5AEA4]">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('reservas')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Reservas Online
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('nosotros')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Sobre Nosotros
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('tarjeta')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Mi Tarjeta VIP
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('tienda')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Tienda Oficial
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('resenas')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Reseñas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('admin')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Panel Admin
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Contacto del Estudio
            </h4>
            <div className="mt-3 space-y-2 text-xs text-[#B5AEA4]">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                <span className="font-mono tabular-nums">{studioPhoneDisplay}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                <span>Av. Principal 450, Centro Comercial · Local VIP</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#777066]">
          <p>© {new Date().getFullYear()} YUMBA Barber Studio. Todos los derechos reservados.</p>
          <p>Desarrollado por ING. Jhojan</p>
        </div>
      </div>
    </footer>
  );
}
