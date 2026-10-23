import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { businessService } from '@/api/business.service';
import { appointmentService } from '@/api/appointment.service';
import { Business, Appointment, Specialist } from '@/api/types';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { CustomSwitch } from '@/components/common/CustomSwitch';
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav';
import { BusinessSetupCard } from '@/components/admin/BusinessSetupCard';
import { BusinessSetupGuideModal } from '@/components/admin/BusinessSetupGuideModal';

// Tipos para las Citas del Cronograma
export type AppointmentStatus =
  | 'pendiente'
  | 'en_curso'
  | 'completada'
  | 'no_asistio'
  | 'cancelada';

export interface AdminAppointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  price: number;
  note?: string;
  status: AppointmentStatus;
  barberName: string;
  dayIndex: number; // Índice del día (0 para Lun 10, etc.)
}

interface AgendaDay {
  dayName: string;
  dayNumber: number;
  month: string;
  isoDate: string;
  appointmentsCount: number;
}

const generateAgendaDays = (): AgendaDay[] => {
  const days: AgendaDay[] = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay();
    const dayNumber = d.getDate();
    const monthIndex = d.getMonth();
    const yyyy = d.getFullYear();
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(dayNumber).padStart(2, '0');
    days.push({
      dayName: dayNames[dayOfWeek],
      dayNumber,
      month: monthNames[monthIndex],
      isoDate: `${yyyy}-${mm}-${dd}`,
      appointmentsCount: 0,
    });
  }
  return days;
};

