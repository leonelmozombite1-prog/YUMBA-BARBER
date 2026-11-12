import express from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const BARBER_WHATSAPP_NUMBER = '+51967887427';
const BARBER_PHONE_DISPLAY = '+51 967 887 427';
const DEFAULT_ADMIN_PIN = process.env.ADMIN_PIN || 'yumba2026';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'yumba-db.json');

interface BarberRecord {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  image: string;
}

interface ServiceRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}

interface ProductRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

interface AppointmentRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  barberId: string;
  barberName: string;
  serviceIds: string[];
  serviceNames: string[];
  date: string;
  time: string;
  subtotal: number;
  discountApplied: number;
  total: number;
  paymentMethod: 'YAPE_PLIN' | 'TARJETA' | 'EFECTIVO';
  status: 'Pendiente' | 'Confirmado' | 'Completado' | 'Cancelado';
  stampAwarded: boolean;
  twilioStatus: 'sent' | 'pending_credentials' | 'error';
  twilioSid?: string;
  twilioDetail?: string;
  createdAt: string;
}

interface VipCardRecord {
  phone: string;
  clientName: string;
  stamps: number;
  totalVisits: number;
  discountsRedeemed: number;
  updatedAt: string;
}

interface ReviewRecord {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface TwilioLogRecord {
  id: string;
  appointmentId: string;
  to: string;
  body: string;
  status: 'sent' | 'pending_credentials' | 'error';
  sid?: string;
  detail: string;
  createdAt: string;
}

interface DatabaseSchema {
  nextReceiptSeq: number;
  barbers: BarberRecord[];
  services: ServiceRecord[];
  products: ProductRecord[];
  appointments: AppointmentRecord[];
  vipCards: VipCardRecord[];
  reviews: ReviewRecord[];
  twilioLogs: TwilioLogRecord[];
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-9);
}

