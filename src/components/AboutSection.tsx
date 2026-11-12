import { useEffect, useState } from 'react';
import { BookOpen, Clock, MapPin, CreditCard } from 'lucide-react';

const STUDIO_GALLERY = [
  {
    src: '/src/assets/images/hero_studio_interior_1794521555269.jpg',
    title: 'Salón VIP & Sillones Clásicos',
  },
  {
    src: '/src/assets/images/hero_precision_fade_1794521554906.jpg',
    title: 'Técnica & Degradados de Precisión',
  },
  {
    src: '/src/assets/images/hero_beard_ritual_1794521557029.jpg',
    title: 'Ritual de Toalla Caliente & Navaja',
  },
];

interface AboutSectionProps {
  studioPhoneDisplay: string;
}

export default function AboutSection({ studioPhoneDisplay }: AboutSectionProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % STUDIO_GALLERY.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37] uppercase">
          Nuestra Esencia
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-[#F5F2EC] sm:text-4xl text-balance">
          Sobre YUMBA Barber Studio
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#9E9589]">
          Redefiniendo el estilo masculino con elegancia, precisión y un ambiente inigualable.
        </p>
      </div>

      {/* 2x2 Editorial Grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#151311] p-7">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold text-[#D4AF37]">
              Nuestra Historia
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#D6CFC5]">
            Fundado con la visión de llevar la barbería clásica a un nivel moderno y exclusivo. En{' '}
            <strong className="font-semibold text-[#F5F2EC]">YUMBA Barber Studio</strong> cuidamos
            cada detalle: desde el asesoramiento de imagen personalizado hasta los rituales de
            toalla caliente y navaja tradicional.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#151311] p-7">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold text-[#D4AF37]">
              Horarios de Atención
            </h3>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <dt className="text-[#D6CFC5]">Lunes a Viernes</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#D4AF37]">
                10:00 AM - 09:00 PM
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#D6CFC5]">Sábados y Domingos</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#D4AF37]">
                09:00 AM - 10:00 PM
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#151311] p-7">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold text-[#D4AF37]">
              Ubicación y Local
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#D6CFC5]">
            Av. Principal 450, Centro Comercial / Local VIP. Contamos con estacionamiento privado,
            climatización y zona de espera con barra de café y bebidas de cortesía. Atención directa
            al <span className="font-mono tabular-nums text-[#F5F2EC]">{studioPhoneDisplay}</span>.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#151311] p-7">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold text-[#D4AF37]">
              Formas de Pago
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#D6CFC5]">
            Aceptamos todas las tarjetas de débito y crédito (Visa, Mastercard), transferencias
            bancarias y pagos digitales inmediatos mediante{' '}
            <strong className="font-semibold text-[#F5F2EC]">Yape y Plin</strong> al{' '}
            <span className="font-mono tabular-nums text-[#F5F2EC]">{studioPhoneDisplay}</span>,
            además de efectivo en local.
          </p>
        </article>
      </div>

      {/* Crossfading Studio Atmosphere Showcase */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#151311]">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          {STUDIO_GALLERY.map((item, idx) => (
            <img
              key={item.src}
              src={item.src}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out"
              style={{ opacity: idx === galleryIndex ? 1 : 0 }}
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0B0A09]/90 via-[#0B0A09]/25 to-transparent"
          />
          <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#D4AF37]">
                Galería del Estudio
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-[#F5F2EC]">
                {STUDIO_GALLERY[galleryIndex].title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {STUDIO_GALLERY.map((item, idx) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setGalleryIndex(idx)}
                  aria-label={`Mostrar ${item.title}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === galleryIndex ? 'w-7 bg-[#D4AF37]' : 'w-2 bg-white/35'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
