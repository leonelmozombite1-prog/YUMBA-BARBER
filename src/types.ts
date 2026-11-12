export type PaymentMethod = 'YAPE_PLIN' | 'TARJETA' | 'EFECTIVO';

export type AppointmentStatus = 'Pendiente' | 'Confirmado' | 'Completado' | 'Cancelado';

export interface Barber {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  image: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export interface Appointment {
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
  paymentMethod: PaymentMethod;
  status: AppointmentStatus;
  stampAwarded: boolean;
  twilioStatus: 'sent' | 'pending_credentials' | 'error';
  twilioSid?: string;
  twilioDetail?: string;
  createdAt: string;
}

export interface VipCard {
  phone: string;
  clientName: string;
  stamps: number;
  totalVisits: number;
  discountsRedeemed: number;
  updatedAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TwilioLog {
  id: string;
  appointmentId: string;
  to: string;
  body: string;
  status: 'sent' | 'pending_credentials' | 'error';
  sid?: string;
  detail: string;
  createdAt: string;
}

export interface BookedSlot {
  barberId: string;
  date: string;
  time: string;
}

export interface BootstrapPayload {
  studioPhoneDisplay: string;
  studioPhoneRaw: string;
  barbers: Barber[];
  services: Service[];
  products: Product[];
  reviews: Review[];
  bookedSlots: BookedSlot[];
}