function createSeedDatabase(): DatabaseSchema {
  return {
    nextReceiptSeq: 102,
    barbers: [
      {
        id: 'jhojan',
        name: 'Jhojan',
        role: 'Master Barber & Founder',
        specialty: 'Skin Fade, Diseños & Asesoría Facial',
        experience: '8 años de experiencia',
        image: '/src/assets/images/barber_jhojan_1794521555689.jpg',
      },
      {
        id: 'carlos',
        name: 'Carlos',
        role: 'Fade Specialist',
        specialty: 'Low / Mid / High Fade & Texturizado',
        experience: '6 años de experiencia',
        image: '/src/assets/images/barber_carlos_1794521556853.jpg',
      },
      {
        id: 'mateo',
        name: 'Mateo',
        role: 'Stylist & Beard Expert',
        specialty: 'Corte a Tijera & Ritual de Navaja',
        experience: '7 años de experiencia',
        image: '/src/assets/images/barber_mateo_1794521556760.jpg',
      },
    ],
    services: [
      {
        id: 'srv-corte-clasico',
        name: 'Corte Clásico / Urban Fade',
        description: 'Lavado capilar, asesoría de rostro, degradado de precisión y peinado final.',
        price: 35,
        durationMinutes: 45,
        active: true,
      },
      {
        id: 'srv-ritual-barba',
        name: 'Perfilado & Ritual de Barba',
        description: 'Toalla caliente aromática, aceites esenciales y afeitado con navaja tradicional.',
        price: 25,
        durationMinutes: 30,
        active: true,
      },
      {
        id: 'srv-combo-vip',
        name: 'Combo YUMBA VIP (Corte + Barba)',
        description: 'Experiencia integral de corte de autor, ritual de barba y bebida de cortesía.',
        price: 50,
        durationMinutes: 75,
        active: true,
      },
      {
        id: 'srv-pigmentacion',
        name: 'Pigmentación / Tinte de Barba',
        description: 'Corrección de densidad, perfilado geométrico e intensidad de color natural.',
        price: 20,
        durationMinutes: 25,
        active: true,
      },
      {
        id: 'srv-capilar-facial',
        name: 'Tratamiento Capilar & Exfoliación Facial',
        description: 'Mascarilla purificante black mask, vaporización y limpieza facial profunda.',
        price: 30,
        durationMinutes: 35,
        active: true,
      },
    ],
    products: [
      {
        id: 'prod-matte-clay',
        name: 'Pomada Mate Fijación Extrema 100g',
        category: 'Estilizado',
        description: 'Acabado natural sin brillo con fijación flexible durante todo el día.',
        price: 45,
        stock: 14,
        image: '/src/assets/images/store_grooming_kit_1794521556794.jpg',
      },
      {
        id: 'prod-beard-oil',
        name: 'Elixir de Barba Sándalo & Cedro 30ml',
        category: 'Cuidado de Barba',
        description: 'Hidrata la piel, suaviza el vello facial y aporta aroma amaderado sutil.',
        price: 40,
        stock: 9,
        image: '/src/assets/images/store_grooming_kit_1794521556794.jpg',
      },
      {
        id: 'prod-wood-comb',
        name: 'Peine Artesanal de Madera de Sándalo',
        category: 'Accesorios',
        description: 'Dientes antiestáticos tallados para distribuir aceites sin quebrar la barba.',
        price: 28,
        stock: 18,
        image: '/src/assets/images/store_grooming_kit_1794521556794.jpg',
      },
      {
        id: 'prod-aftershave',
        name: 'Bálsamo Calmante Post-Afeitado 120ml',
        category: 'Piel & Afeitado',
        description: 'Fórmula refrescante sin alcohol con aloe vera y extracto de eucalipto.',
        price: 38,
        stock: 11,
        image: '/src/assets/images/store_grooming_kit_1794521556794.jpg',
      },
    ],
    appointments: [
      {
        id: 'REC-101',
        clientName: 'Jhojan',
        clientPhone: '987654321',
        barberId: 'jhojan',
        barberName: 'Jhojan',
        serviceIds: ['srv-combo-vip'],
        serviceNames: ['Combo YUMBA VIP (Corte + Barba)'],
        date: '2026-11-10',
        time: '11:00 AM',
        subtotal: 50,
        discountApplied: 0,
        total: 50,
        paymentMethod: 'YAPE_PLIN',
        status: 'Completado',
        stampAwarded: true,
        twilioStatus: 'sent',
        twilioDetail: 'Registro inicial de historial',
        createdAt: '2026-11-10T10:15:00.000Z',
      },
    ],
    vipCards: [
      {
        phone: '987654321',
        clientName: 'Jhojan (Cliente VIP)',
        stamps: 3,
        totalVisits: 3,
        discountsRedeemed: 0,
        updatedAt: '2026-11-10T12:00:00.000Z',
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Ricardo G.',
        rating: 5,
        comment: 'Excelente atención de Jhojan, la precisión del degradado y el ambiente del estudio son de otro nivel.',
        createdAt: '2026-11-01T18:30:00.000Z',
      },
      {
        id: 'rev-2',
        author: 'Gabriel M.',
        rating: 5,
        comment: 'El ritual con toalla caliente para la barba es impecable. Puntualidad absoluta desde que reservas.',
        createdAt: '2026-11-04T15:10:00.000Z',
      },
      {
        id: 'rev-3',
        author: 'Andrés V.',
        rating: 5,
        comment: 'Mi tarjeta virtual ya va por el cuarto sello. La atención y el café de cortesía marcan la diferencia.',
        createdAt: '2026-11-08T19:45:00.000Z',
      },
    ],
    twilioLogs: [],
  };
}

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DatabaseSchema;
}

function writeDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim()
  );
}

async function sendTwilioWhatsApp(
  appointmentId: string,
  messageBody: string
): Promise<{
  status: 'sent' | 'pending_credentials' | 'error';
  sid?: string;
  detail: string;
}> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim() || 'whatsapp:+14155238886';
  const rawTo = process.env.BARBER_WHATSAPP_TO?.trim() || `whatsapp:${BARBER_WHATSAPP_NUMBER}`;
  const toNumber = rawTo.startsWith('whatsapp:') ? rawTo : `whatsapp:${rawTo}`;

  if (!accountSid || !authToken) {
    return {
      status: 'pending_credentials',
      detail:
        'Credenciales TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN no configuradas en .env. Mensaje registrado y listo para envío automático.',
    };
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const form = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: messageBody,
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const payload = (await response.json()) as {
      sid?: string;
      message?: string;
      status?: string;
    };

    if (!response.ok) {
      return {
        status: 'error',
        detail: payload.message || `Error Twilio HTTP ${response.status} (${appointmentId})`,
      };
    }

    return {
      status: 'sent',
      sid: payload.sid,
      detail: `WhatsApp enviado automáticamente vía Twilio (${payload.status || 'queued'})`,
    };
  } catch (err) {
    return {
      status: 'error',
      detail: err instanceof Error ? err.message : 'Error de conexión con Twilio API',
    };
  }
}

