import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';
import { businessService } from '@/api/business.service';
import { appointmentService } from '@/api/appointment.service';
import { BusinessHours, Appointment } from '@/api/types';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

interface DayOption {
  dayName: string;
  dayNumber: number;
  month: string;
  fullDate: string;
  isoDate: string;
}

interface GeneratedSlot {
  label: string;
  time24: string;
}

function generateSlotsForDay(
  horaApertura: string,
  horaCierre: string,
  intervalMinutes: number = 30
): GeneratedSlot[] {
  try {
    const [startH, startM] = (horaApertura || '09:00').split(':').map(Number);
    const [endH, endM] = (horaCierre || '21:00').split(':').map(Number);

    const startTotal = (startH || 9) * 60 + (startM || 0);
    const endTotal = (endH || 21) * 60 + (endM || 0);

    const slots: GeneratedSlot[] = [];

    for (let m = startTotal; m < endTotal; m += intervalMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;

      const time24 = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

      const isPM = h >= 12;
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const minStr = String(min).padStart(2, '0');
      const period = isPM ? 'PM' : 'AM';
      const label = `${h12}:${minStr} ${period}`;

      slots.push({ label, time24 });
    }

    return slots;
  } catch {
    return [];
  }
}

const generateNextDays = (): DayOption[] => {
  const days: DayOption[] = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const fullDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const fullMonthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

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
      fullDate: `${fullDayNames[dayOfWeek]}, ${fullMonthNames[monthIndex]} ${dayNumber}`,
      isoDate: `${yyyy}-${mm}-${dd}`,
    });
  }
  return days;
};

const DAYS_DATA: DayOption[] = generateNextDays();

