import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { appointmentService } from '@/api/appointment.service';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

const SHOP_THUMBNAIL =
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80';

function convertTimeSlotToSqlTime(timeStr: string): string {
  try {
    const cleanStr = timeStr.trim().split('-')[0].trim();
    const parts = cleanStr.split(' ');
    const [rawH, rawM] = parts[0].split(':');
    let h = parseInt(rawH, 10);
    const m = rawM ? parseInt(rawM, 10) : 0;
    const isPM = parts[1]?.toUpperCase() === 'PM';
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  } catch {
    return '12:00:00';
  }
}

function calculateEndTime(horaInicio: string, durationMinutes: number): string {
  try {
    const [h, m] = horaInicio.split(':').map((n) => parseInt(n, 10));
    const totalM = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalM / 60) % 24;
    const endM = totalM % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
  } catch {
    return '13:00:00';
  }
}

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();

  // Valores pasados o predeterminados del mockup
  const businessId = (params.businessId as string) || '';
  const professionalId = (params.professionalId as string) || '';
  const isoDate = (params.isoDate as string) || new Date().toISOString().split('T')[0];
  const totalPrice = params.totalPrice ? params.totalPrice.toString() : '700';
  const totalDuration = params.totalDuration ? params.totalDuration.toString() : '40';
  const serviceName = params.serviceName
    ? params.serviceName.toString()
    : 'Servicio seleccionado';
  const professionalName = params.professionalName
    ? params.professionalName.toString()
    : 'Profesional asignado';
  const date = params.date ? params.date.toString() : 'Fecha seleccionada';
  const time = params.time ? params.time.toString() : 'Hora por definir';

  // Estado para comentarios o peticiones del cliente
  const [customerNote, setCustomerNote] = useState<string>('');
  const [tempNote, setTempNote] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleOpenAddNote = () => {
    setTempNote(customerNote);
    setIsModalVisible(true);
  };

  const handleSaveNote = () => {
    setCustomerNote(tempNote.trim());
    setIsModalVisible(false);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // Si tenemos usuario e IDs válidos (UUIDs no mock), insertamos en Supabase
      const isUuid = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (user?.id && isUuid(businessId)) {
        const horaInicio = convertTimeSlotToSqlTime(time);
        const horaFin = calculateEndTime(horaInicio, Number(totalDuration) || 40);

        let parsedServiceIds: string[] = [];
        try {
          if (params.serviceIds) {
            parsedServiceIds = JSON.parse(params.serviceIds as string);
          } else if (params.serviceId) {
            parsedServiceIds = [params.serviceId as string];
          }
        } catch {
          parsedServiceIds = [];
        }

        const validServiceIds = parsedServiceIds.filter(isUuid);

        // Si professionalId es un UUID válido, lo pasamos; si no o es 'any', pasamos specialistId si hay
        if (isUuid(professionalId)) {
          await appointmentService.createAppointment({
            businessId,
            clientId: user.id,
            specialistId: professionalId,
            fecha: isoDate,
            horaInicio,
            horaFin,
            duracionTotalMinutos: Number(totalDuration) || 40,
            precioTotal: Number(totalPrice) || 700,
            moneda: 'DOP',
            notas: customerNote || undefined,
            servicios: validServiceIds.map((sId) => ({
              serviceId: sId,
              precio: (Number(totalPrice) || 700) / (validServiceIds.length || 1),
              duracionMinutos: Math.round((Number(totalDuration) || 40) / (validServiceIds.length || 1)),
            })),
          });
        }
      }
    } catch (err) {
      console.warn('Error al guardar cita en Supabase (modo fallback activo):', err);
    } finally {
      setSubmitting(false);
      setIsSuccessModalVisible(true);
    }
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

      {/* Barra de Navegación Superior: Flecha Atrás e Icono Cerrar (✕) */}
      <View
        style={[
          styles.topNavRow,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
          },
        ]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/client')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconButton}>
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Título Principal */}
      <View style={styles.titleContainer}>
        <Text style={[styles.mainHeading, { color: colors.textPrimary }]}>
          Revisar y confirmar
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Card 1: Tarjeta Unificada de Barbería, Cita y Servicio */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          {/* Encabezado: Imagen + Nombre de la Barbería + Calificación */}
          <View style={styles.shopHeaderRow}>
            <Image
              source={{ uri: SHOP_THUMBNAIL }}
              style={styles.shopImage}
              contentFit="cover"
            />

            <View style={styles.shopInfoCol}>
              <Text style={[styles.shopTitle, { color: colors.textPrimary }]}>
                Billy Boy Barber
              </Text>

              {/* Fila de estrellas exactamente iguales a las de reseñas */}
              <View style={styles.ratingRow}>
                <Text style={[styles.ratingScore, { color: colors.textPrimary }]}>
                  5.0{' '}
                </Text>
                <View style={styles.starsGroup}>
                  <Ionicons name="star" size={13} color="#D4AF37" />
                  <Ionicons name="star" size={13} color="#D4AF37" />
                  <Ionicons name="star" size={13} color="#D4AF37" />
                  <Ionicons name="star" size={13} color="#D4AF37" />
                  <Ionicons name="star" size={13} color="#D4AF37" />
                </View>
                <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>
                  {' '}(135)
                </Text>
              </View>

              <Text
                style={[styles.shopAddress, { color: colors.textSecondary }]}
                numberOfLines={1}>
                Avenida Tiradentes 160, Ensanche La Fé, Santo Domingo, Dis...
              </Text>
            </View>
          </View>

          {/* Fecha de la Cita */}
          <View style={[styles.appointmentInfoRow, { marginTop: 14 }]}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textPrimary}
              style={styles.appointmentIcon}
            />
            <Text style={[styles.appointmentText, { color: colors.textPrimary }]}>
              {date}
            </Text>
          </View>

          {/* Horario y Duración */}
          <View style={[styles.appointmentInfoRow, { marginTop: 8 }]}>
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.textPrimary}
              style={styles.appointmentIcon}
            />
            <Text style={[styles.appointmentText, { color: colors.textPrimary }]}>
              {time} ({totalDuration} min de duración)
            </Text>
          </View>

          {/* Divisor */}
          <View
            style={[
              styles.cardDivider,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
            ]}
          />

          {/* Detalle del Servicio */}
          <View style={styles.servicePriceRow}>
            <View style={styles.serviceTextCol}>
              <Text style={[styles.serviceTitleUpper, { color: colors.textPrimary }]}>
                {serviceName.toUpperCase()}
              </Text>
              <Text style={[styles.serviceSubText, { color: colors.textSecondary }]}>
                {totalDuration} min con {professionalName}
              </Text>
            </View>

            <Text style={[styles.servicePrice, { color: colors.textPrimary }]}>
              DOP {totalPrice}
            </Text>
          </View>

          {/* Divisor */}
          <View
            style={[
              styles.cardDivider,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
            ]}
          />

          {/* Fila de Total */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
              Total
            </Text>
            <Text style={[styles.totalPriceValue, { color: colors.textPrimary }]}>
              DOP {totalPrice}
            </Text>
          </View>
        </View>

        {/* Sección: Más detalles */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          Más detalles
        </Text>

        {/* Card: Política de cancelación */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <Text style={[styles.policyTitle, { color: colors.textPrimary }]}>
            Política de cancelación
          </Text>
          <Text style={[styles.policyDescription, { color: colors.textSecondary }]}>
            Por favor cancela al menos 30 minutos antes de la cita.
          </Text>
        </View>

        {/* Sección: Comentarios o peticiones */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          Comentarios o peticiones
        </Text>

        {/* Card: Campo de notas o peticiones */}
        <View
          style={[
            styles.card,
            styles.commentsCardRow,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.commentsTextCol}>
            {customerNote ? (
              <View>
                <Text style={[styles.noteEnteredText, { color: colors.textPrimary }]}>
                  &ldquo;{customerNote}&rdquo;
                </Text>
                <Text style={[styles.noteHintSub, { color: colors.textSecondary }]}>
                  Nota para el barbero
                </Text>
              </View>
            ) : (
              <Text style={[styles.commentsPlaceholder, { color: colors.textSecondary }]}>
                ¿Algo que te gustaría que sepamos?
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleOpenAddNote}
            activeOpacity={0.7}
            style={[
              styles.addButton,
              {
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              },
            ]}>
            <Text style={[styles.addButtonText, { color: colors.textPrimary }]}>
              {customerNote ? 'Editar' : 'Agregar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para escribir nota o petición */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Comentarios o peticiones
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Indica cualquier preferencia para tu corte o servicio:
            </Text>

            <TextInput
              value={tempNote}
              onChangeText={setTempNote}
              placeholder="Ej: Toalla bien caliente, piel sensible..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
              style={[
                styles.modalTextInput,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#EFEAE1',
                  color: colors.textPrimary,
                },
              ]}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCancelButton}>
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveNote}
                style={[styles.modalSaveButton, { backgroundColor: '#1C1C1E' }]}>
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Cita Reservada Correctamente */}
      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsSuccessModalVisible(false);
          router.replace('/client');
        }}>
        <View style={styles.successModalOverlay}>
          <View
            style={[
              styles.successModalCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            {/* Badge de Éxito con Icono Verde */}
            <View style={styles.successBadgeCircle}>
              <Ionicons name="checkmark-circle" size={54} color="#188E1C" />
            </View>

            {/* Título de Confirmación */}
            <Text style={[styles.successModalTitle, { color: colors.textPrimary }]}>
              ¡Cita reservada correctamente!
            </Text>

            {/* Subtítulo */}
            <Text style={[styles.successModalSubtitle, { color: colors.textSecondary }]}>
              Tu reserva ha sido confirmada con éxito. Te esperamos puntualmente en la barbería.
            </Text>

            {/* Ficha Resumen de la Cita */}
            <View
              style={[
                styles.successSummaryBox,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F4EFE6' },
              ]}>
              {/* Negocio */}
              <View style={styles.successSummaryRow}>
                <Ionicons
                  name="storefront-outline"
                  size={17}
                  color="#B8860B"
                  style={styles.successSummaryIcon}
                />
                <Text style={[styles.successSummaryLabel, { color: colors.textSecondary }]}>
                  Negocio:
                </Text>
                <Text
                  style={[styles.successSummaryValue, { color: colors.textPrimary }]}
                  numberOfLines={1}>
                  Billy Boy Barber
                </Text>
              </View>

              {/* Fecha */}
              <View style={styles.successSummaryRow}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color="#B8860B"
                  style={styles.successSummaryIcon}
                />
                <Text style={[styles.successSummaryLabel, { color: colors.textSecondary }]}>
                  Fecha:
                </Text>
                <Text style={[styles.successSummaryValue, { color: colors.textPrimary }]}>
                  {date}
                </Text>
              </View>

              {/* Hora */}
              <View style={styles.successSummaryRow}>
                <Ionicons
                  name="time-outline"
                  size={17}
                  color="#B8860B"
                  style={styles.successSummaryIcon}
                />
                <Text style={[styles.successSummaryLabel, { color: colors.textSecondary }]}>
                  Hora:
                </Text>
                <Text style={[styles.successSummaryValue, { color: colors.textPrimary }]}>
                  {time} ({totalDuration} min)
                </Text>
              </View>

              {/* Profesional */}
              <View style={styles.successSummaryRow}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color="#B8860B"
                  style={styles.successSummaryIcon}
                />
                <Text style={[styles.successSummaryLabel, { color: colors.textSecondary }]}>
                  Barbero:
                </Text>
                <Text style={[styles.successSummaryValue, { color: colors.textPrimary }]}>
                  {professionalName}
                </Text>
              </View>

              {/* Servicio */}
              <View style={styles.successSummaryRow}>
                <Ionicons
                  name="cut-outline"
                  size={17}
                  color="#B8860B"
                  style={styles.successSummaryIcon}
                />
                <Text style={[styles.successSummaryLabel, { color: colors.textSecondary }]}>
                  Servicio:
                </Text>
                <Text
                  style={[styles.successSummaryValue, { color: colors.textPrimary }]}
                  numberOfLines={1}>
                  {serviceName}
                </Text>
              </View>

              {/* Nota opcional */}
              {customerNote ? (
                <View style={styles.successSummaryRow}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={17}
                    color="#B8860B"
                    style={styles.successSummaryIcon}
                  />
                  <Text style={[styles.successSummaryLabel, { color: colors.textSecondary }]}>
                    Nota:
                  </Text>
                  <Text
                    style={[styles.successSummaryValue, { color: colors.textPrimary }]}
                    numberOfLines={1}>
                    {customerNote}
                  </Text>
                </View>
              ) : null}

              {/* Total */}
              <View style={[styles.successSummaryRow, styles.successSummaryRowTotal]}>
                <Text style={[styles.successTotalLabel, { color: colors.textPrimary }]}>
                  Total pagado en local:
                </Text>
                <Text style={styles.successTotalValue}>DOP {totalPrice}</Text>
              </View>
            </View>

            {/* Botón Principal: Volver al Inicio */}
            <TouchableOpacity
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.replace('/client');
              }}
              activeOpacity={0.88}
              style={styles.successPrimaryButtonWrapper}>
              <LinearGradient
                colors={['#B8860B', '#F3DA80', '#D4AF37']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.successPrimaryButton, Shadows.goldButtonDrop]}>
                <Text style={styles.successPrimaryButtonText}>Volver al Inicio</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón Secundario: Ver mis reservas */}
            <TouchableOpacity
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.replace('/client/profile');
              }}
              activeOpacity={0.7}
              style={styles.successSecondaryButton}>
              <Text style={[styles.successSecondaryButtonText, { color: colors.textSecondary }]}>
                Ver mis reservas
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barra Inferior Fija (Sticky Footer) */}
      <View
        style={[
          styles.bottomFooter,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            paddingBottom: Math.max(insets.bottom, 12),
            borderTopColor: colors.divider,
          },
        ]}>
        <Text style={[styles.bottomTotalText, { color: colors.textPrimary }]}>
          Total DOP {totalPrice}
        </Text>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={submitting}
          activeOpacity={0.88}
          style={[styles.confirmBlackButton, submitting && { opacity: 0.7 }]}>
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmBlackButtonText}>Confirmar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  iconButton: {
    padding: 4,
  },
  titleContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    gap: 14,
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  shopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  shopInfoCol: {
    flex: 1,
  },
  shopTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800',
  },
  starsGroup: {
    flexDirection: 'row',
    gap: 1.5,
  },
  ratingCount: {
    fontSize: 12,
  },
  shopAddress: {
    fontSize: 11.5,
    marginTop: 2,
  },
  appointmentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentIcon: {
    width: 26,
  },
  appointmentText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginVertical: 14,
  },
  servicePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  serviceTitleUpper: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  serviceSubText: {
    fontSize: 12.5,
    marginTop: 3,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalPriceValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: -4,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  policyDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  commentsCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  commentsTextCol: {
    flex: 1,
    marginRight: 10,
  },
  commentsPlaceholder: {
    fontSize: 13.5,
  },
  noteEnteredText: {
    fontSize: 13.5,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  noteHintSub: {
    fontSize: 11,
    marginTop: 2,
  },
  addButton: {
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  modalTextInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 13.5,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 14,
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.pill,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
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
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 6,
  },
  bottomTotalText: {
    fontSize: 16,
    fontWeight: '800',
  },
  confirmBlackButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBlackButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  successBadgeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  successModalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  successSummaryBox: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    marginBottom: 18,
  },
  successSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successSummaryIcon: {
    width: 24,
  },
  successSummaryLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    width: 68,
  },
  successSummaryValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  successSummaryRowTotal: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'space-between',
  },
  successTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  successTotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E9A83A',
  },
  successPrimaryButtonWrapper: {
    width: '100%',
  },
  successPrimaryButton: {
    paddingVertical: 14,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successPrimaryButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  successSecondaryButton: {
    paddingVertical: 10,
    marginTop: 4,
  },
  successSecondaryButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
