import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowDownRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  caption: string;
  location: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'interior',
    src: '/src/assets/images/hero_studio_interior_1794521555269.jpg',
    alt: 'Interior del salón YUMBA Barber Studio con sillones de cuero clásico e iluminación cálida',
    caption: 'Sillones clásicos, madera nogal y atención de autor en cada estación',
    location: 'Salón Principal · YUMBA Barber Studio',
  },
  {
    id: 'fade',
    src: '/src/assets/images/hero_precision_fade_1794521554906.jpg',
    alt: 'Maestro barbero realizando un degradado skin fade de alta precisión',
    caption: 'Degradados limpios y asesoría facial adaptada a tu estilo',
    location: 'Especialidad · Urban & Skin Fade',
  },
  {
    id: 'beard',
    src: '/src/assets/images/hero_beard_ritual_1794521557029.jpg',
    alt: 'Ritual tradicional de barba con toalla caliente y navaja',
    caption: 'Ritual de toalla caliente, aceites esenciales y perfilado a navaja',
    location: 'Ritual Clásico · Cuidado de Barba',
  },
];

interface HeroFaderProps {
  onBookNow: () => void;
  studioPhoneDisplay: string;
}

export default function HeroFader({ onBookNow, studioPhoneDisplay }: HeroFaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedSlides, setFailedSlides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const activeSlide = HERO_SLIDES[currentIndex];

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#0B0A09]">
      {/* Crossfading background layers */}
      <div className="relative min-h-[500px] lg:min-h-[580px] w-full flex items-end">
        {HERO_SLIDES.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          const isFailed = Boolean(failedSlides[slide.id]);

          return (
            <div
              key={slide.id}
              aria-hidden={!isCurrent}
              className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
              style={{ opacity: isCurrent ? 1 : 0, zIndex: isCurrent ? 1 : 0 }}
            >
              {!isFailed ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedSlides((prev) => ({ ...prev, [slide.id]: true }))
                  }
                  className="h-full w-full object-cover object-center transition-transform duration-[6000ms] ease-out"
                  style={{
                    transform: isCurrent ? 'scale(1.06)' : 'scale(1.0)',
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#1C1814] via-[#12100E] to-[#0B0A09]" />
              )}
            </div>
          );
        })}

        {/* Measured Scrim for WCAG AA Legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0A09] via-[#0B0A09]/68 to-[#0B0A09]/35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-gradient-to-r from-[#0B0A09]/90 via-[#0B0A09]/45 to-transparent"
        />

        {/* Foreground Content */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="mb-4 text-xs font-medium tracking-[0.22em] text-[#D4AF37] uppercase">
                YUMBA Barber Studio · {activeSlide.location}
              </p>

              <h1
                className="font-display font-bold tracking-tight text-[#F5F2EC] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.75rem)', lineHeight: 1.08 }}
              >
                Precisión, estilo y ritual clásico en cada corte
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#D6CFC5] sm:text-lg">
                {activeSlide.caption}. Reserva tu cita en línea en segundos, acumula sellos en tu
                tarjeta VIP y recibe confirmación inmediata con nuestro equipo.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={onBookNow}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-[#0B0A09] transition-colors duration-200 hover:bg-[#E5C14B] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0A09]"
                >
                  <span>Reservar Cita VIP</span>
                  <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-3 text-xs text-[#B5AEA4]">
                  <span>WhatsApp directo</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-[#F5F2EC]">
                    {studioPhoneDisplay}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle Crossfade Controls */}
            <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-4">
              <div className="flex items-center gap-2" role="tablist" aria-label="Galería principal">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === currentIndex}
                    aria-label={`Ver imagen ${idx + 1}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-8 bg-[#D4AF37]'
                        : 'w-2.5 bg-white/30 hover:bg-white/55'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#151311]/80 text-[#F5F2EC] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Siguiente imagen"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#151311]/80 text-[#F5F2EC] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
