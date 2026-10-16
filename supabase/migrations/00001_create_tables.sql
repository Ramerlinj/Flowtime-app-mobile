-- ==============================================================================
-- FLOWTIME - ESQUEMA DE BASE DE DATOS
-- Sistema de reserva de citas para barberías, peluquerías y centros de belleza
-- Mercado objetivo: República Dominicana (DOP / USD)
-- Migración: 00001_create_tables.sql
-- ==============================================================================

-- Habilitar extensión para generación de identificadores UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLA: profiles (Extiende la tabla auth.users de Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('CLIENTE', 'PROFESIONAL', 'ADMIN')),
    telefono VARCHAR(30),
    foto_perfil TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Perfiles de usuario extendiendo el esquema de autenticación de Supabase (auth.users)';

-- ==============================================================================
-- 2. TABLA: categories (Categorías de establecimientos y servicios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(50), -- Nombre o clave del icono para la UI móvil (ej: 'cut', 'spa', 'nail')
    orden SMALLINT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE categories IS 'Categorías principales de negocio (Barbería, Salón de Belleza, Spa, Uñas, etc.)';
COMMENT ON COLUMN categories.icono IS 'Identificador del icono a desplegar en la app móvil (ej: cut, spa, nail)';
COMMENT ON COLUMN categories.orden IS 'Prioridad de presentación en listas y pantallas de descubrimiento';

-- ==============================================================================
-- 3. TABLA: businesses (Negocios / Sucursales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    nombre_comercial VARCHAR(150) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'República Dominicana',
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    telefono VARCHAR(30),
    instagram VARCHAR(150),
    facebook VARCHAR(150),
    tiktok VARCHAR(150),
    website VARCHAR(255),
    rating DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_resenas INT NOT NULL DEFAULT 0,
    foto_portada TEXT,
    foto_perfil TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE businesses IS 'Establecimientos comerciales. Un usuario propietario puede administrar uno o múltiples negocios';
COMMENT ON COLUMN businesses.owner_id IS 'Referencia al perfil de usuario propietario (administrador del negocio)';
COMMENT ON COLUMN businesses.rating IS 'Promedio acumulado de calificaciones recibidas (escala 0.00 a 5.00)';
COMMENT ON COLUMN businesses.total_resenas IS 'Contador total de reseñas recibidas por el negocio';

-- ==============================================================================
-- 4. TABLA: business_hours (Horarios comerciales semanales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_apertura TIME,
    hora_cierre TIME,
    cerrado BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT uq_business_hours_business_dia UNIQUE (business_id, dia_semana)
);

COMMENT ON TABLE business_hours IS 'Horario de operación habitual del negocio organizado por día de la semana';
COMMENT ON COLUMN business_hours.dia_semana IS 'Día de la semana: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado';
COMMENT ON COLUMN business_hours.cerrado IS 'Indica si el negocio permanece cerrado durante este día específico';

-- ==============================================================================
-- 5. TABLA: specialists (Especialistas / Barberos / Estilistas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS specialists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad VARCHAR(150),
    descripcion TEXT,
    telefono VARCHAR(30),
    foto TEXT,
    orden SMALLINT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_ingreso DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE specialists IS 'Profesionales que brindan atención y servicios dentro de un negocio';
COMMENT ON COLUMN specialists.user_id IS 'Vínculo opcional con el perfil de usuario si el especialista dispone de acceso a la app';
COMMENT ON COLUMN specialists.orden IS 'Orden visual de visualización en la selección de profesionales';

-- ==============================================================================
-- 6. TABLA: services (Catálogo de servicios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    duracion_minutos INT NOT NULL CHECK (duracion_minutos > 0),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'DOP' CHECK (moneda IN ('DOP', 'USD')),
    imagen_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE services IS 'Catálogo de servicios disponibles por establecimiento comercial';
COMMENT ON COLUMN services.duracion_minutos IS 'Tiempo estimado de ejecución del servicio en minutos';
COMMENT ON COLUMN services.precio IS 'Tarifa base del servicio';
COMMENT ON COLUMN services.moneda IS 'Moneda de cobro: DOP (Pesos Dominicanos) o USD (Dólares)';

-- ==============================================================================
-- 7. TABLA: specialist_services (Relación N:M Especialistas y Servicios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS specialist_services (
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (specialist_id, service_id)
);

COMMENT ON TABLE specialist_services IS 'Tabla pivote N:M que asocia qué especialistas están habilitados para realizar cada servicio';

-- ==============================================================================
-- 8. TABLA: specialist_schedules (Jornadas laborales de especialistas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS specialist_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    CHECK (hora_inicio < hora_fin)
);

COMMENT ON TABLE specialist_schedules IS 'Horarios regulares de trabajo semanal asignados a cada especialista';
COMMENT ON COLUMN specialist_schedules.dia_semana IS 'Día de la semana: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado';

-- ==============================================================================
-- 9. TABLA: schedule_blocks (Bloqueos de agenda e indisponibilidad)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS schedule_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME,  -- NULL si todo_el_dia = true
    hora_fin TIME,     -- NULL si todo_el_dia = true
    todo_el_dia BOOLEAN NOT NULL DEFAULT false,
    motivo VARCHAR(30) NOT NULL DEFAULT 'OTRO' CHECK (motivo IN ('ALMUERZO', 'IMPREVISTO', 'MANTENIMIENTO', 'INCAPACIDAD', 'VACACIONES', 'DIA_LIBRE', 'OTRO')),
    descripcion VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (todo_el_dia = true AND hora_inicio IS NULL AND hora_fin IS NULL)
        OR
        (todo_el_dia = false AND hora_inicio IS NOT NULL AND hora_fin IS NOT NULL AND hora_inicio < hora_fin)
    )
);

COMMENT ON TABLE schedule_blocks IS 'Periodos de indisponibilidad temporal o días libres para un especialista';
COMMENT ON COLUMN schedule_blocks.motivo IS 'Motivo de la indisponibilidad: ALMUERZO, IMPREVISTO, MANTENIMIENTO, INCAPACIDAD, VACACIONES, DIA_LIBRE, OTRO';

-- ==============================================================================
-- 10. TABLA: business_clients (Ficha de clientes por negocio)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS business_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notas_internas TEXT,
    preferencias TEXT,
    fecha_primer_servicio TIMESTAMPTZ,
    fecha_ultimo_servicio TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_business_clients_business_client UNIQUE (business_id, client_id)
);

COMMENT ON TABLE business_clients IS 'Registro de relación y fidelización de clientes con el negocio, incluyendo preferencias y notas internas';

-- ==============================================================================
-- 11. TABLA: appointments (Citas y reservaciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_total_minutos INT NOT NULL CHECK (duracion_total_minutos > 0),
    precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'DOP' CHECK (moneda IN ('DOP', 'USD')),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO')),
    metodo_pago VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'PAYPAL', 'OTRO', 'PENDIENTE')),
    notas TEXT,
    cancelacion_motivo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (hora_inicio < hora_fin)
);

