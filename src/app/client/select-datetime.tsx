import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Gradients, BrandColors } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

interface DayOption {
  dayName: string;
  dayNumber: number;
  month: string;
  fullDate: string;
}

const DAYS_DATA: DayOption[] = [
  { dayName: 'Lun', dayNumber: 10, month: 'Sep', fullDate: 'Lunes, Septiembre 10' },
  { dayName: 'Mar', dayNumber: 11, month: 'Sep', fullDate: 'Martes, Septiembre 11' },
  { dayName: 'Mie', dayNumber: 12, month: 'Sep', fullDate: 'Miércoles, Septiembre 12' },
  { dayName: 'Jue', dayNumber: 13, month: 'Sep', fullDate: 'Jueves, Septiembre 13' },
  { dayName: 'Vie', dayNumber: 14, month: 'Sep', fullDate: 'Viernes, Septiembre 14' },
  { dayName: 'Sab', dayNumber: 15, month: 'Sep', fullDate: 'Sábado, Septiembre 15' },
  { dayName: 'Dom', dayNumber: 16, month: 'Sep', fullDate: 'Domingo, Septiembre 16' },
];

const TIME_SLOTS: string[] = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
];

export default function SelectDateTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  // Por defecto "Lun 10 Sep" y "1:00 PM" están seleccionados como en los mockups
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>('1:00 PM');
  const [isTimePickerExpanded, setIsTimePickerExpanded] = useState<boolean>(true);

  const totalPrice = params.totalPrice ? params.totalPrice.toString() : '700';
  const totalDuration = params.totalDuration ? params.totalDuration.toString() : '40';
  const count = params.count ? params.count.toString() : '1';
  const serviceName = params.serviceName
    ? params.serviceName.toString()
    : 'Corte y barba o afeitado';
  const professionalName = params.professionalName
    ? params.professionalName.toString()
    : 'Diego Tejeda';

  const selectedDay = DAYS_DATA[selectedDayIndex];

  const handleContinue = () => {
    router.push({
      pathname: '/client/confirm-booking',
      params: {
        ...params,
        date: selectedDay.fullDate,
        time: selectedTime,
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
                {selectedTime ? selectedTime : 'Seleccionar'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Grid de Horarios (4 columnas x 3 filas) */}
          {isTimePickerExpanded && (
            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;

                return (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedTime(slot)}
                    activeOpacity={0.8}
                    style={styles.timeSlotWrapper}>
                    {isSelected ? (
                      <LinearGradient
                        colors={['#BA831B', '#D4AF37']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.timeSlotSelected, Shadows.drop]}>
                        <Text style={styles.timeSlotTextSelected}>{slot}</Text>
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
                        <Text style={styles.timeSlotTextUnselected}>{slot}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
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
          activeOpacity={0.88}
          style={styles.continueButtonWrapper}>
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
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  timeSlotWrapper: {
    width: '23%',
    height: 34,
  },
  timeSlotSelected: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
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
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotTextUnselected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A67C1E',
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