export default function SelectDateTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { showWarning } = useAlert();

  const businessId = (params.businessId as string) || '';
  const professionalId = (params.professionalId as string) || '';

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isTimePickerExpanded, setIsTimePickerExpanded] = useState<boolean>(true);

  // Estados de horarios y citas de Supabase
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);

  const totalPrice = params.totalPrice ? params.totalPrice.toString() : '700';
  const totalDuration = params.totalDuration ? params.totalDuration.toString() : '40';
  const count = params.count ? params.count.toString() : '1';

  const selectedDay = DAYS_DATA[selectedDayIndex];

  // Cargar horas de atención y citas reales para el día seleccionado
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      let bId = businessId;
      if (!bId) {
        const allBiz = await businessService.getBusinesses();
        if (allBiz && allBiz.length > 0) {
          bId = allBiz[0].id;
        }
      }

      if (!bId) {
        if (isMounted) setLoadingSchedule(false);
        return;
      }

      setLoadingSchedule(true);
      try {
        const [hours, apps] = await Promise.all([
          businessService.getBusinessHours(bId),
          appointmentService.getBusinessAppointments(bId, selectedDay.isoDate),
        ]);
        if (isMounted) {
          if (hours) setBusinessHours(hours);
          if (apps) setBookedAppointments(apps);
        }
      } catch (err) {
        console.warn('[SelectDateTime] Error cargando disponibilidad:', err);
      } finally {
        if (isMounted) setLoadingSchedule(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [businessId, selectedDay.isoDate]);

  // Determinar si el negocio labora en este día de la semana
  const [y, m, d] = selectedDay.isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d, 12, 0, 0);
  const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  const dayRule = businessHours.find((h) => h.dia_semana === dayOfWeek);
  const isDayClosed = dayRule ? dayRule.cerrado : dayOfWeek === 0;

  const rawOpen = dayRule?.hora_apertura ? dayRule.hora_apertura.slice(0, 5) : '09:00';
  const rawClose = dayRule?.hora_cierre ? dayRule.hora_cierre.slice(0, 5) : '21:00';

  // Generar todos los horarios del día en intervalos de 30 mins
  const timeSlots = isDayClosed ? [] : generateSlotsForDay(rawOpen, rawClose, 30);

  // Calcular ocupación y horas pasadas
  const now = new Date();
  const currentIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = selectedDay.isoDate === currentIso;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slotsWithStatus = timeSlots.map((slot) => {
    const [slotH, slotM] = slot.time24.split(':').map(Number);
    const slotMinutes = slotH * 60 + slotM;

    // Hora pasada hoy
    const isPast = isToday && slotMinutes <= currentMinutes;

    // Cita ya reservada en este intervalo
    const isBooked = bookedAppointments.some((app) => {
      if (app.estado === 'CANCELADA') return false;
      if (professionalId && professionalId !== 'any') {
        if (app.specialist_id && app.specialist_id !== professionalId) {
          return false;
        }
      }
      const appStart = (app.hora_inicio || '').slice(0, 5);
      return appStart === slot.time24;
    });

    const isOccupied = isPast || isBooked;

    return {
      ...slot,
      isOccupied,
      reason: isPast ? 'past' : isBooked ? 'booked' : null,
    };
  });

  // Horario efectivo calculado (si el seleccionado no es válido o está ocupado, usa el primer disponible)
  const firstAvailableSlot = slotsWithStatus.find((s) => !s.isOccupied);
  const isSelectedTimeValid =
    !isDayClosed &&
    Boolean(selectedTime) &&
    slotsWithStatus.some((s) => s.label === selectedTime && !s.isOccupied);

  const effectiveTime = isSelectedTimeValid
    ? selectedTime
    : isDayClosed
    ? ''
    : firstAvailableSlot?.label || '';

  const handleContinue = () => {
    if (isDayClosed) {
      showWarning('Local Cerrado', 'Este negocio no atiende en el día seleccionado. Elige otra fecha.');
      return;
    }
    if (!effectiveTime) {
      showWarning('Horario requerido', 'Por favor selecciona un horario disponible para tu reserva.');
      return;
    }

    router.push({
      pathname: '/client/confirm-booking',
      params: {
        ...params,
        date: selectedDay.fullDate,
        isoDate: selectedDay.isoDate,
        time: effectiveTime,
        dayName: selectedDay.dayName,
        dayNumber: selectedDay.dayNumber.toString(),
        month: selectedDay.month,
      },
    });
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

      {/* Cabecera */}
      <View
        style={[
          styles.headerRow,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
          },
        ]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Selecciona fecha y hora
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Card 1: Elige el día de la reserva */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          {/* Header de la Card */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#B8860B"
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                Elige el día de la reserva
              </Text>
            </View>
            <Text style={styles.cardHeaderBadgeText}>Mostrando: Hoy</Text>
          </View>

          {/* Fila de días con scroll horizontal o distribuido */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}>
            {DAYS_DATA.map((day, index) => {
              const isSelected = selectedDayIndex === index;

              return (
                <TouchableOpacity
                  key={day.dayNumber}
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
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Card 2: Selecciona la hora (Expandible y con Grid de 12 horarios) */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <TouchableOpacity
            onPress={() => setIsTimePickerExpanded((prev) => !prev)}
            activeOpacity={0.8}
            style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="hourglass-outline"
                size={18}
                color="#B8860B"
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                Selecciona la hora
              </Text>
            </View>

            <View
              style={[
                styles.selectTimeBadge,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2EADC',
                },
                Shadows.drop,
              ]}>
              <Text style={styles.selectTimeBadgeText}>
                {effectiveTime ? effectiveTime : isDayClosed ? 'Cerrado' : 'Seleccionar'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Grid de Horarios con estados de disponibilidad */}
          {isTimePickerExpanded && (
            <View style={{ marginTop: 10 }}>
              {loadingSchedule ? (
                <View style={styles.loadingScheduleBox}>
                  <ActivityIndicator color="#BA831B" size="small" />
                  <Text style={[styles.loadingScheduleText, { color: colors.textSecondary }]}>
                    Comprobando disponibilidad de citas...
                  </Text>
                </View>
              ) : isDayClosed ? (
                <View style={styles.closedDayBox}>
                  <Ionicons name="moon-outline" size={28} color="#BA8609" />
                  <Text style={[styles.closedDayTitle, { color: colors.textPrimary }]}>
                    Local cerrado los {selectedDay.dayName}
                  </Text>
                  <Text style={[styles.closedDaySub, { color: colors.textSecondary }]}>
                    El negocio no tiene jornada laboral en esta fecha. Selecciona otro día arriba para ver turnos disponibles.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Leyenda de Disponibilidad */}
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#BA831B' }]} />
                      <Text style={[styles.legendText, { color: colors.textSecondary }]}>Disponible</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: isDark ? '#55555A' : '#B0A898' }]} />
                      <Text style={[styles.legendText, { color: colors.textSecondary }]}>Ocupado / No disp.</Text>
                    </View>
                  </View>

                  <View style={styles.timeSlotsGrid}>
                    {slotsWithStatus.map((slot) => {
                      const isSelected = effectiveTime === slot.label && !slot.isOccupied;

                      if (slot.isOccupied) {
                        return (
                          <View
                            key={slot.label}
                            style={styles.timeSlotWrapper}>
                            <View
                              style={[
                                styles.timeSlotOccupied,
                                {
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ECE6DA',
                                },
                              ]}>
                              <Text style={styles.timeSlotTextOccupied}>{slot.label}</Text>
                              <Text style={styles.timeSlotOccupiedBadge}>
                                {slot.reason === 'past' ? 'Pasado' : 'Ocupado'}
                              </Text>
                            </View>
                          </View>
                        );
                      }

                      return (
                        <TouchableOpacity
                          key={slot.label}
                          onPress={() => setSelectedTime(slot.label)}
                          activeOpacity={0.8}
                          style={styles.timeSlotWrapper}>
                          {isSelected ? (
                            <LinearGradient
                              colors={['#BA831B', '#D4AF37']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[styles.timeSlotSelected, Shadows.drop]}>
                              <Text style={styles.timeSlotTextSelected}>{slot.label}</Text>
                            </LinearGradient>
                          ) : (
                            <View
                              style={[
                                styles.timeSlotUnselected,
                                {
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F4EFE6',
                                },
                                Shadows.drop,
                              ]}>
                              <Text style={styles.timeSlotTextUnselected}>{slot.label}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra Inferior Fija (Sticky Footer) */}
      <View
        style={[
          styles.bottomFooter,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#F6EEDC',
            paddingBottom: Math.max(insets.bottom, 12),
            borderTopColor: colors.divider,
          },
        ]}>
        <View style={styles.summaryTextCol}>
          <Text style={styles.totalPriceText}>DOP {totalPrice}</Text>
          <Text style={[styles.summarySubText, { color: colors.textSecondary }]}>
            {count} Servicio seleccionado · {totalDuration} min
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedTime || isDayClosed}
          activeOpacity={0.88}
          style={[styles.continueButtonWrapper, (!selectedTime || isDayClosed) && { opacity: 0.45 }]}>
          <LinearGradient
            colors={['#B8860B', '#F3DA80', '#D4AF37']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.continueButton, Shadows.goldButtonDrop]}>
            <Text style={styles.continueButtonText}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  backButton: {
    paddingRight: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    gap: 14,
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardHeaderBadgeText: {
    fontSize: 12,
    color: '#E9A83A',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  dayPillWrapper: {
    width: 48,
    height: 68,
  },
  dayPillSelected: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
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
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  dayPillUnselected: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
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
    fontSize: 10.5,
    fontWeight: '500',
  },
  selectTimeBadge: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
  },
  selectTimeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8860B',
  },
  loadingScheduleBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingScheduleText: {
    fontSize: 12.5,
  },
  closedDayBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(186, 134, 9, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(186, 134, 9, 0.2)',
  },
  closedDayTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  closedDaySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    justifyContent: 'flex-start',
  },
  timeSlotWrapper: {
    width: '23%',
    height: 38,
    marginBottom: 2,
  },
  timeSlotSelected: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotTextSelected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeSlotUnselected: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotTextUnselected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A67C1E',
  },
  timeSlotOccupied: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.38,
    borderWidth: 1,
    borderColor: 'rgba(142, 142, 147, 0.25)',
  },
  timeSlotTextOccupied: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  timeSlotOccupiedBadge: {
    fontSize: 8,
    fontWeight: '600',
    color: '#8E8E93',
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  summaryTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E9A83A',
  },
  summarySubText: {
    fontSize: 12,
    marginTop: 2,
  },
  continueButtonWrapper: {
    marginLeft: 14,
  },
  continueButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C1C1C',
  },
});
