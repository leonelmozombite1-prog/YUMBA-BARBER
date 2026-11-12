import { useEffect, useState } from 'react';
import { Search, Crown, AlertCircle } from 'lucide-react';
import type { VipCard } from '../types';

export default function VipCardSection() {
  const [phoneInput, setPhoneInput] = useState('987654321');
  const [card, setCard] = useState<VipCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupCard = async (targetPhone: string) => {
    const clean = targetPhone.replace(/\D/g, '');
    if (clean.length < 6) {
      setError('Ingresa un número de teléfono válido (mínimo 6 dígitos).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vip/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) {
        setCard(null);
        setError(data.error || 'No se encontró tarjeta para este número.');
      } else {
        setCard(data.card as VipCard);
      }
    } catch {
      setError('Error al consultar tu tarjeta VIP.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lookupCard('987654321');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupCard(phoneInput);
  };

  const stamps = card?.stamps ?? 0;
  const remainingForDiscount = Math.max(0, 4 - stamps);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37] uppercase">
          Programa VIP YUMBA
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-[#F5F2EC] sm:text-4xl text-balance">
          Tarjeta Virtual de Sellos
        </h2>
        <p className="mt-3 text-sm text-[#9E9589]">
          Por cada visita ganas 1 sello. Al acumular 4 sellos, obtienes un{' '}
          <strong className="font-semibold text-[#D4AF37]">50% de descuento</strong> en tu 5.º corte.
        </p>
      </div>

      {/* Phone Lookup Bar */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-white/10 bg-[#151311] p-5 sm:p-6"
      >
        <label
          htmlFor="vipPhoneSearch"
          className="block text-xs font-medium text-[#D6CFC5] mb-2.5"
        >
          Ingresa tu número de teléfono para ver tu tarjeta
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="vipPhoneSearch"
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Ej: 987654321"
            className="flex-1 rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm font-mono tabular-nums text-[#F5F2EC] placeholder-[#6B645B] focus:border-[#D4AF37] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0B0A09] transition-colors hover:bg-[#E5C14B] whitespace-nowrap shrink-0"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>{loading ? 'Consultando...' : 'Consultar'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3.5 text-sm text-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Virtual Loyalty Card */}
      {card && (
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#181410] via-[#0E0C0A] to-[#1A140B] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
                Membresía Legend
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold text-[#F5F2EC]">
                {card.clientName}
              </h3>
              <p className="mt-1 font-mono tabular-nums text-xs text-[#9E9589]">
                TEL: {card.phone}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
              <Crown className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          {/* 5 Stamp Slots */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((slot) => {
              const earned = stamps >= slot;
              const isRewardSlot = slot === 5;
              return (
                <div
                  key={slot}
                  className={`flex h-28 flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors ${
                    earned
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15'
                      : 'border-white/10 bg-[#0B0A09]/80'
                  }`}
                >
                  {earned ? (
                    <>
                      <img
                        src="/assets/aistudio/logo_barber_f88eecbf.jpeg"
                        alt={`Sello ${slot} ganado`}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-full object-cover border border-[#D4AF37]"
                      />
                      <span className="mt-2 font-mono text-[11px] font-semibold tracking-wider text-[#D4AF37] uppercase">
                        Sello #{slot}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono tabular-nums text-lg font-bold text-[#5E574E]">
                        {slot}
                      </span>
                      {isRewardSlot && (
                        <span className="mt-1 text-[11px] font-semibold text-[#D4AF37]">
                          50% Dcto
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm">
            <p className="text-[#D6CFC5]">
              Sellos Acumulados:{' '}
              <span className="font-mono tabular-nums font-bold text-[#D4AF37]">
                {stamps} / 5
              </span>
            </p>
            <p className="text-xs font-medium text-[#B5AEA4]">
              {stamps >= 4
                ? '¡Beneficio activo! Obtén 50% de descuento en tu próxima cita.'
                : `Te faltan ${remainingForDiscount} corte(s) para desbloquear tu 50% de descuento`}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