const INITIAL_AGENDA_DAYS: AgendaDay[] = generateAgendaDays();

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { showWarning, showSuccess, showError } = useAlert();
  const { user } = useAuth();

  // Estados de Navegación y Agenda
  const [agendaDays, setAgendaDays] = useState<AgendaDay[]>(INITIAL_AGENDA_DAYS);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState<boolean>(false);

  // Estados para Modal de Jornada
  const [jornadaDays, setJornadaDays] = useState([
    { day: 'Lunes', hours: '9:00 AM - 9:00 PM', active: true, hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
    { day: 'Martes', hours: '9:00 AM - 9:00 PM', active: true, hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
    { day: 'Miercoles', hours: '9:00 AM - 9:00 PM', active: true, hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
    { day: 'Jueves', hours: '9:00 AM - 9:00 PM', active: true, hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
    { day: 'Viernes', hours: '9:00 AM - 9:00 PM', active: true, hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
    { day: 'Sábado', hours: '9:00 AM - 9:00 PM', active: true, hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
    { day: 'Domingo', hours: 'Día Libre / Cerrado', active: false, hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
  ]);

  const toggleJornadaDay = (index: number, newValue: boolean) => {
    setJornadaDays((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              active: newValue,
              hours: newValue ? '9:00 AM - 9:00 PM' : 'Día Libre / Cerrado',
            }
          : item
      )
    );
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchAgenda() {
      if (!user?.id) return;
      try {
        const biz = await businessService.getBusinessByOwnerId(user.id);
        if (isMounted) {
          setBusiness(biz);

          // Si el usuario es negocio pero no tiene local registrado o configurado, abrir asistente de pasos
          if (!biz || !biz.nombre_comercial) {
            setIsSetupGuideOpen(true);
            return;
          }

          const [rawAppointments, rawSpecialists, rawHours] = await Promise.all([
            appointmentService.getBusinessAppointments(biz.id),
            businessService.getSpecialists(biz.id),
            businessService.getBusinessHours(biz.id),
          ]);

          if (isMounted && rawSpecialists) {
            setSpecialists(rawSpecialists);
          }

          if (isMounted && rawHours && rawHours.length > 0) {
            const daysNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'];
            const orderedIdxs = [1, 2, 3, 4, 5, 6, 0];
            const mappedDays = orderedIdxs.map((dNum) => {
              const h = rawHours.find((item) => item.dia_semana === dNum);
              const isActive = h ? !h.cerrado : dNum !== 0;
              const openH = h?.hora_apertura ? h.hora_apertura.slice(0, 5) : '09:00';
              const closeH = h?.hora_cierre ? h.hora_cierre.slice(0, 5) : '21:00';
              return {
                day: daysNames[dNum],
                hours: isActive ? `${openH} - ${closeH}` : 'Día Libre / Cerrado',
                active: isActive,
                hora_apertura: h?.hora_apertura || '09:00:00',
                hora_cierre: h?.hora_cierre || '21:00:00',
              };
            });
            setJornadaDays(mappedDays);
          }

          if (rawAppointments && rawAppointments.length > 0 && isMounted) {
            const freshDays = generateAgendaDays();

            const mapped: AdminAppointment[] = rawAppointments.map((a: Appointment) => {
              const dayIdx = freshDays.findIndex((d) => d.isoDate === a.fecha);
              const statusMap: Record<string, AppointmentStatus> = {
                PENDIENTE: 'pendiente',
                CONFIRMADA: 'en_curso',
                COMPLETADA: 'completada',
                CANCELADA: 'cancelada',
                NO_ASISTIO: 'no_asistio',
              };

              const clientName = a.client
                ? `${a.client.nombre} ${a.client.apellido || ''}`.trim()
                : 'Cliente';

              return {
                id: a.id,
                clientName,
                service: 'Servicio Flowtime',
                time: a.hora_inicio ? a.hora_inicio.slice(0, 5) : '12:00 PM',
                price: Number(a.precio_total) || 300,
                note: a.notas || '',
                status: statusMap[a.estado] || 'pendiente',
                barberName: a.specialist ? `${a.specialist.nombre}` : 'Especialista',
                dayIndex: dayIdx !== -1 ? dayIdx : 0,
              };
            });

            freshDays.forEach((d, idx) => {
              d.appointmentsCount = mapped.filter((app) => app.dayIndex === idx).length;
            });

            setAgendaDays(freshDays);
            setAppointments(mapped);
          }
        }
      } catch (err) {
        console.warn('[AdminHomeScreen] Error cargando citas:', err);
      }
    }
    fetchAgenda();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      try {
        const biz = await businessService.getBusinessByOwnerId(user.id);
        if (biz) {
          setBusiness(biz);
          const rawAppointments = await appointmentService.getBusinessAppointments(biz.id);
          if (rawAppointments && rawAppointments.length > 0) {
            const freshDays = generateAgendaDays();
            const mapped: AdminAppointment[] = rawAppointments.map((a: Appointment) => {
              const dayIdx = freshDays.findIndex((d) => d.isoDate === a.fecha);
              const statusMap: Record<string, AppointmentStatus> = {
                PENDIENTE: 'pendiente',
                CONFIRMADA: 'en_curso',
                COMPLETADA: 'completada',
                CANCELADA: 'cancelada',
                NO_ASISTIO: 'no_asistio',
              };
              const clientName = a.client
                ? `${a.client.nombre} ${a.client.apellido || ''}`.trim()
                : 'Cliente';
              return {
                id: a.id,
                clientName,
                service: 'Servicio Flowtime',
                time: a.hora_inicio ? a.hora_inicio.slice(0, 5) : '12:00 PM',
                price: Number(a.precio_total) || 300,
                note: a.notas || '',
                status: statusMap[a.estado] || 'pendiente',
                barberName: a.specialist ? `${a.specialist.nombre}` : 'Especialista',
                dayIndex: dayIdx !== -1 ? dayIdx : 0,
              };
            });
            freshDays.forEach((d, idx) => {
              d.appointmentsCount = mapped.filter((app) => app.dayIndex === idx).length;
            });
            setAgendaDays(freshDays);
            setAppointments(mapped);
          }
        }
      } catch (err) {
        console.warn('[AdminHomeScreen] Error en onRefresh:', err);
      }
    }
    setRefreshing(false);
  };

  // Estados de Modales
  const [isManualModalVisible, setIsManualModalVisible] = useState<boolean>(false);
  const [isBlockModalVisible, setIsBlockModalVisible] = useState<boolean>(false);
  const [isJornadaModalVisible, setIsJornadaModalVisible] = useState<boolean>(false);

  // Estados para Modal de Bloqueos (media_1790714211945.png)
  const [blockDayIndex, setBlockDayIndex] = useState<number>(0);
  const [blockTime, setBlockTime] = useState<string>('1:00 PM - 2:00 PM');
  const [blockReason, setBlockReason] = useState<string>('Almuerzo / Descanso');
  const [blockNote, setBlockNote] = useState<string>('');



  // Estado formulario Cita Manual
  const [manualClientName, setManualClientName] = useState<string>('');
  const [manualService, setManualService] = useState<string>('Taper Fade');
  const [manualPrice, setManualPrice] = useState<string>('300');
  const [manualTime, setManualTime] = useState<string>('3:00 PM');
  const [manualNote, setManualNote] = useState<string>('');

  // Filtrar citas del día seleccionado
  const dayAppointments = appointments.filter((a) => a.dayIndex === selectedDayIndex);

  // Métricas calculadas reales
  const todayAppointmentsCount = appointments.filter((a) => a.dayIndex === 0).length;
  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'pendiente').length;
  const totalIncomeWeek = appointments.reduce((sum, a) => sum + a.price, 0);

  // Actualizar estado de una cita en BD y localmente
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      try {
        const reverseMap: Record<AppointmentStatus, 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO'> = {
          pendiente: 'PENDIENTE',
          en_curso: 'CONFIRMADA',
          completada: 'COMPLETADA',
          cancelada: 'CANCELADA',
          no_asistio: 'NO_ASISTIO',
        };
        await appointmentService.updateStatus(id, reverseMap[newStatus]);
        showSuccess('Cita actualizada', `El estado se ha cambiado a ${newStatus}.`);
      } catch (err) {
        console.warn('Error al actualizar estado en Supabase:', err);
      }
    }
  };

  // Registrar Cita Manual (Cliente presencial)
  const handleRegisterManualAppointment = () => {
    if (!manualClientName.trim()) {
      showWarning('Nombre requerido', 'Por favor ingresa el nombre del cliente presencial.');
      return;
    }

    const newApp: AdminAppointment = {
      id: Date.now().toString(),
      clientName: manualClientName.trim(),
      service: manualService,
      time: manualTime,
      price: parseInt(manualPrice, 10) || 300,
      note: manualNote.trim(),
      status: 'en_curso',
      barberName: 'Diego Tejeda',
      dayIndex: selectedDayIndex,
    };

    setAppointments((prev) => [newApp, ...prev]);
    setIsManualModalVisible(false);
    setManualClientName('');
    setManualNote('');
    showSuccess('Cita Registrada', `Se ha agendado la cita de ${newApp.clientName} en el cronograma.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Fondo Gradiente Principal */}
      <LinearGradient
        colors={isDark ? Gradients.backgroundDark : Gradients.backgroundLight}
        locations={isDark ? Gradients.backgroundDarkLocations : Gradients.backgroundLightLocations}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
            paddingBottom: insets.bottom + 90,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C89C25"
            colors={['#C89C25']}
          />
        }
        showsVerticalScrollIndicator={false}>
        {/* Cabecera Superior: Logo Flowtime */}
        <View style={styles.topHeaderRow}>
          <Image
            source={require('@/assets/images/flowtime-logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        {/* Card 1: Dashboard Dorado con Métricas */}
        <LinearGradient
          colors={['#B8860B', '#F3DA80', '#D4AF37']}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.dashboardCard, Shadows.goldButtonDrop]}>
          <Text style={styles.dashboardTitle}>
            {business?.nombre_comercial ? `Dashboard · ${business.nombre_comercial}` : 'Dashboard'}
          </Text>
          <Text style={styles.dashboardSubtitle}>
            Panel con citas, métricas y accesos rápidos
          </Text>

          <View style={styles.dashboardDivider} />

          <View style={styles.metricsRow}>
            {/* Métrica 1 */}
            <View style={styles.metricCol}>
              <Text style={styles.metricNumber}>
                {String(todayAppointmentsCount).padStart(2, '0')}
              </Text>
              <Text style={styles.metricLabel}>Citas de hoy</Text>
              <Text style={styles.metricSub}>Agendadas</Text>
            </View>

            {/* Métrica 2 */}
            <View style={styles.metricCol}>
              <Text style={styles.metricNumber}>
                {String(pendingAppointmentsCount).padStart(2, '0')}
              </Text>
              <Text style={styles.metricLabel}>Pendientes</Text>
              <Text style={styles.metricSub}>Por confirmar</Text>
            </View>

            {/* Métrica 3 */}
            <View style={styles.metricCol}>
              <View style={styles.metricIncomeRow}>
                <Text style={styles.metricNumber}>
                  {totalIncomeWeek.toLocaleString('es-DO')}
                </Text>
                <Text style={styles.metricDop}>DOP</Text>
              </View>
              <Text style={styles.metricLabel}>Ingresos</Text>
              <Text style={styles.metricSub}>Semana Actual</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Guía de Configuración del Negocio */}
        <BusinessSetupCard
          business={business}
          onPressSetup={() => setIsSetupGuideOpen(true)}
        />

        {/* Card 2: Navegador de Agenda */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.agendaHeaderRow}>
            <View style={styles.agendaHeaderLeft}>
              <Ionicons
                name="calendar-outline"
                size={17}
                color="#B8860B"
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.agendaHeaderTitle, { color: colors.textPrimary }]}>
                Navegador de Agenda
              </Text>
            </View>
            <Text style={styles.agendaHeaderRight}>
              {selectedDayIndex === 0 ? 'Mostrando: Hoy' : `Día ${selectedDayIndex + 1}`}
            </Text>
          </View>

          {/* Carrusel de Días con contador de personas agendadas abajo */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.agendaDaysContainer}>
            {agendaDays.map((day, index) => {
              const isSelected = selectedDayIndex === index;

              return (
                <TouchableOpacity
                  key={`${day.dayName}-${day.dayNumber}`}
                  onPress={() => setSelectedDayIndex(index)}
                  activeOpacity={0.85}
                  style={styles.dayPillWrapper}>
                  {isSelected ? (
                    <LinearGradient
                      colors={['#BA831B', '#D4AF37']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[styles.dayPillSelected, Shadows.drop]}>
                      <Text style={styles.dayPillNameSelected}>{day.dayName}</Text>
                      <Text style={styles.dayPillNumberSelected}>{day.dayNumber}</Text>
                      <Text style={styles.dayPillMonthSelected}>{day.month}</Text>
                      <Text style={styles.dayPillCountSelected}>{day.appointmentsCount}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.dayPillUnselected,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2EADC',
                        },
                        Shadows.drop,
                      ]}>
                      <Text style={[styles.dayPillName, { color: colors.textSecondary }]}>
                        {day.dayName}
                      </Text>
                      <Text style={[styles.dayPillNumber, { color: colors.textPrimary }]}>
                        {day.dayNumber}
                      </Text>
                      <Text style={[styles.dayPillMonth, { color: colors.textSecondary }]}>
                        {day.month}
                      </Text>
                      <Text style={[styles.dayPillCount, { color: colors.textPrimary }]}>
                        {day.appointmentsCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Fila de Botones: Bloquear horario y Jornada */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => setIsBlockModalVisible(true)}
            activeOpacity={0.8}
            style={[
              styles.actionPillButton,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={colors.textPrimary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.actionPillText, { color: colors.textPrimary }]}>
              Bloquear horario
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsJornadaModalVisible(true)}
            activeOpacity={0.8}
            style={[
              styles.actionPillButton,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <Ionicons
              name="hourglass-outline"
              size={15}
              color="#B8860B"
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.actionPillText, { color: '#B8860B' }]}>
              Jornada
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card 3: Estado de Barberos en Turno */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.barbersHeaderRow}>
            <View style={styles.barbersHeaderLeft}>
              <View
                style={[
                  styles.greenDot,
                  { backgroundColor: specialists.some((s) => s.activo) ? '#188E1C' : '#9E9E9E' },
                ]}
              />
              <Text style={styles.barbersHeaderTitle}>
                ESTADO DE BARBEROS EN TURNO
              </Text>
            </View>

            <View style={styles.activeBarbersBadge}>
              <Text style={styles.activeBarbersBadgeText}>
                {specialists.length > 0
                  ? `${specialists.filter((s) => s.activo).length} de ${specialists.length} activos`
                  : '0 activos'}
              </Text>
            </View>
          </View>

          {/* Subcard del Barbero o Estado Vacío */}
          {specialists.length > 0 ? (
            specialists.map((spec) => (
              <View key={spec.id} style={styles.barberSubCard}>
                <View style={styles.barberAvatarCircle}>
                  <Text style={styles.barberAvatarText}>
                    {`${spec.nombre?.[0] || 'B'}${spec.apellido?.[0] || ''}`.toUpperCase()}
                  </Text>
                  <View
                    style={[
                      styles.barberStatusDot,
                      { backgroundColor: spec.activo ? '#188E1C' : '#9E9E9E' },
                    ]}
                  />
                </View>

                <View style={styles.barberInfoCol}>
                  <Text style={[styles.barberName, { color: colors.textPrimary }]}>
                    {`${spec.nombre} ${spec.apellido || ''}`.trim()}
                  </Text>
                  <Text style={[styles.barberSubtitle, { color: colors.textSecondary }]}>
                    {spec.activo ? (spec.especialidad || 'Disponible para citas hoy') : 'Fuera de turno'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setSpecialists((prev) =>
                      prev.map((s) => (s.id === spec.id ? { ...s, activo: !s.activo } : s))
                    );
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.turnButton,
                    { backgroundColor: spec.activo ? '#2E9D47' : '#9E9E9E' },
                  ]}>
                  <Text style={styles.turnButtonText}>
                    {spec.activo ? 'En turno' : 'Pausado'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={{ paddingVertical: 14, alignItems: 'center', gap: 6 }}>
              <Text style={[{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }]}>
                Aún no has registrado profesionales en tu equipo.
              </Text>
              <TouchableOpacity
                onPress={() => setIsSetupGuideOpen(true)}
                activeOpacity={0.8}
                style={{ paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.2)' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#BA8609' }}>
                  + Agregar Barbero
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sección: Cronograma de Hoy */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.cronogramaTitle, { color: colors.textPrimary }]}>
            Cronograma de Hoy
          </Text>
          <Text style={[styles.cronogramaSubtitle, { color: colors.textSecondary }]}>
            {dayAppointments.length} Bloques en el día
          </Text>
        </View>

        {/* Estado Vacío (Sin Citas) si count === 0 */}
        {dayAppointments.length === 0 ? (
          <View
            style={[
              styles.card,
              styles.emptyCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={26} color="#B8860B" />
            </View>

            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Sin citas agendadas para este día
            </Text>

            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Tu horario está completamente libre. Puedes registrar una cita manual o bloquear turnos personales.
            </Text>

            <View style={styles.emptyButtonsRow}>
              <TouchableOpacity
                onPress={() => setIsManualModalVisible(true)}
                activeOpacity={0.88}
                style={styles.emptyCitaButton}>
                <LinearGradient
                  colors={['#B8860B', '#F3DA80', '#D4AF37']}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.emptyCitaGradient, Shadows.goldButtonDrop]}>
                  <Text style={styles.emptyCitaText}>+ Cita Manual</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsBlockModalVisible(true)}
                activeOpacity={0.8}
                style={[styles.emptyBlockButton, { borderColor: '#E5C365' }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color="#B8860B"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.emptyBlockText}>Bloquear horario</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Lista de Citas con Estados del Componente 139, 137, 143, 141 */
          <View style={styles.appointmentsList}>
            {dayAppointments.map((app) => (
              <View
                key={app.id}
                style={[
                  styles.card,
                  styles.appointmentCard,
                  { backgroundColor: colors.card },
                  Shadows.drop,
                ]}>
                {/* Cabecera de la Cita */}
                <View style={styles.appCardHeader}>
                  <View style={styles.appTimeLeft}>
                    <Ionicons
                      name="hourglass-outline"
                      size={15}
                      color="#B8860B"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.appTimeText}>{app.time}</Text>

                    {/* Badge En curso si aplica */}
                    {app.status === 'en_curso' && (
                      <View style={styles.enCursoBadge}>
                        <Text style={styles.enCursoBadgeText}>En curso</Text>
                      </View>
                    )}
                  </View>

                  {/* Badges de Estado */}
                  <View style={styles.appStatusBadgeRight}>
                    {app.status === 'en_curso' && (
                      <View style={styles.confirmadaBadge}>
                        <Text style={styles.confirmadaBadgeText}>Confirmada</Text>
                      </View>
                    )}
                    {app.status === 'no_asistio' && (
                      <View style={styles.noAsistioBadge}>
                        <Text style={styles.noAsistioBadgeText}>No asistió</Text>
                      </View>
                    )}
                    {app.status === 'cancelada' && (
                      <View style={styles.canceladaBadge}>
                        <Text style={styles.canceladaBadgeText}>Cancelada</Text>
                      </View>
                    )}
                    {app.status === 'completada' && (
                      <View style={styles.completadaBadge}>
                        <Text style={styles.completadaBadgeText}>Completada</Text>
                      </View>
                    )}
                    {app.status === 'pendiente' && (
                      <Text style={styles.appPrice}>DOP {app.price}</Text>
                    )}
                  </View>
                </View>

                {/* Info Cliente */}
                <View style={styles.appClientRow}>
                  <View style={styles.clientInitialCircle}>
                    <Text style={styles.clientInitialText}>
                      {app.clientName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.clientTextCol}>
                    <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                      {app.clientName}
                    </Text>
                    <Text style={[styles.clientService, { color: colors.textSecondary }]}>
                      {app.service}
                    </Text>
                    {app.note ? (
                      <Text style={[styles.clientNote, { color: colors.textSecondary }]}>
                        Nota: {app.note}
                      </Text>
                    ) : null}
                  </View>

                  {app.status !== 'pendiente' && (
                    <Text style={styles.appPrice}>DOP {app.price}</Text>
                  )}
                </View>

                {/* Botones según Estado */}
                {/* 1. Pendiente */}
                {app.status === 'pendiente' && (
                  <View style={styles.appActionsRow}>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(app.id, 'en_curso')}
                      activeOpacity={0.85}
                      style={styles.confirmButton}>
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color="#FFFFFF"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(app.id, 'cancelada')}
                      activeOpacity={0.85}
                      style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 2. En curso */}
                {app.status === 'en_curso' && (
                  <View style={styles.appActionsRow}>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(app.id, 'completada')}
                      activeOpacity={0.85}
                      style={styles.completadaActionButton}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#FFFFFF"
                        style={{ marginRight: 3 }}
                      />
                      <Text style={styles.completadaActionButtonText}>Completada</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(app.id, 'no_asistio')}
                      activeOpacity={0.85}
                      style={styles.noAsistioActionButton}>
                      <Ionicons
                        name="person-outline"
                        size={13}
                        color="#B8860B"
                        style={{ marginRight: 3 }}
                      />
                      <Text style={styles.noAsistioActionButtonText}>No asistió</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(app.id, 'cancelada')}
                      activeOpacity={0.85}
                      style={styles.cancelButtonMini}>
                      <Text style={styles.cancelButtonMiniText}>Cancelar Cita</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3. No asistió */}
                {app.status === 'no_asistio' && (
                  <View style={styles.appFooterBetween}>
                    <Text style={[styles.clientStatusHint, { color: colors.textSecondary }]}>
                      Cliente no asistió
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(app.id, 'en_curso')}
                      activeOpacity={0.8}
                      style={styles.reactivateButton}>
                      <Ionicons
                        name="refresh-outline"
                        size={14}
                        color="#B8860B"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.reactivateButtonText}>Reactivar cita</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 4. Cancelada */}
                {app.status === 'cancelada' && (
                  <View style={styles.appFooterBetween}>
                    <View />
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(app.id, 'en_curso')}
                      activeOpacity={0.8}
                      style={styles.reactivateButton}>
                      <Ionicons
                        name="refresh-outline"
                        size={14}
                        color="#B8860B"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.reactivateButtonText}>Reactivar cita</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 5. Completada */}
                {app.status === 'completada' && (
                  <View style={styles.appFooterBetween}>
                    <Text style={styles.cobradoHintText}>
                      Cobrado e ingresado a tus métricas
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Botón Flotante FAB: + Cita Manual (para clientes presenciales) */}
      <TouchableOpacity
        onPress={() => setIsManualModalVisible(true)}
        activeOpacity={0.88}
        style={[styles.fabCitaManualWrapper, { bottom: insets.bottom + 74 }]}>
        <LinearGradient
          colors={['#BA8609', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fabCitaManual, Shadows.goldButtonDrop]}>
          <Text style={styles.fabCitaManualText}>+ Cita Manual</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal: Registrar Cita Manual (Clientes Presenciales) */}
      <Modal
        visible={isManualModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsManualModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Nueva Cita Manual
              </Text>
              <TouchableOpacity
                onPress={() => setIsManualModalVisible(false)}
                style={styles.modalCloseIcon}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Registra clientes presenciales que llegan directamente al local.
            </Text>

            {/* Input Nombre Cliente */}
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
              Nombre del Cliente
            </Text>
            <TextInput
              value={manualClientName}
              onChangeText={setManualClientName}
              placeholder="Ej: Marcos Pérez"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#EFEAE1',
                  color: colors.textPrimary,
                },
              ]}
            />

            {/* Servicio */}
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
              Servicio
            </Text>
            <View style={styles.pillOptionsRow}>
              {['Taper Fade', 'Corte + Barba', 'Cerquillo'].map((srv) => (
                <TouchableOpacity
                  key={srv}
                  onPress={() => {
                    setManualService(srv);
                    setManualPrice(srv === 'Corte + Barba' ? '700' : '300');
                  }}
                  style={[
                    styles.optionPill,
                    manualService === srv
                      ? styles.optionPillActive
                      : {
                          backgroundColor: isDark ? '#2C2C2E' : '#EFEAE1',
                        },
                  ]}>
                  <Text
                    style={[
                      styles.optionPillText,
                      manualService === srv
                        ? styles.optionPillTextActive
                        : { color: colors.textPrimary },
                    ]}>
                    {srv}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Horario */}
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
              Horario asignado
            </Text>
            <View style={styles.pillOptionsRow}>
              {['Ahora mismo', '3:00 PM', '4:30 PM', '6:00 PM'].map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setManualTime(slot === 'Ahora mismo' ? 'En turno' : slot)}
                  style={[
                    styles.optionPill,
                    manualTime === (slot === 'Ahora mismo' ? 'En turno' : slot)
                      ? styles.optionPillActive
                      : {
                          backgroundColor: isDark ? '#2C2C2E' : '#EFEAE1',
                        },
                  ]}>
                  <Text
                    style={[
                      styles.optionPillText,
                      manualTime === (slot === 'Ahora mismo' ? 'En turno' : slot)
                        ? styles.optionPillTextActive
                        : { color: colors.textPrimary },
                    ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botón de Guardar */}
            <TouchableOpacity
              onPress={handleRegisterManualAppointment}
              activeOpacity={0.88}
              style={styles.modalSubmitWrapper}>
              <LinearGradient
                colors={['#B8860B', '#F3DA80', '#D4AF37']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.modalSubmitButton, Shadows.goldButtonDrop]}>
                <Text style={styles.modalSubmitText}>Registrar Cita</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Gestión de Bloqueos (Figma: media_1790714211945.png) */}
      <Modal
        visible={isBlockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBlockModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.blockModalCard,
              { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
              Shadows.drop,
            ]}>
            {/* Cabecera del Bloqueo */}
            <View style={styles.bloqueoHeaderRow}>
              <View style={styles.bloqueoIconBadge}>
                <Ionicons name="lock-closed" size={20} color="#BA8609" />
              </View>
              <View style={styles.bloqueoHeaderTextCol}>
                <Text style={[styles.bloqueoHeaderTitle, { color: colors.textPrimary }]}>
                  Gestión de Bloqueos
                </Text>
                <Text style={[styles.bloqueoHeaderSub, { color: colors.textSecondary }]}>
                  Bloquear horarios, días o cancelar bloqueos
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsBlockModalVisible(false)}
                style={styles.modalCloseIcon}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Card: Fecha para el bloqueo */}
            <View
              style={[
                styles.bloqueoDateCard,
                { backgroundColor: isDark ? '#26221A' : '#FFFFFF' },
                Shadows.drop,
              ]}>
              <View style={styles.bloqueoDateHeader}>
                <View style={styles.bloqueoDateHeaderLeft}>
                  <Ionicons name="calendar-outline" size={15} color="#BA8609" />
                  <Text style={[styles.bloqueoDateTitle, { color: colors.textPrimary }]}>
                    Fecha para el bloqueo
                  </Text>
                </View>
                <Text style={styles.bloqueoDateHint}>
                  Mostrando: {blockDayIndex === 0 ? 'Hoy' : agendaDays[blockDayIndex]?.dayName + ' ' + agendaDays[blockDayIndex]?.dayNumber}
                </Text>
              </View>

              {/* 7 Días */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bloqueoDaysRow}>
                {agendaDays.map((day, idx) => {
                  const isSelected = blockDayIndex === idx;
                  return (
                    <TouchableOpacity
                      key={`block-day-${day.dayName}-${day.dayNumber}`}
                      onPress={() => setBlockDayIndex(idx)}
                      activeOpacity={0.8}
                      style={[
                        styles.bloqueoDayPill,
                        isSelected
                          ? styles.bloqueoDayPillActive
                          : { backgroundColor: isDark ? '#1C1914' : '#F5EFE6' },
                      ]}>
                      <Text
                        style={[
                          styles.bloqueoDayName,
                          isSelected ? styles.bloqueoDayTextActive : { color: colors.textSecondary },
                        ]}>
                        {day.dayName}
                      </Text>
                      <Text
                        style={[
                          styles.bloqueoDayNumber,
                          isSelected ? styles.bloqueoDayTextActive : { color: colors.textPrimary },
                        ]}>
                        {day.dayNumber}
                      </Text>
                      <Text
                        style={[
                          styles.bloqueoDayMonth,
                          isSelected ? styles.bloqueoDayTextActive : { color: colors.textSecondary },
                        ]}>
                        {day.month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Card: Selecciona la hora */}
            <View
              style={[
                styles.bloqueoHourCard,
                { backgroundColor: isDark ? '#26221A' : '#FFFFFF' },
                Shadows.drop,
              ]}>
              <View style={styles.bloqueoHourLeft}>
                <Ionicons name="hourglass-outline" size={16} color="#BA8609" style={{ marginRight: 8 }} />
                <Text style={[styles.bloqueoHourLabel, { color: colors.textPrimary }]}>
                  {blockTime || 'Selecciona la hora'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  const times = [
                    '1:00 PM - 2:00 PM',
                    '2:00 PM - 3:00 PM',
                    '3:00 PM - 4:00 PM',
                    '12:00 PM - 1:00 PM',
                    'Todo el día',
                  ];
                  const nextIdx = (times.indexOf(blockTime) + 1) % times.length;
                  setBlockTime(times[nextIdx]);
                }}
                activeOpacity={0.8}
                style={styles.bloqueoSelectHourBtn}>
                <Text style={styles.bloqueoSelectHourBtnText}>Seleccionar</Text>
              </TouchableOpacity>
            </View>

            {/* Título: Selecciona el Motivo */}
            <Text style={[styles.bloqueoSectionTitle, { color: colors.textPrimary }]}>
              Selecciona el Motivo
            </Text>

            {/* 5 Motivos */}
            <View style={styles.bloqueoMotivosList}>
              {[
                'Almuerzo / Descanso',
                'Cita Médica / Personal',
                'Capacitación / Trámite',
                'Imprevisto de Emergencia',
                'Mantenimiento del Local',
              ].map((motivo) => {
                const isSelected = blockReason === motivo;
                return (
                  <TouchableOpacity
                    key={motivo}
                    onPress={() => setBlockReason(motivo)}
                    activeOpacity={0.8}
                    style={[
                      styles.bloqueoMotivoPill,
                      isSelected
                        ? styles.bloqueoMotivoPillActive
                        : [
                            { backgroundColor: isDark ? '#26221A' : '#FFFFFF' },
                            Shadows.drop,
                          ],
                    ]}>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                    ) : (
                      <Ionicons
                        name="hourglass-outline"
                        size={15}
                        color="#BA8609"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.bloqueoMotivoText,
                        isSelected ? styles.bloqueoMotivoTextActive : { color: colors.textPrimary },
                      ]}>
                      {motivo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nota opcional */}
            <TextInput
              value={blockNote}
              onChangeText={setBlockNote}
              placeholder="Nota opcional"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.bloqueoNoteInput,
                {
                  backgroundColor: isDark ? '#26221A' : '#FAF7F2',
                  borderColor: isDark ? '#3D372A' : '#E3DBD0',
                  color: colors.textPrimary,
                },
              ]}
            />

            {/* Botones Cancelar & Bloquear Turno */}
            <View style={styles.bloqueoActionsRow}>
              <TouchableOpacity
                onPress={() => setIsBlockModalVisible(false)}
                activeOpacity={0.8}
                style={[
                  styles.bloqueoCancelBtn,
                  { backgroundColor: isDark ? '#26221A' : '#FAF7F2' },
                ]}>
                <Text style={styles.bloqueoCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsBlockModalVisible(false);
                  showSuccess(
                    'Turno Bloqueado',
                    `Se ha bloqueado "${blockReason}" (${blockTime}) para ${agendaDays[blockDayIndex]?.dayName} ${agendaDays[blockDayIndex]?.dayNumber}.`
                  );
                }}
                activeOpacity={0.88}
                style={[styles.bloqueoSubmitBtn, Shadows.goldButtonDrop]}>
                <Ionicons
                  name="lock-closed"
                  size={15}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.bloqueoSubmitBtnText}>Bloquear Turno</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Configuración de Jornada (Figma: media_1790714229080.png) */}
      <Modal
        visible={isJornadaModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsJornadaModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.jornadaModalCard,
              { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
              Shadows.drop,
            ]}>
            {/* Cabecera de la Jornada */}
            <View style={styles.bloqueoHeaderRow}>
              <View style={styles.bloqueoIconBadge}>
                <Ionicons name="hourglass-outline" size={20} color="#BA8609" />
              </View>
              <View style={styles.bloqueoHeaderTextCol}>
                <Text style={[styles.bloqueoHeaderTitle, { color: colors.textPrimary }]}>
                  Configuración de Jornada
                </Text>
                <Text style={[styles.bloqueoHeaderSub, { color: colors.textSecondary }]}>
                  Define qué días laboras y el horario de apertura y cierre.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsJornadaModalVisible(false)}
                style={styles.modalCloseIcon}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* 7 Tarjetas de Días */}
            <View style={styles.jornadaDaysList}>
              {jornadaDays.map((item, index) => (
                <View
                  key={item.day}
                  style={[
                    styles.jornadaDayCard,
                    { backgroundColor: isDark ? '#26221A' : '#FFFFFF' },
                    Shadows.drop,
                  ]}>
                  <View style={styles.jornadaDayInfo}>
                    <Text
                      style={[
                        styles.jornadaDayTitle,
                        { color: item.active ? colors.textPrimary : '#8E8E93' },
                      ]}>
                      {item.day}
                    </Text>
                    <Text
                      style={[
                        styles.jornadaDayHours,
                        { color: item.active ? '#BA8609' : '#8E8E93' },
                      ]}>
                      {item.hours}
                    </Text>
                  </View>

                  <CustomSwitch
                    value={item.active}
                    onValueChange={(val) => toggleJornadaDay(index, val)}
                  />
                </View>
              ))}
            </View>

            {/* Botón Guardar Jornada */}
            <TouchableOpacity
              onPress={async () => {
                if (business?.id) {
                  try {
                    const daysMap = [1, 2, 3, 4, 5, 6, 0];
                    const payload = jornadaDays.map((d, idx) => ({
                      dia_semana: daysMap[idx],
                      hora_apertura: d.active ? d.hora_apertura : null,
                      hora_cierre: d.active ? d.hora_cierre : null,
                      cerrado: !d.active,
                    }));
                    await businessService.saveBusinessHours(business.id, payload);
                    showSuccess(
                      'Jornada Guardada',
                      'La configuración de jornada semanal ha sido actualizada exitosamente.'
                    );
                  } catch (err: any) {
                    showError('Error al guardar', err?.message || 'No se pudo guardar la jornada.');
                  }
                } else {
                  showWarning('Aviso', 'Configura tu local primero para guardar los horarios.');
                }
                setIsJornadaModalVisible(false);
              }}
              activeOpacity={0.88}
              style={[styles.jornadaSaveBtn, Shadows.goldButtonDrop]}>
              <Text style={styles.jornadaSaveBtnText}>Guardar Jornada</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Guía de Configuración de Negocio */}
      <BusinessSetupGuideModal
        visible={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        userId={user?.id || ''}
        initialBusiness={business}
        onCompleted={async () => {
          if (user?.id) {
            const biz = await businessService.getBusinessByOwnerId(user.id);
            if (biz) {
              setBusiness(biz);
              const [rawAppointments, rawSpecs] = await Promise.all([
                appointmentService.getBusinessAppointments(biz.id),
                businessService.getSpecialists(biz.id),
              ]);
              if (rawSpecs) setSpecialists(rawSpecs);
              if (rawAppointments) {
                const freshDays = generateAgendaDays();
                const mapped: AdminAppointment[] = rawAppointments.map((a: Appointment) => {
                  const dayIdx = freshDays.findIndex((d) => d.isoDate === a.fecha);
                  const statusMap: Record<string, AppointmentStatus> = {
                    PENDIENTE: 'pendiente',
                    CONFIRMADA: 'en_curso',
                    COMPLETADA: 'completada',
                    CANCELADA: 'cancelada',
                    NO_ASISTIO: 'no_asistio',
                  };
                  return {
                    id: a.id,
                    clientName: a.client ? `${a.client.nombre} ${a.client.apellido || ''}`.trim() : 'Cliente',
                    service: 'Servicio Flowtime',
                    time: a.hora_inicio ? a.hora_inicio.slice(0, 5) : '12:00 PM',
                    price: Number(a.precio_total) || 300,
                    note: a.notas || '',
                    status: statusMap[a.estado] || 'pendiente',
                    barberName: a.specialist ? `${a.specialist.nombre}` : 'Especialista',
                    dayIndex: dayIdx !== -1 ? dayIdx : 0,
                  };
                });
                freshDays.forEach((d, idx) => {
                  d.appointmentsCount = mapped.filter((app) => app.dayIndex === idx).length;
                });
                setAgendaDays(freshDays);
                setAppointments(mapped);
              }
            }
          }
        }}
      />

      {/* Barra de Navegación Inferior (Admin) */}
      <AdminBottomNav currentTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    gap: 14,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  logoImage: {
    width: 140,
    height: 40,
  },
  dashboardCard: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  dashboardSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
  },
  dashboardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: Spacing.base,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCol: {
    flex: 1,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricIncomeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  metricDop: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10.5,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  agendaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  agendaHeaderRight: {
    fontSize: 12,
    color: '#E9A83A',
    fontWeight: '600',
  },
  agendaDaysContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  dayPillWrapper: {
    width: 46,
    height: 78,
  },
  dayPillSelected: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  dayPillNameSelected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dayPillNumberSelected: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 1,
  },
  dayPillMonthSelected: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  dayPillCountSelected: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  dayPillUnselected: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  dayPillName: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayPillNumber: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 1,
  },
  dayPillMonth: {
    fontSize: 10,
    fontWeight: '500',
  },
  dayPillCount: {
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionPillButton: {
    flex: 1,
    height: 42,
    borderRadius: BorderRadius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  barbersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  barbersHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  barbersHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#C89626',
    letterSpacing: 0.2,
  },
  activeBarbersBadge: {
    backgroundColor: '#D5F2E1',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  activeBarbersBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#188E1C',
  },
  barberSubCard: {
    backgroundColor: '#D5F2E1',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D9B452',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  barberAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  barberStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  barberInfoCol: {
    flex: 1,
  },
  barberName: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  barberSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  turnButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
  },
  turnButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    marginTop: Spacing.xs,
  },
  cronogramaTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cronogramaSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDECB8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  emptyButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyCitaButton: {
    borderRadius: BorderRadius.pill,
  },
  emptyCitaGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.pill,
  },
  emptyCitaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  emptyBlockButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyBlockText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B8860B',
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    padding: Spacing.base,
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTimeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#B8860B',
  },
  enCursoBadge: {
    backgroundColor: '#B8860B',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
    marginLeft: 8,
  },
  enCursoBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appStatusBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmadaBadge: {
    backgroundColor: '#D5F2E1',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  confirmadaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#188E1C',
  },
  noAsistioBadge: {
    backgroundColor: '#FBE8DD',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  noAsistioBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D35400',
  },
  canceladaBadge: {
    backgroundColor: '#FDE2E4',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  canceladaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E74C3C',
  },
  completadaBadge: {
    backgroundColor: '#E1EDF8',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
  },
  completadaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2980B9',
  },
  appPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E9A83A',
  },
  appClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientInitialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9B452',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  clientInitialText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clientTextCol: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '800',
  },
  clientService: {
    fontSize: 12,
    marginTop: 1,
  },
  clientNote: {
    fontSize: 11,
    marginTop: 1,
  },
  appActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#188E1C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FDE2E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#E74C3C',
  },
  completadaActionButton: {
    flex: 1.2,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#188E1C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completadaActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noAsistioActionButton: {
    flex: 1.1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5EEDD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAsistioActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8860B',
  },
  cancelButtonMini: {
    flex: 1.1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FDE2E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E74C3C',
  },
  appFooterBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  clientStatusHint: {
    fontSize: 11.5,
  },
  cobradoHintText: {
    fontSize: 11.5,
    color: '#2980B9',
    fontWeight: '500',
  },
  reactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5C365',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
  },
  reactivateButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B8860B',
  },
  fabCitaManualWrapper: {
    position: 'absolute',
    right: 16,
    zIndex: 90,
  },
  fabCitaManual: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: BorderRadius.pill,
  },
  fabCitaManualText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: Spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalSub: {
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13.5,
  },
  pillOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
  },
  optionPillActive: {
    backgroundColor: '#BA8609',
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalSubmitWrapper: {
    marginTop: 18,
  },
  modalSubmitButton: {
    paddingVertical: 12,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  // Estilos de Gestión de Bloqueos (media_1790714211945.png)
  blockModalCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    padding: Spacing.base,
  },
  bloqueoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloqueoIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8E7B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bloqueoHeaderTextCol: {
    flex: 1,
  },
  bloqueoHeaderTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  bloqueoHeaderSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  bloqueoDateCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  bloqueoDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bloqueoDateHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bloqueoDateTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  bloqueoDateHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA8609',
  },
  bloqueoDaysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bloqueoDayPill: {
    width: 42,
    height: 62,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bloqueoDayPillActive: {
    backgroundColor: '#BA8609',
  },
  bloqueoDayName: {
    fontSize: 11,
    fontWeight: '600',
  },
  bloqueoDayNumber: {
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 1,
  },
  bloqueoDayMonth: {
    fontSize: 10,
    fontWeight: '500',
  },
  bloqueoDayTextActive: {
    color: '#FFFFFF',
  },
  bloqueoHourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  bloqueoHourLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloqueoHourLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  bloqueoSelectHourBtn: {
    backgroundColor: '#F3ECE2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bloqueoSelectHourBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA8609',
  },
  bloqueoSectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 2,
  },
  bloqueoMotivosList: {
    gap: 7,
    marginBottom: 10,
  },
  bloqueoMotivoPill: {
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  bloqueoMotivoPillActive: {
    backgroundColor: '#BA8609',
  },
  bloqueoMotivoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bloqueoMotivoTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bloqueoNoteInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 12,
  },
  bloqueoActionsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  bloqueoCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D5CCA9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloqueoCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#BA8609',
  },
  bloqueoSubmitBtn: {
    flex: 1.3,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BA8609',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloqueoSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Estilos de Configuración de Jornada (media_1790714229080.png)
  jornadaModalCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    padding: Spacing.base,
  },
  jornadaDaysList: {
    gap: 8,
    marginVertical: 8,
  },
  jornadaDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  jornadaDayInfo: {
    gap: 2,
  },
  jornadaDayTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  jornadaDayHours: {
    fontSize: 12,
    fontWeight: '600',
  },
  jornadaSaveBtn: {
    alignSelf: 'flex-end',
    height: 42,
    borderRadius: 21,
    backgroundColor: '#BA8609',
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  jornadaSaveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
