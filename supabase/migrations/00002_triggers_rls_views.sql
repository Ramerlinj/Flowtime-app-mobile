-- ==============================================================================
-- FLOWTIME - TRIGGERS, SEGURIDAD RLS, VISTAS Y DATOS SEMILLA
-- Migración: 00002_triggers_rls_views.sql
-- Mercado objetivo: República Dominicana (DOP / USD)
-- ==============================================================================

-- ==============================================================================
-- SECCIÓN 1: FUNCIONES AUXILIARES (HELPER FUNCTIONS)
-- ==============================================================================

-- 1a. Función de disparador para actualizar la columna updated_at
-- Actualiza la marca de tiempo updated_at automáticamente antes de modificar una fila
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION handle_updated_at() IS 'Disparador para actualizar automáticamente el campo updated_at al momento de edición';

-- 1b. Función de disparador para crear un perfil público tras el registro en auth.users
-- Asocia metadatos de usuario (nombre, apellido, foto) al crear la cuenta en Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, apellido, foto_perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', NEW.raw_user_meta_data->>'lastName', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user() IS 'Crea automáticamente un perfil en public.profiles al registrar un nuevo usuario en auth.users';

-- 1c. Función de disparador para recalcular la calificación y cantidad de reseñas del negocio
-- Actualiza businesses.rating y businesses.total_resenas tras inserción, actualización o eliminación en reviews
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_business_id UUID;
BEGIN
  -- Obtener el business_id de la fila afectada según la operación realizada
  IF TG_OP = 'DELETE' THEN
    target_business_id := OLD.business_id;
  ELSE
    target_business_id := NEW.business_id;
  END IF;

  UPDATE businesses
  SET
    rating = COALESCE((SELECT ROUND(AVG(calificacion)::NUMERIC, 2) FROM reviews WHERE business_id = target_business_id), 0),
    total_resenas = (SELECT COUNT(*) FROM reviews WHERE business_id = target_business_id)
  WHERE id = target_business_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_business_rating() IS 'Recalcula la calificación promedio y el conteo de reseñas de un negocio';


-- ==============================================================================
-- SECCIÓN 2: DISPARADORES (TRIGGERS)
-- ==============================================================================

-- Disparadores para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_profiles_updated ON profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_businesses_updated_at ON businesses;
DROP TRIGGER IF EXISTS on_businesses_updated ON businesses;
CREATE TRIGGER on_businesses_updated
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
DROP TRIGGER IF EXISTS on_services_updated ON services;
CREATE TRIGGER on_services_updated
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS on_appointments_updated ON appointments;
CREATE TRIGGER on_appointments_updated
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS on_reviews_updated ON reviews;
CREATE TRIGGER on_reviews_updated
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Disparador para creación automática de perfil en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Disparador para recálculo de puntuación y reseñas en businesses
DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_business_rating();


-- ==============================================================================
-- SECCIÓN 3: HABILITACIÓN DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY)
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- SECCIÓN 4: POLÍTICAS DE ROW LEVEL SECURITY (RLS POLICIES)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 4.1. POLÍTICAS: profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles son visibles para usuarios autenticados" ON profiles;
CREATE POLICY "Profiles son visibles para usuarios autenticados"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON profiles;
CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4.2. POLÍTICAS: categories
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver categorias activas" ON categories;
CREATE POLICY "Cualquiera puede ver categorias activas"
  ON categories FOR SELECT
  USING (activo = true);

DROP POLICY IF EXISTS "Solo administradores pueden insertar categorias" ON categories;
CREATE POLICY "Solo administradores pueden insertar categorias"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "Solo administradores pueden actualizar categorias" ON categories;
CREATE POLICY "Solo administradores pueden actualizar categorias"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "Solo administradores pueden eliminar categorias" ON categories;
CREATE POLICY "Solo administradores pueden eliminar categorias"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'ADMIN'
    )
  );