COMMENT ON TABLE appointments IS 'Citas programadas entre clientes y especialistas de un negocio';
COMMENT ON COLUMN appointments.estado IS 'Estado del flujo de la cita: PENDIENTE, CONFIRMADA, EN_PROGRESO, COMPLETADA, CANCELADA o NO_ASISTIO';
COMMENT ON COLUMN appointments.metodo_pago IS 'Medio de pago utilizado o acordado: EFECTIVO, TARJETA, TRANSFERENCIA, PAYPAL, OTRO o PENDIENTE';
COMMENT ON COLUMN appointments.cancelacion_motivo IS 'Motivo registrado en caso de cancelación de la cita';

-- ==============================================================================
-- 12. TABLA: appointment_services (Servicios incluidos por cita)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS appointment_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    precio DECIMAL(10,2) NOT NULL,
    duracion_minutos INT NOT NULL,
    CONSTRAINT uq_appointment_services_appointment_service UNIQUE (appointment_id, service_id)
);

COMMENT ON TABLE appointment_services IS 'Desglose detallado de los servicios incluidos en una cita específica con su precio y duración pactada';

-- ==============================================================================
-- 13. TABLA: reviews (Reseñas y valoraciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    specialist_id UUID REFERENCES specialists(id) ON DELETE SET NULL,
    appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE SET NULL,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    respuesta_negocio TEXT,
    fecha_respuesta TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reviews IS 'Reseñas y puntuaciones otorgadas por clientes tras un servicio recibido';
COMMENT ON COLUMN reviews.appointment_id IS 'Referencia única a la cita atendida para garantizar como máximo una reseña por servicio prestado';
COMMENT ON COLUMN reviews.calificacion IS 'Puntuación otorgada del 1 al 5';
COMMENT ON COLUMN reviews.respuesta_negocio IS 'Respuesta pública del negocio ante la valoración del cliente';

-- ==============================================================================
-- 14. TABLA: favorites (Negocios favoritos del usuario)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_favorites_user_business UNIQUE (user_id, business_id)
);

COMMENT ON TABLE favorites IS 'Lista de negocios guardados en favoritos por los usuarios para acceso rápido';

-- ==============================================================================
-- 15. TABLA: business_photos (Galería fotográfica de negocios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS business_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    descripcion VARCHAR(255),
    orden SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE business_photos IS 'Fotografías del establecimiento, trabajos realizados e instalaciones del negocio';

-- ==============================================================================
-- 16. TABLA: notifications (Notificaciones para usuarios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('CITA_NUEVA', 'CITA_CONFIRMADA', 'CITA_CANCELADA', 'CITA_RECORDATORIO', 'RESENA_NUEVA', 'SISTEMA', 'PROMOCION')),
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    leida BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS 'Notificaciones internas y alertas enviadas a los usuarios de la plataforma';
COMMENT ON COLUMN notifications.tipo IS 'Categoría del mensaje: CITA_NUEVA, CITA_CONFIRMADA, CITA_CANCELADA, CITA_RECORDATORIO, RESENA_NUEVA, SISTEMA, PROMOCION';
COMMENT ON COLUMN notifications.data IS 'Metadatos adicionales en formato JSON (ej: appointment_id, business_id)';

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO (Performance Indexes)
-- ==============================================================================

-- Appointments (Citas)
CREATE INDEX IF NOT EXISTS idx_appointments_fecha ON appointments(fecha);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_specialist ON appointments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_estado ON appointments(estado);
CREATE INDEX IF NOT EXISTS idx_appointments_business_fecha ON appointments(business_id, fecha);

-- Services (Servicios)
CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id);

-- Specialists (Especialistas)
CREATE INDEX IF NOT EXISTS idx_specialists_business ON specialists(business_id);

-- Schedule blocks (Bloqueos de horario)
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_specialist_fecha ON schedule_blocks(specialist_id, fecha);

-- Reviews (Reseñas)
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);

-- Favorites (Favoritos)
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Notifications (Notificaciones)
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_leida ON notifications(user_id, leida);

-- Businesses (Negocios)
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_categoria ON businesses(categoria_id);
CREATE INDEX IF NOT EXISTS idx_businesses_ciudad ON businesses(ciudad);
