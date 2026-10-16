import { supabase } from './supabase';
import { Business, Category, Service, Specialist, BusinessHours, BusinessPhoto } from './types';

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
};