-- ------------------------------------------------------------------------------
-- 4.3. POLÍTICAS: businesses
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver negocios activos" ON businesses;
CREATE POLICY "Cualquiera puede ver negocios activos"
  ON businesses FOR SELECT
  USING (activo = true OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Profesionales o administradores pueden crear negocios" ON businesses;
CREATE POLICY "Profesionales o administradores pueden crear negocios"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('PROFESIONAL', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar su negocio" ON businesses;
CREATE POLICY "Propietarios pueden actualizar su negocio"
  ON businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Propietarios pueden eliminar su negocio" ON businesses;
CREATE POLICY "Propietarios pueden eliminar su negocio"
  ON businesses FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4.4. POLÍTICAS: business_hours
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver horarios de negocio" ON business_hours;
CREATE POLICY "Cualquiera puede ver horarios de negocio"
  ON business_hours FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Propietarios pueden insertar horarios de su negocio" ON business_hours;
CREATE POLICY "Propietarios pueden insertar horarios de su negocio"
  ON business_hours FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_hours.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar horarios de su negocio" ON business_hours;
CREATE POLICY "Propietarios pueden actualizar horarios de su negocio"
  ON business_hours FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_hours.business_id AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_hours.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar horarios de su negocio" ON business_hours;
CREATE POLICY "Propietarios pueden eliminar horarios de su negocio"
  ON business_hours FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_hours.business_id AND owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.5. POLÍTICAS: specialists
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver especialistas activos" ON specialists;
CREATE POLICY "Cualquiera puede ver especialistas activos"
  ON specialists FOR SELECT
  USING (
    activo = true
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE id = specialists.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden insertar especialistas" ON specialists;
CREATE POLICY "Propietarios pueden insertar especialistas"
  ON specialists FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = specialists.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar especialistas" ON specialists;
CREATE POLICY "Propietarios pueden actualizar especialistas"
  ON specialists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = specialists.business_id AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = specialists.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar especialistas" ON specialists;
CREATE POLICY "Propietarios pueden eliminar especialistas"
  ON specialists FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = specialists.business_id AND owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.6. POLÍTICAS: services
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver servicios activos" ON services;
CREATE POLICY "Cualquiera puede ver servicios activos"
  ON services FOR SELECT
  USING (
    activo = true
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE id = services.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden insertar servicios" ON services;
CREATE POLICY "Propietarios pueden insertar servicios"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = services.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar servicios" ON services;
CREATE POLICY "Propietarios pueden actualizar servicios"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = services.business_id AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = services.business_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar servicios" ON services;
CREATE POLICY "Propietarios pueden eliminar servicios"
  ON services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE id = services.business_id AND owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.7. POLÍTICAS: specialist_services
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver servicios de especialistas" ON specialist_services;
CREATE POLICY "Cualquiera puede ver servicios de especialistas"
  ON specialist_services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Propietarios pueden asignar servicios a especialistas" ON specialist_services;
CREATE POLICY "Propietarios pueden asignar servicios a especialistas"
  ON specialist_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = specialist_services.specialist_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar servicios de especialistas" ON specialist_services;
CREATE POLICY "Propietarios pueden eliminar servicios de especialistas"
  ON specialist_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = specialist_services.specialist_id AND b.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.8. POLÍTICAS: specialist_schedules
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver horarios de especialistas" ON specialist_schedules;
CREATE POLICY "Cualquiera puede ver horarios de especialistas"
  ON specialist_schedules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Propietarios pueden insertar horarios de especialistas" ON specialist_schedules;
CREATE POLICY "Propietarios pueden insertar horarios de especialistas"
  ON specialist_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = specialist_schedules.specialist_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar horarios de especialistas" ON specialist_schedules;
CREATE POLICY "Propietarios pueden actualizar horarios de especialistas"
  ON specialist_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = specialist_schedules.specialist_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = specialist_schedules.specialist_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar horarios de especialistas" ON specialist_schedules;
CREATE POLICY "Propietarios pueden eliminar horarios de especialistas"
  ON specialist_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = specialist_schedules.specialist_id AND b.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.9. POLÍTICAS: schedule_blocks
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver bloqueos de horario" ON schedule_blocks;
CREATE POLICY "Cualquiera puede ver bloqueos de horario"
  ON schedule_blocks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Propietarios pueden insertar bloqueos de horario" ON schedule_blocks;
CREATE POLICY "Propietarios pueden insertar bloqueos de horario"
  ON schedule_blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = schedule_blocks.specialist_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar bloqueos de horario" ON schedule_blocks;
CREATE POLICY "Propietarios pueden actualizar bloqueos de horario"
  ON schedule_blocks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = schedule_blocks.specialist_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = schedule_blocks.specialist_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar bloqueos de horario" ON schedule_blocks;
CREATE POLICY "Propietarios pueden eliminar bloqueos de horario"
  ON schedule_blocks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.id = schedule_blocks.specialist_id AND b.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.10. POLÍTICAS: business_clients
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Propietario o cliente pueden ver relacion de clientes" ON business_clients;
CREATE POLICY "Propietario o cliente pueden ver relacion de clientes"
  ON business_clients FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_clients.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden insertar clientes de negocio" ON business_clients;
CREATE POLICY "Propietarios pueden insertar clientes de negocio"
  ON business_clients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_clients.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar clientes de negocio" ON business_clients;
CREATE POLICY "Propietarios pueden actualizar clientes de negocio"
  ON business_clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_clients.business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_clients.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar clientes de negocio" ON business_clients;
CREATE POLICY "Propietarios pueden eliminar clientes de negocio"
  ON business_clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_clients.business_id AND b.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.11. POLÍTICAS: appointments
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Acceso de lectura a citas" ON appointments;
CREATE POLICY "Acceso de lectura a citas"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id AND b.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM specialists s
      WHERE s.id = appointments.specialist_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clientes autenticados pueden crear citas" ON appointments;
CREATE POLICY "Clientes autenticados pueden crear citas"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Propietarios o clientes pueden actualizar citas" ON appointments;
CREATE POLICY "Propietarios o clientes pueden actualizar citas"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id AND b.owner_id = auth.uid()
    )
    OR (
      client_id = auth.uid() AND estado = 'CANCELADA'
    )
  );

DROP POLICY IF EXISTS "Solo propietarios pueden eliminar citas" ON appointments;
CREATE POLICY "Solo propietarios pueden eliminar citas"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id AND b.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.12. POLÍTICAS: appointment_services
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Acceso de lectura a servicios de citas" ON appointment_services;
CREATE POLICY "Acceso de lectura a servicios de citas"
  ON appointment_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_services.appointment_id
      AND (
        a.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM businesses b
          WHERE b.id = a.business_id AND b.owner_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM specialists s
          WHERE s.id = a.specialist_id AND s.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Propietario o cliente pueden asociar servicios a citas" ON appointment_services;
CREATE POLICY "Propietario o cliente pueden asociar servicios a citas"
  ON appointment_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_services.appointment_id
      AND (
        a.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM businesses b
          WHERE b.id = a.business_id AND b.owner_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Propietario o cliente pueden eliminar servicios de citas" ON appointment_services;
CREATE POLICY "Propietario o cliente pueden eliminar servicios de citas"
  ON appointment_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_services.appointment_id
      AND (
        a.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM businesses b
          WHERE b.id = a.business_id AND b.owner_id = auth.uid()
        )
      )
    )
  );

-- ------------------------------------------------------------------------------
-- 4.13. POLÍTICAS: reviews
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede leer resenas" ON reviews;
CREATE POLICY "Cualquiera puede leer resenas"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Clientes autenticados pueden crear resenas" ON reviews;
CREATE POLICY "Clientes autenticados pueden crear resenas"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Cliente o propietario pueden actualizar resenas" ON reviews;
CREATE POLICY "Cliente o propietario pueden actualizar resenas"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = reviews.business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = reviews.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Cliente o propietario pueden eliminar resenas" ON reviews;
CREATE POLICY "Cliente o propietario pueden eliminar resenas"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = reviews.business_id AND b.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.14. POLÍTICAS: favorites
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios favoritos" ON favorites;
CREATE POLICY "Usuarios pueden ver sus propios favoritos"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden agregar sus propios favoritos" ON favorites;
CREATE POLICY "Usuarios pueden agregar sus propios favoritos"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios favoritos" ON favorites;
CREATE POLICY "Usuarios pueden eliminar sus propios favoritos"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4.15. POLÍTICAS: business_photos
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver fotos de negocios" ON business_photos;
CREATE POLICY "Cualquiera puede ver fotos de negocios"
  ON business_photos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Propietarios pueden insertar fotos de negocio" ON business_photos;
CREATE POLICY "Propietarios pueden insertar fotos de negocio"
  ON business_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_photos.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar fotos de negocio" ON business_photos;
CREATE POLICY "Propietarios pueden actualizar fotos de negocio"
  ON business_photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_photos.business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_photos.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar fotos de negocio" ON business_photos;
CREATE POLICY "Propietarios pueden eliminar fotos de negocio"
  ON business_photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_photos.business_id AND b.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4.16. POLÍTICAS: notifications
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias notificaciones" ON notifications;
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias notificaciones" ON notifications;
CREATE POLICY "Usuarios pueden actualizar sus propias notificaciones"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias notificaciones" ON notifications;
CREATE POLICY "Usuarios pueden eliminar sus propias notificaciones"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Solo el rol de servicio puede insertar notificaciones" ON notifications;
CREATE POLICY "Solo el rol de servicio puede insertar notificaciones"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (false);


-- ==============================================================================
-- SECCIÓN 5: VISTAS (VIEWS)
-- ==============================================================================

-- 5.1. Vista analítica para métricas del dashboard del propietario del negocio
CREATE OR REPLACE VIEW vw_dashboard_negocio AS
SELECT
  a.business_id,
  COUNT(*) FILTER (WHERE a.fecha = CURRENT_DATE) AS citas_hoy,
  COUNT(*) FILTER (WHERE a.estado = 'PENDIENTE') AS citas_pendientes,
  COUNT(*) FILTER (WHERE a.estado = 'CONFIRMADA' AND a.fecha = CURRENT_DATE) AS citas_confirmadas_hoy,
  COALESCE(SUM(a.precio_total) FILTER (WHERE a.estado = 'COMPLETADA'), 0) AS ingresos_totales,
  COALESCE(SUM(a.precio_total) FILTER (WHERE a.estado = 'COMPLETADA' AND a.fecha = CURRENT_DATE), 0) AS ingresos_hoy,
  COALESCE(SUM(a.precio_total) FILTER (
    WHERE a.estado = 'COMPLETADA'
    AND a.fecha >= date_trunc('month', CURRENT_DATE)
  ), 0) AS ingresos_mes
FROM appointments a
GROUP BY a.business_id;

COMMENT ON VIEW vw_dashboard_negocio IS 'Métricas clave y consolidados de ventas y reservas para administradores de negocio';

-- 5.2. Vista de historial de citas y servicios prestados por cliente
CREATE OR REPLACE VIEW vw_historial_servicios AS
SELECT
  a.id AS appointment_id,
  a.client_id,
  a.fecha,
  a.hora_inicio,
  a.hora_fin,
  b.nombre_comercial AS negocio,
  CONCAT(sp.nombre, ' ', sp.apellido) AS especialista,
  a.duracion_total_minutos,
  a.precio_total,
  a.moneda,
  a.estado,
  a.metodo_pago,
  ARRAY_AGG(s.nombre) AS servicios
FROM appointments a
INNER JOIN businesses b ON a.business_id = b.id
INNER JOIN specialists sp ON a.specialist_id = sp.id
LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
LEFT JOIN services s ON aps.service_id = s.id
GROUP BY a.id, a.client_id, a.fecha, a.hora_inicio, a.hora_fin,
         b.nombre_comercial, sp.nombre, sp.apellido,
         a.duracion_total_minutos, a.precio_total, a.moneda,
         a.estado, a.metodo_pago;

COMMENT ON VIEW vw_historial_servicios IS 'Historial consolidado de citas con detalle de negocio, especialista y servicios agrupados';


-- ==============================================================================
-- SECCIÓN 6: DATOS SEMILLA (SEED DATA)
-- ==============================================================================

-- Categorías por defecto del mercado de barberías, estética y belleza
INSERT INTO categories (nombre, icono, orden) VALUES
  ('Barbería', 'cut', 1),
  ('Salón de Belleza', 'sparkles', 2),
  ('Spa', 'leaf', 3),
  ('Uñas', 'color-palette', 4),
  ('Peluquería', 'scissors', 5),
  ('Estética', 'flower', 6),
  ('Tatuajes', 'brush', 7),
  ('Maquillaje', 'eye', 8)
ON CONFLICT (nombre) DO NOTHING;
