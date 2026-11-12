import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Scissors,
  Check,
  Calendar,
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  MessageCircle,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import type {
  Appointment,
  Barber,
  BookedSlot,
  PaymentMethod,
  Service,
  VipCard,
} from '../types';

const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:30 PM',
  '03:30 PM',
  '04:30 PM',
  '05:30 PM',
  '06:30 PM',
  '07:30 PM',
  '08:30 PM',
];

interface BookingSectionProps {
  barbers: Barber[];
  services: Service[];
  bookedSlots: BookedSlot[];
  studioPhoneDisplay: string;
  onBookingCreated: (newSlot: BookedSlot) => void;
}

interface BookingConfirmation {
  appointment: Appointment;
  twilioResult: {
    status: 'sent' | 'pending_credentials' | 'error';
    sid?: string;
    detail: string;
  };
  vipCard: VipCard;
  whatsappFallbackUrl: string;
}

export default function BookingSection({
  barbers,
  services,
  bookedSlots,
  studioPhoneDisplay,
  onBookingCreated,
}: BookingSectionProps) {
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0]?.id || 'jhojan');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState(todayIso);
  const [time, setTime] = useState('10:00 AM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('YAPE_PLIN');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [failedBarberImages, setFailedBarberImages] = useState<Record<string, boolean>>({});

  // VIP Card auto-lookup when user types phone
  const [eligibleVipCard, setEligibleVipCard] = useState<VipCard | null>(null);
  const [applyVipDiscount, setApplyVipDiscount] = useState(false);

  useEffect(() => {
    if (!selectedBarberId && barbers.length > 0) {
      setSelectedBarberId(barbers[0].id);
    }
  }, [barbers, selectedBarberId]);

  useEffect(() => {
    const clean = clientPhone.replace(/\D/g, '');
    if (clean.length < 7) {
      setEligibleVipCard(null);
      setApplyVipDiscount(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/vip/${encodeURIComponent(clean)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { card: VipCard };
          setEligibleVipCard(data.card);
        } else {
          setEligibleVipCard(null);
          setApplyVipDiscount(false);
        }
      } catch {
        // Ignore abort errors
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [clientPhone]);

  const selectedBarber = useMemo(
    () => barbers.find((b) => b.id === selectedBarberId) || barbers[0],
    [barbers, selectedBarberId]
  );

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );

  const subtotal = useMemo(
    () => selectedServices.reduce((acc, s) => acc + s.price, 0),
    [selectedServices]
  );

  const canUseVipDiscount = Boolean(eligibleVipCard && eligibleVipCard.stamps >= 4);
  const discountAmount = applyVipDiscount && canUseVipDiscount ? subtotal * 0.5 : 0;
  const total = Math.max(0, subtotal - discountAmount);

  // Generate real scannable QR code for Yape/Plin
  useEffect(() => {
    const qrPayload = `YAPE/PLIN YUMBA BARBER STUDIO | TEL: +51967887427 | MONTO: S/${total.toFixed(2)}`;
    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0B0A09',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [total]);

  const isSlotTaken = (slotTime: string) =>
    bookedSlots.some(
      (b) => b.barberId === selectedBarberId && b.date === date && b.time === slotTime
    );

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (clientPhone.replace(/\D/g, '').length < 6) {
      setErrorMsg('Ingresa un número de teléfono o WhatsApp válido.');
      return;
    }
    if (selectedServiceIds.length === 0) {
      setErrorMsg('Selecciona al menos un servicio para reservar.');
      return;
    }
    if (isSlotTaken(time)) {
      setErrorMsg(`El horario ${time} ya está ocupado con ${selectedBarber?.name}. Elige otro horario.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          barberId: selectedBarberId,
          serviceIds: selectedServiceIds,
          date,
          time,
          paymentMethod,
          redeemVipDiscount: applyVipDiscount && canUseVipDiscount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'No se pudo completar la reserva.');
        return;
      }

      setConfirmation(data as BookingConfirmation);
      onBookingCreated({ barberId: selectedBarberId, date, time });
      setSelectedServiceIds([]);
      setApplyVipDiscount(false);
    } catch {
      setErrorMsg('Error de red al registrar tu reserva. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reservas-panel" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Booking Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#151311] p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <Scissors className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl font-bold text-[#F5F2EC]">
                Reserva tu Cita VIP
              </h2>
              <p className="mt-1 text-sm text-[#9E9589]">
                Elige tus servicios, barbero preferido y horario de atención.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Client Name & Phone */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="clientName"
                className="block text-xs font-medium text-[#D6CFC5] mb-2"
              >
                Nombre Completo *
              </label>
              <input
                id="clientName"
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Jhojan Pérez"
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm text-[#F5F2EC] placeholder-[#6B645B] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="clientPhone"
                className="block text-xs font-medium text-[#D6CFC5] mb-2"
              >
                Teléfono / WhatsApp *
              </label>
              <input
                id="clientPhone"
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej: 987 654 321"
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm font-mono tabular-nums text-[#F5F2EC] placeholder-[#6B645B] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* VIP Loyalty Detection Banner */}
          {eligibleVipCard && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3">
              <div className="flex items-center gap-2.5 text-xs text-[#F5F2EC]">
                <Sparkles className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>
                  Tarjeta VIP detectada ({eligibleVipCard.stamps}/5 sellos).{' '}
                  {canUseVipDiscount
                    ? '¡Tienes disponible tu 50% de descuento!'
                    : `Te faltan ${Math.max(1, 4 - eligibleVipCard.stamps)} visita(s) para el 50% de descuento.`}
                </span>
              </div>
              {canUseVipDiscount && (
                <button
                  type="button"
                  onClick={() => setApplyVipDiscount((prev) => !prev)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    applyVipDiscount
                      ? 'bg-[#D4AF37] text-[#0B0A09]'
                      : 'border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/15'
                  }`}
                >
                  {applyVipDiscount ? '50% Dcto Aplicado' : 'Aplicar 50% Dcto'}
                </button>
              )}
            </div>
          )}

          {/* Barber Selection */}
          <div className="mt-7">
            <span className="block text-xs font-medium text-[#D6CFC5] mb-3">
              Selecciona tu Barbero
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {barbers.map((barber) => {
                const isSelected = barber.id === selectedBarberId;
                const imgFailed = Boolean(failedBarberImages[barber.id]);
                return (
                  <button
                    key={barber.id}
                    type="button"
                    onClick={() => setSelectedBarberId(barber.id)}
                    className={`group flex flex-col items-center rounded-xl border p-4 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#1D1914]'
                        : 'border-white/10 bg-[#0F0E0C] hover:border-white/25'
                    }`}
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-[#1B1815]">
                      {!imgFailed ? (
                        <img
                          src={barber.image}
                          alt={`${barber.name} - ${barber.role}`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedBarberImages((prev) => ({ ...prev, [barber.id]: true }))
                          }
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-[#D4AF37]">
                          {barber.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="mt-3 text-sm font-semibold text-[#F5F2EC]">
                      {barber.name}
                    </span>
                    <span className="mt-0.5 text-xs text-[#9E9589]">
                      {barber.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Services */}
          <div className="mt-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#D6CFC5]">
                Servicios Disponibles
              </span>
              <span className="text-xs text-[#9E9589]">
                Selección múltiple permitida
              </span>
            </div>

            <div className="max-h-80 space-y-2.5 overflow-y-auto pr-1">
              {services.map((service) => {
                const checked = selectedServiceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    aria-pressed={checked}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                      checked
                        ? 'border-[#D4AF37] bg-[#1D1914]'
                        : 'border-white/10 bg-[#0B0A09] hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          checked
                            ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0B0A09]'
                            : 'border-white/25 bg-transparent'
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#F5F2EC]">
                          {service.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#9E9589]">
                          {service.description} · {service.durationMinutes} min
                        </p>
                      </div>
                    </div>

                    <span className="font-mono tabular-nums text-sm font-semibold text-[#D4AF37] whitespace-nowrap shrink-0">
                      S/ {service.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="bookingDate"
                className="flex items-center gap-2 text-xs font-medium text-[#D6CFC5] mb-2"
              >
                <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                <span>Fecha de Atención</span>
              </label>
              <input
                id="bookingDate"
                type="date"
                min={todayIso}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm font-mono tabular-nums text-[#F5F2EC] focus:border-[#D4AF37] focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div>
              <label
                htmlFor="bookingTime"
                className="flex items-center gap-2 text-xs font-medium text-[#D6CFC5] mb-2"
              >
                <Clock className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                <span>Hora Disponible</span>
              </label>
              <select
                id="bookingTime"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm font-mono tabular-nums text-[#F5F2EC] focus:border-[#D4AF37] focus:outline-none"
              >
                {TIME_SLOTS.map((slot) => {
                  const taken = isSlotTaken(slot);
                  return (
                    <option key={slot} value={slot} disabled={taken}>
                      {slot} {taken ? '(Reservado)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </form>

        {/* Right Column: Live Summary & Payment */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl border border-white/10 bg-[#151311] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-display text-xl font-bold text-[#D4AF37]">
              Resumen de Cita
            </h3>
            <span className="text-xs text-[#9E9589]">Confirmación inmediata</span>
          </div>

          <dl className="mt-5 space-y-3 text-sm border-b border-white/10 pb-5">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#9E9589]">Barbero</dt>
              <dd className="font-medium text-[#F5F2EC]">
                {selectedBarber?.name || 'Por asignar'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#9E9589]">Fecha / Hora</dt>
              <dd className="font-mono tabular-nums text-[#F5F2EC]">
                {date} ({time})
              </dd>
            </div>
            <div>
              <dt className="text-[#9E9589] mb-1.5">Servicios seleccionados</dt>
              {selectedServices.length === 0 ? (
                <dd className="text-xs italic text-[#777066]">
                  Ningún servicio elegido aún
                </dd>
              ) : (
                <dd className="space-y-1.5">
                  {selectedServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="flex items-center justify-between text-xs text-[#D6CFC5]"
                    >
                      <span>{srv.name}</span>
                      <span className="font-mono tabular-nums text-[#F5F2EC]">
                        S/ {srv.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </dd>
              )}
            </div>
          </dl>

          {discountAmount > 0 && (
            <div className="mt-4 flex items-center justify-between text-xs text-emerald-400">
              <span>Descuento Tarjeta VIP (50%)</span>
              <span className="font-mono tabular-nums">- S/ {discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#D6CFC5]">Total a Pagar</span>
            <span className="font-mono tabular-nums text-3xl font-bold text-[#D4AF37]">
              S/ {total.toFixed(2)}
            </span>
          </div>

          {/* Payment Methods */}
          <div className="mt-6">
            <span className="block text-xs font-medium text-[#D6CFC5] mb-3">
              Método de Pago
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('YAPE_PLIN')}
                className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors ${
                  paymentMethod === 'YAPE_PLIN'
                    ? 'border-[#D4AF37] bg-[#1D1914] text-[#F5F2EC]'
                    : 'border-white/10 bg-[#0B0A09] text-[#9E9589] hover:border-white/25'
                }`}
              >
                <Smartphone className="h-4 w-4 text-[#C084FC] mb-1" aria-hidden="true" />
                <span className="text-xs font-semibold">Yape / Plin</span>
                <span className="text-[11px] text-[#9E9589]">Código QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TARJETA')}
                className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors ${
                  paymentMethod === 'TARJETA'
                    ? 'border-[#D4AF37] bg-[#1D1914] text-[#F5F2EC]'
                    : 'border-white/10 bg-[#0B0A09] text-[#9E9589] hover:border-white/25'
                }`}
              >
                <CreditCard className="h-4 w-4 text-sky-400 mb-1" aria-hidden="true" />
                <span className="text-xs font-semibold">Tarjeta</span>
                <span className="text-[11px] text-[#9E9589]">Débito/Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors ${
                  paymentMethod === 'EFECTIVO'
                    ? 'border-[#D4AF37] bg-[#1D1914] text-[#F5F2EC]'
                    : 'border-white/10 bg-[#0B0A09] text-[#9E9589] hover:border-white/25'
                }`}
              >
                <Banknote className="h-4 w-4 text-emerald-400 mb-1" aria-hidden="true" />
                <span className="text-xs font-semibold">Efectivo</span>
                <span className="text-[11px] text-[#9E9589]">En Local</span>
              </button>
            </div>
          </div>

          {/* Yape / Plin QR Preview */}
          {paymentMethod === 'YAPE_PLIN' && (
            <div className="mt-5 rounded-xl border border-white/10 bg-[#0B0A09] p-5 text-center">
              <p className="text-xs font-medium text-[#D6CFC5] mb-3">
                Escanea el QR para Yape / Plin
              </p>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Código QR Yape y Plin de YUMBA Barber Studio"
                  className="mx-auto h-36 w-36 rounded-lg bg-white p-1.5"
                />
              ) : (
                <div className="mx-auto h-36 w-36 rounded-lg bg-white/10 flex items-center justify-center text-xs text-[#9E9589]">
                  QR YUMBA
                </div>
              )}
              <p className="mt-3 font-mono tabular-nums text-xs text-[#D4AF37]">
                Número: {studioPhoneDisplay} (YUMBA Studio)
              </p>
            </div>
          )}

          {paymentMethod === 'TARJETA' && (
            <div className="mt-5 rounded-xl border border-white/10 bg-[#0B0A09] p-4 text-xs text-[#B5AEA4] leading-relaxed">
              Aceptamos todas las tarjetas Visa, Mastercard, American Express y Diners Club directamente en nuestro POS inalámbrico al finalizar tu atención.
            </div>
          )}

          {paymentMethod === 'EFECTIVO' && (
            <div className="mt-5 rounded-xl border border-white/10 bg-[#0B0A09] p-4 text-xs text-[#B5AEA4] leading-relaxed">
              Tu horario queda garantizado al instante. Realizas el pago en efectivo directamente en recepción al concluir tu servicio.
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-4 text-sm font-bold tracking-wide text-[#0B0A09] transition-colors duration-200 hover:bg-[#E5C14B] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <span>{submitting ? 'Confirmando y enviando WhatsApp...' : 'Confirmar Reserva'}</span>
          </button>

          <p className="mt-3 text-center text-xs text-[#9E9589]">
            Al confirmar, tu cita aparece en el panel del barbero y se envía notificación automática vía Twilio WhatsApp al {studioPhoneDisplay}.
          </p>
        </aside>
      </div>

      {/* Confirmation Receipt Modal */}
      {confirmation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-[#D4AF37]/40 bg-[#151311] p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              aria-label="Cerrar confirmación"
              className="absolute right-4 top-4 rounded-lg p-2 text-[#9E9589] hover:bg-white/5 hover:text-[#F5F2EC]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
              <div>
                <h3 id="confirm-title" className="font-display text-xl font-bold text-[#F5F2EC]">
                  Cita Reservada con Éxito
                </h3>
                <p className="text-xs font-mono text-[#D4AF37]">
                  Código {confirmation.appointment.id}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-[#0B0A09] p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9E9589]">Cliente</span>
                <span className="font-medium text-[#F5F2EC]">
                  {confirmation.appointment.clientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9589]">Barbero</span>
                <span className="font-medium text-[#F5F2EC]">
                  {confirmation.appointment.barberName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9589]">Fecha y Hora</span>
                <span className="font-mono tabular-nums text-[#F5F2EC]">
                  {confirmation.appointment.date} · {confirmation.appointment.time}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-[#9E9589]">Total</span>
                <span className="font-mono tabular-nums font-bold text-[#D4AF37]">
                  S/ {confirmation.appointment.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Twilio WhatsApp Status */}
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0B0A09] p-4 text-xs">
              <p className="font-semibold text-[#F5F2EC] mb-1">
                Notificación WhatsApp (Twilio API → {studioPhoneDisplay})
              </p>
              <p className="text-[#B5AEA4] leading-relaxed">
                {confirmation.twilioResult.status === 'sent'
                  ? `Enviado automáticamente (SID: ${confirmation.twilioResult.sid || 'OK'}). El barbero ya recibió los datos de tu reserva.`
                  : confirmation.twilioResult.detail}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={confirmation.whatsappFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar también por WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-[#F5F2EC] hover:bg-white/5"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
