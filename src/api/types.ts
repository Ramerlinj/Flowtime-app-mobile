/**
 * Tipos de datos para la aplicación Flowtime y la base de datos Supabase
 */

export type UserRole = 'CLIENTE' | 'PROFESIONAL' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  role?: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ==============================================================================
// ENTIDADES DE LA BASE DE DATOS SUPABASE
// ==============================================================================

export interface Profile {
  id: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  telefono: string | null;
  foto_perfil: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  nombre: string;
  icono: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  categoria_id: string | null;
  nombre_comercial: string;
  descripcion: string | null;
  direccion: string | null;
  ciudad: string | null;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  telefono: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  website: string | null;
  rating: number;
  total_resenas: number;
  foto_portada: string | null;
  foto_perfil: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  categoria?: Category;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  dia_semana: number; // 0=Domingo, 1=Lunes, ... 6=Sábado
  hora_apertura: string | null;
  hora_cierre: string | null;
  cerrado: boolean;
}

export interface Specialist {
  id: string;
  business_id: string;
  user_id: string | null;
  nombre: string;
  apellido: string;
  especialidad: string | null;
  descripcion: string | null;
  telefono: string | null;
  foto: string | null;
  orden: number;
  activo: boolean;
  fecha_ingreso: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: number;
  moneda: 'DOP' | 'USD';
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'EN_PROGRESO'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'NO_ASISTIO';

export type PaymentMethod =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'TRANSFERENCIA'
  | 'PAYPAL'
  | 'OTRO'
  | 'PENDIENTE';

export interface Appointment {
  id: string;
  business_id: string;
  client_id: string;
  specialist_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_total_minutos: number;
  precio_total: number;
  moneda: 'DOP' | 'USD';
  estado: AppointmentStatus;
  metodo_pago: PaymentMethod;
  notas: string | null;
  cancelacion_motivo: string | null;
  created_at: string;
  updated_at: string;
  business?: Business;
  specialist?: Specialist;
  client?: Profile;
  services?: Service[];
}

export interface Review {
  id: string;
  business_id: string;
  client_id: string;
  specialist_id: string | null;
  appointment_id: string | null;
  calificacion: number;
  comentario: string | null;
  respuesta_negocio: string | null;
  fecha_respuesta: string | null;
  created_at: string;
  updated_at: string;
  client?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
  business?: Business;
}

export interface BusinessPhoto {
  id: string;
  business_id: string;
  url: string;
  descripcion: string | null;
  orden: number;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  tipo:
    | 'CITA_NUEVA'
    | 'CITA_CONFIRMADA'
    | 'CITA_CANCELADA'
    | 'CITA_RECORDATORIO'
    | 'RESENA_NUEVA'
    | 'SISTEMA'
    | 'PROMOCION';
  titulo: string;
  mensaje: string | null;
  data: Record<string, any>;
  leida: boolean;
  created_at: string;
}
