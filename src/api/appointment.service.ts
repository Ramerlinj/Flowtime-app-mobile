import { supabase } from './supabase';
import { Appointment, AppointmentStatus, PaymentMethod } from './types';

export interface CreateAppointmentPayload {
  businessId: string;
  clientId: string;
  specialistId: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM:SS
  horaFin: string; // HH:MM:SS
  duracionTotalMinutos: number;
  precioTotal: number;
  moneda?: 'DOP' | 'USD';
  metodoPago?: PaymentMethod;
  notas?: string;
  servicios: {
    serviceId: string;
    precio: number;
    duracionMinutos: number;
  }[];
}

export const appointmentService = {
  /**
   * Crear una nueva cita con uno o varios servicios asociados
   */
  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    // 1. Insertar la cita principal
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        business_id: payload.businessId,
        client_id: payload.clientId,
        specialist_id: payload.specialistId,
        fecha: payload.fecha,
        hora_inicio: payload.horaInicio,
        hora_fin: payload.horaFin,
        duracion_total_minutos: payload.duracionTotalMinutos,
        precio_total: payload.precioTotal,
        moneda: payload.moneda || 'DOP',
        estado: 'PENDIENTE',
        metodo_pago: payload.metodoPago || 'PENDIENTE',
        notas: payload.notas || null,
      })
      .select('*, business:businesses(*), specialist:specialists(*)')
      .single();

    if (appointmentError || !appointmentData) {
      throw new Error(
        appointmentError?.message || 'Error al registrar la cita en el sistema.'
      );
    }

    // 2. Asociar los servicios en appointment_services
    if (payload.servicios && payload.servicios.length > 0) {
      const servicesToInsert = payload.servicios.map((s) => ({
        appointment_id: appointmentData.id,
        service_id: s.serviceId,
        precio: s.precio,
        duracion_minutos: s.duracionMinutos,
      }));

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(servicesToInsert);

      if (servicesError) {
        console.warn(
          '[appointmentService] Error al vincular servicios:',
          servicesError.message
        );
      }
    }

    return appointmentData as Appointment;
  },

  /**
   * Obtener las citas agendadas por un cliente
   */
  async getClientAppointments(clientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, business:businesses(*), specialist:specialists(*)')
      .eq('client_id', clientId)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false });

    if (error) {
      console.warn('[appointmentService.getClientAppointments] Error:', error.message);
      return [];
    }

    return (data || []) as Appointment[];
  },

  /**
   * Obtener las citas de un negocio (ej. para la pantalla del Administrador)
   */
  async getBusinessAppointments(
    businessId: string,
    fecha?: string
  ): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*, client:profiles(*), specialist:specialists(*)')
      .eq('business_id', businessId);

    if (fecha) {
      query = query.eq('fecha', fecha);
    }

    const { data, error } = await query
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true });

    if (error) {
      console.warn('[appointmentService.getBusinessAppointments] Error:', error.message);
      return [];
    }

    return (data || []) as Appointment[];
  },

  /**
   * Cambiar el estado de una cita (CONFIRMAR, CANCELAR, COMPLETAR)
   */
  async updateStatus(
    appointmentId: string,
    estado: AppointmentStatus,
    cancelacionMotivo?: string
  ): Promise<boolean> {
    const updateData: any = { estado };
    if (cancelacionMotivo) {
      updateData.cancelacion_motivo = cancelacionMotivo;
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId);

    if (error) {
      throw new Error(error.message || 'Error al actualizar estado de la cita');
    }

    return true;
  },
};
