import { supabase } from './supabase';
import { Business, Category, Service, Specialist, BusinessHours, BusinessPhoto } from './types';

export type { Business, Category, Service, Specialist, BusinessHours, BusinessPhoto };

export const businessService = {
  /**
   * Obtener todas las categorías activas
   */
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.warn('[businessService.getCategories] Error:', error.message);
      return [];
    }

    return (data || []) as Category[];
  },

  /**
   * Obtener lista de negocios activos (con filtro opcional por categoría o búsqueda)
   */
  async getBusinesses(params?: {
    categoriaId?: string;
    search?: string;
  }): Promise<Business[]> {
    let query = supabase
      .from('businesses')
      .select('*, categoria:categories(*)')
      .eq('activo', true)
      .order('rating', { ascending: false });

    if (params?.categoriaId) {
      query = query.eq('categoria_id', params.categoriaId);
    }

    if (params?.search) {
      query = query.ilike('nombre_comercial', `%${params.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[businessService.getBusinesses] Error:', error.message);
      return [];
    }

    return (data || []) as Business[];
  },

  /**
   * Obtener detalle completo de un negocio por su ID
   */
  async getBusinessById(id: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, categoria:categories(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.warn('[businessService.getBusinessById] Error:', error?.message);
      return null;
    }

    return data as Business;
  },

  /**
   * Obtener los servicios que ofrece un negocio
   */
  async getServices(businessId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('activo', true)
      .order('precio', { ascending: true });

    if (error) {
      console.warn('[businessService.getServices] Error:', error.message);
      return [];
    }

    return (data || []) as Service[];
  },

  /**
   * Obtener los especialistas (barberos/estilistas) de un negocio
   */
  async getSpecialists(businessId: string): Promise<Specialist[]> {
    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .eq('business_id', businessId)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.warn('[businessService.getSpecialists] Error:', error.message);
      return [];
    }

    return (data || []) as Specialist[];
  },

  /**
   * Obtener los horarios de atención de un negocio
   */
  async getBusinessHours(businessId: string): Promise<BusinessHours[]> {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId)
      .order('dia_semana', { ascending: true });

    if (error) {
      console.warn('[businessService.getBusinessHours] Error:', error.message);
      return [];
    }

    return (data || []) as BusinessHours[];
  },

  /**
   * Obtener la galería de fotos del negocio
   */
  async getBusinessPhotos(businessId: string): Promise<BusinessPhoto[]> {
    const { data, error } = await supabase
      .from('business_photos')
      .select('*')
      .eq('business_id', businessId)
      .order('orden', { ascending: true });

    if (error) {
      console.warn('[businessService.getBusinessPhotos] Error:', error.message);
      return [];
    }

    return (data || []) as BusinessPhoto[];
  },

  /**
   * Obtener el negocio asociado al usuario propietario (administrador)
   */
  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, categoria:categories(*)')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) {
      console.warn('[businessService.getBusinessByOwnerId] Error:', error.message);
      return null;
    }

    return data as Business | null;
  },

  /**
   * Crear o actualizar la información del negocio
   */
  async saveBusiness(
    business: Partial<Business> & { owner_id: string; nombre_comercial: string }
  ): Promise<Business> {
    if (business.id) {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          nombre_comercial: business.nombre_comercial,
          descripcion: business.descripcion,
          direccion: business.direccion,
          ciudad: business.ciudad,
          telefono: business.telefono,
          instagram: business.instagram,
          tiktok: business.tiktok,
          facebook: business.facebook,
          website: business.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error al actualizar el negocio.');
      }
      return data as Business;
    } else {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: business.owner_id,
          nombre_comercial: business.nombre_comercial,
          descripcion: business.descripcion,
          direccion: business.direccion,
          ciudad: business.ciudad || 'Santo Domingo',
          telefono: business.telefono,
          instagram: business.instagram,
          tiktok: business.tiktok,
          activo: true,
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error al crear el negocio.');
      }
      return data as Business;
    }
  },

  /**
   * Obtener todos los servicios del negocio (activos e inactivos) para el panel de administración
   */
  async getAllServicesForAdmin(businessId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[businessService.getAllServicesForAdmin] Error:', error.message);
      return [];
    }

    return (data || []) as Service[];
  },

  /**
   * Crear un nuevo servicio en el catálogo
   */
  async createService(payload: {
    business_id: string;
    nombre: string;
    descripcion?: string | null;
    duracion_minutos: number;
    precio: number;
    moneda?: 'DOP' | 'USD';
    imagen_url?: string | null;
  }): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        business_id: payload.business_id,
        nombre: payload.nombre.trim(),
        descripcion: payload.descripcion?.trim() || null,
        duracion_minutos: payload.duracion_minutos,
        precio: payload.precio,
        moneda: payload.moneda || 'DOP',
        imagen_url: payload.imagen_url || null,
        activo: true,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al crear el servicio.');
    }

    return data as Service;
  },

  /**
   * Actualizar un servicio existente
   */
  async updateService(
    serviceId: string,
    updates: Partial<{
      nombre: string;
      descripcion: string | null;
      duracion_minutos: number;
      precio: number;
      moneda: 'DOP' | 'USD';
      activo: boolean;
      imagen_url: string | null;
    }>
  ): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar el servicio.');
    }

    return data as Service;
  },

  /**
   * Eliminar un servicio (o desactivar)
   */
  async deleteService(serviceId: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      throw new Error(error.message || 'Error al eliminar el servicio.');
    }
  },

  /**
   * Crear un nuevo especialista en el equipo del negocio
   */
  async createSpecialist(payload: {
    business_id: string;
    nombre: string;
    apellido?: string;
    especialidad?: string;
    foto?: string;
  }): Promise<Specialist> {
    const { data, error } = await supabase
      .from('specialists')
      .insert({
        business_id: payload.business_id,
        nombre: payload.nombre.trim(),
        apellido: payload.apellido?.trim() || '',
        especialidad: payload.especialidad?.trim() || 'Especialista',
        foto: payload.foto || null,
        activo: true,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al registrar especialista.');
    }

    return data as Specialist;
  },

  /**
   * Actualizar los datos o estado de un especialista
   */
  async updateSpecialist(
    specialistId: string,
    updates: Partial<{
      nombre: string;
      apellido: string;
      especialidad: string;
      foto: string;
      activo: boolean;
    }>
  ): Promise<Specialist> {
    const { data, error } = await supabase
      .from('specialists')
      .update(updates)
      .eq('id', specialistId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar especialista.');
    }

    return data as Specialist;
  },

  /**
   * Eliminar un especialista del equipo
   */
  async deleteSpecialist(specialistId: string): Promise<void> {
    const { error } = await supabase
      .from('specialists')
      .delete()
      .eq('id', specialistId);

    if (error) {
      throw new Error(error.message || 'Error al eliminar especialista.');
    }
  },

  /**
   * Guardar o actualizar horarios de negocio
   */
  async saveBusinessHours(
    businessId: string,
    hours: {
      dia_semana: number;
      hora_apertura: string | null;
      hora_cierre: string | null;
      cerrado: boolean;
    }[]
  ): Promise<void> {
    const records = hours.map((h) => ({
      business_id: businessId,
      dia_semana: h.dia_semana,
      hora_apertura: h.hora_apertura,
      hora_cierre: h.hora_cierre,
      cerrado: h.cerrado,
    }));

    const { error } = await supabase
      .from('business_hours')
      .upsert(records, { onConflict: 'business_id,dia_semana' });

    if (error) {
      console.warn('[businessService.saveBusinessHours] Error:', error.message);
    }
  },
};