function formatPaymentLabel(method: 'YAPE_PLIN' | 'TARJETA' | 'EFECTIVO'): string {
  if (method === 'YAPE_PLIN') return 'Yape / Plin';
  if (method === 'TARJETA') return 'Tarjeta Débito/Crédito';
  return 'Efectivo en Local';
}

function verifyAdminPin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const provided = req.header('x-admin-pin') || '';
  if (provided !== DEFAULT_ADMIN_PIN) {
    res.status(401).json({ error: 'PIN de administrador incorrecto.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB on boot
  readDb();

  // Public bootstrap data
  app.get('/api/bootstrap', (_req, res) => {
    const db = readDb();
    const bookedSlots = db.appointments
      .filter((a) => a.status !== 'Cancelado')
      .map((a) => ({
        barberId: a.barberId,
        date: a.date,
        time: a.time,
      }));

    res.json({
      studioPhoneDisplay: BARBER_PHONE_DISPLAY,
      studioPhoneRaw: '51967887427',
      barbers: db.barbers,
      services: db.services.filter((s) => s.active),
      products: db.products,
      reviews: db.reviews,
      bookedSlots,
    });
  });

  // Lookup VIP stamp card by phone
  app.get('/api/vip/:phone', (req, res) => {
    const db = readDb();
    const normalized = normalizePhone(req.params.phone || '');
    if (normalized.length < 6) {
      res.status(400).json({ error: 'Ingresa un número de teléfono válido.' });
      return;
    }
    const card = db.vipCards.find((c) => normalizePhone(c.phone) === normalized);
    if (!card) {
      res.status(404).json({
        error: 'No encontramos sellos aún para este número. Tu tarjeta se creará automáticamente con tu primera reserva.',
      });
      return;
    }
    res.json({ card });
  });

  // Create appointment + immediately trigger Twilio WhatsApp API
  app.post('/api/appointments', async (req, res) => {
    const db = readDb();
    const {
      clientName,
      clientPhone,
      barberId,
      serviceIds,
      date,
      time,
      paymentMethod,
      redeemVipDiscount,
    } = req.body as {
      clientName?: string;
      clientPhone?: string;
      barberId?: string;
      serviceIds?: string[];
      date?: string;
      time?: string;
      paymentMethod?: 'YAPE_PLIN' | 'TARJETA' | 'EFECTIVO';
      redeemVipDiscount?: boolean;
    };

    if (!clientName?.trim() || !clientPhone?.trim() || !barberId || !Array.isArray(serviceIds) || serviceIds.length === 0 || !date || !time) {
      res.status(400).json({ error: 'Completa tu nombre, teléfono, barbero, al menos un servicio, fecha y hora.' });
      return;
    }

    const barber = db.barbers.find((b) => b.id === barberId);
    if (!barber) {
      res.status(400).json({ error: 'Barbero seleccionado no válido.' });
      return;
    }

    const selectedServices = db.services.filter((s) => serviceIds.includes(s.id) && s.active);
    if (selectedServices.length === 0) {
      res.status(400).json({ error: 'Selecciona al menos un servicio válido.' });
      return;
    }

    const slotConflict = db.appointments.find(
      (a) => a.barberId === barberId && a.date === date && a.time === time && a.status !== 'Cancelado'
    );
    if (slotConflict) {
      res.status(409).json({
        error: `El horario ${time} con ${barber.name} el ${date} ya se encuentra reservado. Elige otra hora.`,
      });
      return;
    }

    const normalized = normalizePhone(clientPhone);
    let vipCard = db.vipCards.find((c) => normalizePhone(c.phone) === normalized);
    if (!vipCard) {
      vipCard = {
        phone: clientPhone.trim(),
        clientName: clientName.trim(),
        stamps: 0,
        totalVisits: 0,
        discountsRedeemed: 0,
        updatedAt: new Date().toISOString(),
      };
      db.vipCards.push(vipCard);
    }

    const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    let discountApplied = 0;
    if (redeemVipDiscount && vipCard.stamps >= 4) {
      discountApplied = Number((subtotal * 0.5).toFixed(2));
      vipCard.stamps = Math.max(0, vipCard.stamps - 4);
      vipCard.discountsRedeemed += 1;
      vipCard.updatedAt = new Date().toISOString();
    }

    const total = Number((subtotal - discountApplied).toFixed(2));
    const receiptId = `REC-${db.nextReceiptSeq}`;
    db.nextReceiptSeq += 1;

    const chosenPayment: 'YAPE_PLIN' | 'TARJETA' | 'EFECTIVO' =
      paymentMethod === 'TARJETA' || paymentMethod === 'EFECTIVO' ? paymentMethod : 'YAPE_PLIN';

    const serviceListText = selectedServices.map((s) => `• ${s.name} (S/ ${s.price.toFixed(2)})`).join('\n');
    const whatsappMessage = [
      `💈 *NUEVA RESERVA - YUMBA BARBER STUDIO*`,
      `Código: *${receiptId}*`,
      `Cliente: *${clientName.trim()}*`,
      `WhatsApp Cliente: ${clientPhone.trim()}`,
      `Barbero: *${barber.name}*`,
      `Fecha y Hora: *${date} — ${time}*`,
      `Servicios:`,
      serviceListText,
      discountApplied > 0 ? `Descuento VIP (50%): -S/ ${discountApplied.toFixed(2)}` : null,
      `Total a Pagar: *S/ ${total.toFixed(2)}*`,
      `Método de Pago: ${formatPaymentLabel(chosenPayment)}`,
      ``,
      `Confirmación automática generada desde el sistema web YUMBA.`,
    ]
      .filter(Boolean)
      .join('\n');

    const twilioResult = await sendTwilioWhatsApp(receiptId, whatsappMessage);

    const newAppointment: AppointmentRecord = {
      id: receiptId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      barberId: barber.id,
      barberName: barber.name,
      serviceIds: selectedServices.map((s) => s.id),
      serviceNames: selectedServices.map((s) => s.name),
      date,
      time,
      subtotal,
      discountApplied,
      total,
      paymentMethod: chosenPayment,
      status: 'Pendiente',
      stampAwarded: false,
      twilioStatus: twilioResult.status,
      twilioSid: twilioResult.sid,
      twilioDetail: twilioResult.detail,
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(newAppointment);
    db.twilioLogs.unshift({
      id: `TW-${Date.now()}`,
      appointmentId: receiptId,
      to: BARBER_PHONE_DISPLAY,
      body: whatsappMessage,
      status: twilioResult.status,
      sid: twilioResult.sid,
      detail: twilioResult.detail,
      createdAt: new Date().toISOString(),
    });

    writeDb(db);

    const whatsappFallbackUrl = `https://wa.me/51967887427?text=${encodeURIComponent(whatsappMessage)}`;
    res.status(201).json({
      appointment: newAppointment,
      twilioResult,
      vipCard,
      whatsappFallbackUrl,
    });
  });

  // Publish review
  app.post('/api/reviews', (req, res) => {
    const db = readDb();
    const { author, rating, comment } = req.body as {
      author?: string;
      rating?: number;
      comment?: string;
    };

    if (!author?.trim() || !comment?.trim()) {
      res.status(400).json({ error: 'Ingresa tu nombre y opinión para publicar.' });
      return;
    }

    const numericRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const newReview: ReviewRecord = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      rating: numericRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);
    writeDb(db);
    res.status(201).json({ review: newReview });
  });

  // Store product reservation / purchase -> updates stock + notifies barber WhatsApp
  app.post('/api/store/order', async (req, res) => {
    const db = readDb();
    const { productId, quantity, clientName, clientPhone } = req.body as {
      productId?: string;
      quantity?: number;
      clientName?: string;
      clientPhone?: string;
    };

    if (!productId || !clientName?.trim() || !clientPhone?.trim()) {
      res.status(400).json({ error: 'Completa tus datos para reservar el producto.' });
      return;
    }

    const qty = Math.max(1, Math.round(Number(quantity) || 1));
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }
    if (product.stock < qty) {
      res.status(400).json({ error: `Stock insuficiente. Quedan ${product.stock} unidades.` });
      return;
    }

    product.stock -= qty;
    const total = Number((product.price * qty).toFixed(2));
    const orderCode = `TIENDA-${Date.now().toString().slice(-4)}`;

    const message = [
      `🛍️ *PEDIDO DE TIENDA - YUMBA BARBER STUDIO*`,
      `Código: *${orderCode}*`,
      `Cliente: *${clientName.trim()}* (${clientPhone.trim()})`,
      `Producto: *${product.name}* x${qty}`,
      `Total: *S/ ${total.toFixed(2)}*`,
      `Recojo en local.`,
    ].join('\n');

    const twilioResult = await sendTwilioWhatsApp(orderCode, message);
    db.twilioLogs.unshift({
      id: `TW-${Date.now()}`,
      appointmentId: orderCode,
      to: BARBER_PHONE_DISPLAY,
      body: message,
      status: twilioResult.status,
      sid: twilioResult.sid,
      detail: twilioResult.detail,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);

    res.status(201).json({
      orderCode,
      product,
      total,
      twilioResult,
      whatsappFallbackUrl: `https://wa.me/51967887427?text=${encodeURIComponent(message)}`,
    });
  });

  // Admin Login check
  app.post('/api/admin/login', (req, res) => {
    const { pin } = req.body as { pin?: string };
    if ((pin || '') !== DEFAULT_ADMIN_PIN) {
      res.status(401).json({ error: 'Clave de administrador incorrecta.' });
      return;
    }
    res.json({ ok: true });
  });

  // Admin Dashboard snapshot
  app.get('/api/admin/dashboard', verifyAdminPin, (_req, res) => {
    const db = readDb();
    res.json({
      appointments: db.appointments,
      services: db.services,
      products: db.products,
      vipCards: db.vipCards,
      twilioLogs: db.twilioLogs.slice(0, 30),
      twilioConfigured: isTwilioConfigured(),
      barberPhoneDisplay: BARBER_PHONE_DISPLAY,
    });
  });

  // Update appointment status (awards VIP stamp automatically on Completado)
  app.patch('/api/admin/appointments/:id', verifyAdminPin, (req, res) => {
    const db = readDb();
    const { status } = req.body as {
      status?: 'Pendiente' | 'Confirmado' | 'Completado' | 'Cancelado';
    };
    const appt = db.appointments.find((a) => a.id === req.params.id);
    if (!appt) {
      res.status(404).json({ error: 'Cita no encontrada.' });
      return;
    }
    if (!status) {
      res.status(400).json({ error: 'Estado requerido.' });
      return;
    }

    appt.status = status;

    if (status === 'Completado' && !appt.stampAwarded) {
      const normalized = normalizePhone(appt.clientPhone);
      let card = db.vipCards.find((c) => normalizePhone(c.phone) === normalized);
      if (!card) {
        card = {
          phone: appt.clientPhone,
          clientName: appt.clientName,
          stamps: 0,
          totalVisits: 0,
          discountsRedeemed: 0,
          updatedAt: new Date().toISOString(),
        };
        db.vipCards.push(card);
      }
      card.stamps = Math.min(5, card.stamps + 1);
      card.totalVisits += 1;
      card.updatedAt = new Date().toISOString();
      appt.stampAwarded = true;
    }

    writeDb(db);
    res.json({ appointment: appt, vipCards: db.vipCards });
  });

  app.delete('/api/admin/appointments/:id', verifyAdminPin, (req, res) => {
    const db = readDb();
    const before = db.appointments.length;
    db.appointments = db.appointments.filter((a) => a.id !== req.params.id);
    if (db.appointments.length === before) {
      res.status(404).json({ error: 'Cita no encontrada.' });
      return;
    }
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Services CRUD
  app.post('/api/admin/services', verifyAdminPin, (req, res) => {
    const db = readDb();
    const { name, description, price, durationMinutes } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      durationMinutes?: number;
    };
    if (!name?.trim() || Number(price) <= 0) {
      res.status(400).json({ error: 'Nombre y precio válido son requeridos.' });
      return;
    }
    const srv: ServiceRecord = {
      id: `srv-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || 'Servicio profesional en YUMBA Barber Studio.',
      price: Number(price),
      durationMinutes: Number(durationMinutes) || 40,
      active: true,
    };
    db.services.push(srv);
    writeDb(db);
    res.status(201).json({ service: srv });
  });

  app.patch('/api/admin/services/:id', verifyAdminPin, (req, res) => {
    const db = readDb();
    const srv = db.services.find((s) => s.id === req.params.id);
    if (!srv) {
      res.status(404).json({ error: 'Servicio no encontrado.' });
      return;
    }
    const { name, description, price, durationMinutes, active } = req.body as Partial<ServiceRecord>;
    if (name !== undefined) srv.name = name.trim();
    if (description !== undefined) srv.description = description.trim();
    if (price !== undefined) srv.price = Number(price);
    if (durationMinutes !== undefined) srv.durationMinutes = Number(durationMinutes);
    if (active !== undefined) srv.active = Boolean(active);
    writeDb(db);
    res.json({ service: srv });
  });

  app.delete('/api/admin/services/:id', verifyAdminPin, (req, res) => {
    const db = readDb();
    db.services = db.services.filter((s) => s.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Products CRUD
  app.post('/api/admin/products', verifyAdminPin, (req, res) => {
    const db = readDb();
    const { name, category, description, price, stock } = req.body as Partial<ProductRecord>;
    if (!name?.trim() || Number(price) <= 0) {
      res.status(400).json({ error: 'Nombre y precio válido son requeridos.' });
      return;
    }
    const prod: ProductRecord = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category: category?.trim() || 'Cuidado Personal',
      description: description?.trim() || 'Producto oficial YUMBA Barber Studio.',
      price: Number(price),
      stock: Math.max(0, Math.round(Number(stock) || 0)),
      image: '/src/assets/images/store_grooming_kit_1794521556794.jpg',
    };
    db.products.push(prod);
    writeDb(db);
    res.status(201).json({ product: prod });
  });

  app.patch('/api/admin/products/:id', verifyAdminPin, (req, res) => {
    const db = readDb();
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }
    const { name, category, description, price, stock } = req.body as Partial<ProductRecord>;
    if (name !== undefined) prod.name = name.trim();
    if (category !== undefined) prod.category = category.trim();
    if (description !== undefined) prod.description = description.trim();
    if (price !== undefined) prod.price = Number(price);
    if (stock !== undefined) prod.stock = Math.max(0, Math.round(Number(stock)));
    writeDb(db);
    res.json({ product: prod });
  });

  app.delete('/api/admin/products/:id', verifyAdminPin, (req, res) => {
    const db = readDb();
    db.products = db.products.filter((p) => p.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin VIP Stamps management
  app.post('/api/admin/vip/stamp', verifyAdminPin, (req, res) => {
    const db = readDb();
    const { phone, clientName, delta, redeem } = req.body as {
      phone?: string;
      clientName?: string;
      delta?: number;
      redeem?: boolean;
    };
    if (!phone?.trim()) {
      res.status(400).json({ error: 'Teléfono requerido.' });
      return;
    }
    const normalized = normalizePhone(phone);
    let card = db.vipCards.find((c) => normalizePhone(c.phone) === normalized);
    if (!card) {
      card = {
        phone: phone.trim(),
        clientName: clientName?.trim() || 'Cliente VIP',
        stamps: 0,
        totalVisits: 0,
        discountsRedeemed: 0,
        updatedAt: new Date().toISOString(),
      };
      db.vipCards.push(card);
    }

    if (redeem) {
      if (card.stamps < 4) {
        res.status(400).json({ error: 'Se requieren al menos 4 sellos para canjear el 50% de descuento.' });
        return;
      }
      card.stamps = Math.max(0, card.stamps - 4);
      card.discountsRedeemed += 1;
    } else {
      const change = Number(delta) || 1;
      card.stamps = Math.min(5, Math.max(0, card.stamps + change));
      if (change > 0) card.totalVisits += change;
    }
    card.updatedAt = new Date().toISOString();
    writeDb(db);
    res.json({ card, vipCards: db.vipCards });
  });

  // Admin Twilio test message
  app.post('/api/admin/twilio/test', verifyAdminPin, async (_req, res) => {
    const db = readDb();
    const testBody = `✅ *PRUEBA DE CONEXIÓN TWILIO - YUMBA BARBER STUDIO*\nLas notificaciones automáticas por WhatsApp hacia ${BARBER_PHONE_DISPLAY} están activas.`;
    const result = await sendTwilioWhatsApp('TEST-TWILIO', testBody);
    db.twilioLogs.unshift({
      id: `TW-${Date.now()}`,
      appointmentId: 'TEST-TWILIO',
      to: BARBER_PHONE_DISPLAY,
      body: testBody,
      status: result.status,
      sid: result.sid,
      detail: result.detail,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
    res.json({ result, twilioLogs: db.twilioLogs.slice(0, 30) });
  });

  // Vite middleware in dev, static dist in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YUMBA Barber Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
