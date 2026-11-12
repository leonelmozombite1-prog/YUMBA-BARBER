import { useCallback, useEffect, useState } from 'react';
import {
  Lock,
  LogOut,
  Check,
  Trash2,
  Plus,
  Send,
  RefreshCw,
  Award,
  AlertCircle,
} from 'lucide-react';
import type {
  Appointment,
  AppointmentStatus,
  Product,
  Service,
  TwilioLog,
  VipCard,
} from '../types';

interface AdminPanelProps {
  adminPin: string | null;
  onLoginSuccess: (pin: string) => void;
  onLogout: () => void;
  onDataMutated: () => void;
}

type AdminSubTab = 'citas' | 'catalogo' | 'sellos' | 'twilio';

interface AdminSnapshot {
  appointments: Appointment[];
  services: Service[];
  products: Product[];
  vipCards: VipCard[];
  twilioLogs: TwilioLog[];
  twilioConfigured: boolean;
  barberPhoneDisplay: string;
}

export default function AdminPanel({
  adminPin,
  onLoginSuccess,
  onLogout,
  onDataMutated,
}: AdminPanelProps) {
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [subTab, setSubTab] = useState<AdminSubTab>('citas');
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Service Form
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDuration, setSrvDuration] = useState('45');

  // New Product Form
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Estilizado');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('10');

  // VIP Stamp Manual Form
  const [vipPhone, setVipPhone] = useState('');
  const [vipClientName, setVipClientName] = useState('');

  const fetchDashboard = useCallback(async () => {
    if (!adminPin) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'x-admin-pin': adminPin },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = (await res.json()) as AdminSnapshot;
      setSnapshot(data);
    } catch {
      setActionNotice('No se pudo cargar el panel administrativo.');
    } finally {
      setLoading(false);
    }
  }, [adminPin, onLogout]);

  useEffect(() => {
    if (adminPin) {
      fetchDashboard();
    }
  }, [adminPin, fetchDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      if (!res.ok) {
        setLoginError('PIN incorrecto. Verifica tu clave de administrador.');
        return;
      }
      onLoginSuccess(pinInput.trim());
      setPinInput('');
    } catch {
      setLoginError('Error de conexión al validar administrador.');
    } finally {
      setLoggingIn(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    if (!adminPin) return;
    setActionNotice(null);
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchDashboard();
      onDataMutated();
      setActionNotice(
        status === 'Completado'
          ? `Cita ${id} marcada como Completada. Se asignó +1 sello VIP al cliente.`
          : `Estado de cita ${id} actualizado a ${status}.`
      );
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!adminPin) return;
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': adminPin },
    });
    if (res.ok) {
      await fetchDashboard();
      onDataMutated();
      setActionNotice(`Cita ${id} eliminada del registro.`);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) return;
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin,
      },
      body: JSON.stringify({
        name: srvName,
        description: srvDesc,
        price: Number(srvPrice),
        durationMinutes: Number(srvDuration),
      }),
    });
    if (res.ok) {
      setSrvName('');
      setSrvDesc('');
      setSrvPrice('');
      await fetchDashboard();
      onDataMutated();
      setActionNotice('Nuevo servicio agregado al catálogo.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!adminPin) return;
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': adminPin },
    });
    if (res.ok) {
      await fetchDashboard();
      onDataMutated();
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) return;
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin,
      },
      body: JSON.stringify({
        name: prodName,
        category: prodCat,
        price: Number(prodPrice),
        stock: Number(prodStock),
      }),
    });
    if (res.ok) {
      setProdName('');
      setProdPrice('');
      setProdStock('10');
      await fetchDashboard();
      onDataMutated();
      setActionNotice('Producto añadido al inventario.');
    }
  };

  const handleAdjustStock = async (prod: Product, delta: number) => {
    if (!adminPin) return;
    const res = await fetch(`/api/admin/products/${prod.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin,
      },
      body: JSON.stringify({ stock: Math.max(0, prod.stock + delta) }),
    });
    if (res.ok) {
      await fetchDashboard();
      onDataMutated();
    }
  };

  const handleStampMutation = async (
    phone: string,
    clientName: string,
    options: { delta?: number; redeem?: boolean }
  ) => {
    if (!adminPin) return;
    const res = await fetch('/api/admin/vip/stamp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin,
      },
      body: JSON.stringify({
        phone,
        clientName,
        ...options,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionNotice(data.error || 'No se pudo actualizar la tarjeta.');
      return;
    }
    await fetchDashboard();
    setActionNotice('Tarjeta VIP actualizada correctamente.');
  };

  const handleTestTwilio = async () => {
    if (!adminPin) return;
    setActionNotice(null);
    const res = await fetch('/api/admin/twilio/test', {
      method: 'POST',
      headers: { 'x-admin-pin': adminPin },
    });
    const data = await res.json();
    if (res.ok) {
      await fetchDashboard();
      setActionNotice(data.result?.detail || 'Prueba ejecutada.');
    }
  };

  if (!adminPin) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-white/10 bg-[#151311] p-7 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#F5F2EC]">
                Panel del Administrador
              </h2>
              <p className="text-xs text-[#9E9589]">Acceso exclusivo para gestión del estudio</p>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="adminPinInput" className="block text-xs font-medium text-[#D6CFC5] mb-2">
              Clave de Acceso (PIN)
            </label>
            <input
              id="adminPinInput"
              type="password"
              required
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Ingresa tu PIN administrativo"
              className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-4 py-3 text-sm font-mono text-[#F5F2EC] focus:border-[#D4AF37] focus:outline-none"
            />
            <p className="mt-2 text-[11px] text-[#777066]">
              Clave inicial por defecto: <span className="font-mono text-[#B5AEA4]">yumba2026</span>
            </p>
          </div>

          {loginError && (
            <p className="mt-3 text-xs text-red-400">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loggingIn}
            className="mt-5 w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#0B0A09] hover:bg-[#E5C14B] disabled:opacity-60"
          >
            {loggingIn ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#D4AF37]">
            Panel del Administrador
          </h2>
          <p className="mt-1 text-sm text-[#9E9589]">
            Gestiona citas reservadas, servicios, inventario de tienda, sellos VIP y notificaciones Twilio WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#151311] px-4 py-2 text-xs font-medium text-[#F5F2EC] hover:border-[#D4AF37]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-900/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar Sesión Admin</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'citas' as const, label: 'Citas Reservadas' },
          { id: 'catalogo' as const, label: 'Inventario y Servicios' },
          { id: 'sellos' as const, label: 'Gestión de Sellos VIP' },
          { id: 'twilio' as const, label: 'WhatsApp Twilio' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === tab.id
                ? 'bg-[#D4AF37] text-[#0B0A09]'
                : 'bg-[#151311] text-[#B5AEA4] hover:text-[#F5F2EC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionNotice && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3 text-xs text-[#F5F2EC]">
          <AlertCircle className="h-4 w-4 text-[#D4AF37] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TAB 1: Citas Reservadas */}
      {subTab === 'citas' && snapshot && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#151311]">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold tracking-wider text-[#9E9589] uppercase">
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Teléfono</th>
                <th className="px-5 py-4">Barbero</th>
                <th className="px-5 py-4">Fecha / Hora</th>
                <th className="px-5 py-4">Monto</th>
                <th className="px-5 py-4">Pago</th>
                <th className="px-5 py-4">WhatsApp Twilio</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {snapshot.appointments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-sm text-[#9E9589]">
                    No hay citas registradas todavía.
                  </td>
                </tr>
              ) : (
                snapshot.appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono tabular-nums text-xs font-bold text-[#D4AF37]">
                      {appt.id}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#F5F2EC]">{appt.clientName}</p>
                      <p className="text-xs text-[#9E9589]">{appt.serviceNames.join(', ')}</p>
                    </td>
                    <td className="px-5 py-4 font-mono tabular-nums text-xs text-[#D6CFC5]">
                      {appt.clientPhone}
                    </td>
                    <td className="px-5 py-4 text-[#F5F2EC]">{appt.barberName}</td>
                    <td className="px-5 py-4 font-mono tabular-nums text-xs text-[#D6CFC5]">
                      {appt.date} · {appt.time}
                    </td>
                    <td className="px-5 py-4 font-mono tabular-nums font-semibold text-[#D4AF37]">
                      S/ {appt.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#B5AEA4]">
                      {appt.paymentMethod === 'YAPE_PLIN'
                        ? 'Yape / Plin'
                        : appt.paymentMethod === 'TARJETA'
                          ? 'Tarjeta'
                          : 'Efectivo'}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <span
                        className={
                          appt.twilioStatus === 'sent'
                            ? 'text-emerald-400'
                            : appt.twilioStatus === 'pending_credentials'
                              ? 'text-amber-300'
                              : 'text-red-400'
                        }
                      >
                        {appt.twilioStatus === 'sent'
                          ? 'Enviado'
                          : appt.twilioStatus === 'pending_credentials'
                            ? 'Listo (.env)'
                            : 'Error'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold">
                      <span
                        className={
                          appt.status === 'Completado'
                            ? 'text-emerald-400'
                            : appt.status === 'Confirmado'
                              ? 'text-sky-400'
                              : appt.status === 'Cancelado'
                                ? 'text-red-400'
                                : 'text-amber-300'
                        }
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {appt.status === 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(appt.id, 'Confirmado')}
                            className="rounded border border-sky-500/40 px-2.5 py-1 text-xs text-sky-300 hover:bg-sky-950/50"
                          >
                            Confirmar
                          </button>
                        )}
                        {appt.status !== 'Completado' && appt.status !== 'Cancelado' && (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(appt.id, 'Completado')}
                            className="inline-flex items-center gap-1 rounded border border-emerald-500/40 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-950/50"
                          >
                            <Check className="h-3 w-3" />
                            <span>Completar</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteAppointment(appt.id)}
                          aria-label={`Eliminar cita ${appt.id}`}
                          className="rounded border border-white/10 p-1.5 text-[#9E9589] hover:border-red-500/40 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Inventario y Servicios */}
      {subTab === 'catalogo' && snapshot && (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Services Management */}
          <div className="rounded-2xl border border-white/10 bg-[#151311] p-6">
            <h3 className="font-display text-xl font-bold text-[#F5F2EC]">
              Servicios del Estudio
            </h3>
            <div className="mt-4 space-y-2.5">
              {snapshot.services.map((srv) => (
                <div
                  key={srv.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B0A09] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F5F2EC]">{srv.name}</p>
                    <p className="font-mono tabular-nums text-xs text-[#9E9589]">
                      S/ {srv.price.toFixed(2)} · {srv.durationMinutes} min
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(srv.id)}
                    aria-label={`Eliminar servicio ${srv.name}`}
                    className="rounded p-1.5 text-[#9E9589] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddService} className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold text-[#D4AF37]">Agregar Nuevo Servicio</p>
              <input
                type="text"
                required
                value={srvName}
                onChange={(e) => setSrvName(e.target.value)}
                placeholder="Nombre del servicio"
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm text-[#F5F2EC]"
              />
              <input
                type="text"
                value={srvDesc}
                onChange={(e) => setSrvDesc(e.target.value)}
                placeholder="Descripción breve"
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm text-[#F5F2EC]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={srvPrice}
                  onChange={(e) => setSrvPrice(e.target.value)}
                  placeholder="Precio (S/)"
                  className="rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm font-mono text-[#F5F2EC]"
                />
                <input
                  type="number"
                  required
                  value={srvDuration}
                  onChange={(e) => setSrvDuration(e.target.value)}
                  placeholder="Minutos"
                  className="rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm font-mono text-[#F5F2EC]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0B0A09] hover:bg-[#E5C14B]"
              >
                <Plus className="h-4 w-4" />
                <span>Guardar Servicio</span>
              </button>
            </form>
          </div>

          {/* Inventory / Products Management */}
          <div className="rounded-2xl border border-white/10 bg-[#151311] p-6">
            <h3 className="font-display text-xl font-bold text-[#F5F2EC]">
              Inventario de Tienda
            </h3>
            <div className="mt-4 space-y-2.5">
              {snapshot.products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B0A09] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F5F2EC]">{prod.name}</p>
                    <p className="font-mono tabular-nums text-xs text-[#9E9589]">
                      S/ {prod.price.toFixed(2)} · Stock: {prod.stock} uds
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, -1)}
                      className="h-7 w-7 rounded border border-white/15 text-xs font-bold text-[#F5F2EC] hover:border-[#D4AF37]"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, 1)}
                      className="h-7 w-7 rounded border border-white/15 text-xs font-bold text-[#F5F2EC] hover:border-[#D4AF37]"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddProduct} className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold text-[#D4AF37]">Agregar Producto</p>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm text-[#F5F2EC]"
              />
              <div className="grid grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={prodCat}
                  onChange={(e) => setProdCat(e.target.value)}
                  placeholder="Categoría"
                  className="rounded-lg border border-white/10 bg-[#0B0A09] px-3 py-2.5 text-xs text-[#F5F2EC]"
                />
                <input
                  type="number"
                  step="0.5"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="Precio S/"
                  className="rounded-lg border border-white/10 bg-[#0B0A09] px-3 py-2.5 text-xs font-mono text-[#F5F2EC]"
                />
                <input
                  type="number"
                  required
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  placeholder="Stock"
                  className="rounded-lg border border-white/10 bg-[#0B0A09] px-3 py-2.5 text-xs font-mono text-[#F5F2EC]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0B0A09] hover:bg-[#E5C14B]"
              >
                <Plus className="h-4 w-4" />
                <span>Guardar Producto</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Gestión de Sellos VIP */}
      {subTab === 'sellos' && snapshot && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#151311] p-6">
            <h3 className="font-display text-lg font-bold text-[#F5F2EC]">
              Asignar Sello Manualmente
            </h3>
            <div className="mt-4 space-y-3">
              <input
                type="tel"
                value={vipPhone}
                onChange={(e) => setVipPhone(e.target.value)}
                placeholder="Teléfono del cliente"
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm font-mono text-[#F5F2EC]"
              />
              <input
                type="text"
                value={vipClientName}
                onChange={(e) => setVipClientName(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full rounded-lg border border-white/10 bg-[#0B0A09] px-3.5 py-2.5 text-sm text-[#F5F2EC]"
              />
              <button
                type="button"
                onClick={() => {
                  handleStampMutation(vipPhone, vipClientName, { delta: 1 });
                  setVipPhone('');
                  setVipClientName('');
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0B0A09] hover:bg-[#E5C14B]"
              >
                <Award className="h-4 w-4" />
                <span>Sumar +1 Sello VIP</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#151311] p-6">
            <h3 className="font-display text-lg font-bold text-[#F5F2EC] mb-4">
              Clientes con Tarjeta Virtual
            </h3>
            <div className="space-y-3">
              {snapshot.vipCards.map((card) => (
                <div
                  key={card.phone}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0B0A09] px-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F5F2EC]">{card.clientName}</p>
                    <p className="font-mono tabular-nums text-xs text-[#9E9589]">
                      {card.phone} · {card.stamps} / 5 sellos · {card.totalVisits} visitas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleStampMutation(card.phone, card.clientName, { delta: 1 })
                      }
                      className="rounded-lg border border-[#D4AF37]/40 px-3 py-1.5 text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    >
                      +1 Sello
                    </button>
                    {card.stamps >= 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStampMutation(card.phone, card.clientName, { redeem: true })
                        }
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        Canjear 50%
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WhatsApp Twilio Logs */}
      {subTab === 'twilio' && snapshot && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#151311] p-6">
            <div>
              <h3 className="font-display text-lg font-bold text-[#F5F2EC]">
                Integración Automática Twilio WhatsApp API
              </h3>
              <p className="mt-1 text-xs text-[#9E9589]">
                Destino configurado del barbero:{' '}
                <span className="font-mono text-[#D4AF37]">{snapshot.barberPhoneDisplay}</span> ·
                Estado:{' '}
                <span className={snapshot.twilioConfigured ? 'text-emerald-400' : 'text-amber-300'}>
                  {snapshot.twilioConfigured
                    ? 'Credenciales .env activas'
                    : 'Pendiente variables TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN en .env'}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestTwilio}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0B0A09] hover:bg-[#E5C14B]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Enviar Mensaje de Prueba</span>
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151311] p-6">
            <h4 className="text-sm font-semibold text-[#F5F2EC] mb-4">
              Historial de Notificaciones Enviadas
            </h4>
            {snapshot.twilioLogs.length === 0 ? (
              <p className="text-xs text-[#9E9589]">
                Aún no se han registrado envíos de WhatsApp en esta sesión.
              </p>
            ) : (
              <div className="space-y-3">
                {snapshot.twilioLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-white/10 bg-[#0B0A09] p-4 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[#9E9589]">
                      <span className="font-mono text-[#D4AF37]">
                        {log.appointmentId} → {log.to}
                      </span>
                      <span>
                        {log.status === 'sent'
                          ? `Enviado (${log.sid || 'OK'})`
                          : log.status === 'pending_credentials'
                            ? 'En espera de credenciales Twilio .env'
                            : 'Error'}
                      </span>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-[#D6CFC5]">
                      {log.body}
                    </pre>
                    <p className="mt-2 text-[11px] text-[#777066]">{log.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
