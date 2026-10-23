import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';
import { businessService } from '@/api/business.service';
import { Business } from '@/api/types';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  initialBusiness?: Business | null;
  onCompleted?: () => void;
}

export function BusinessSetupGuideModal({
  visible,
  onClose,
  userId,
  initialBusiness,
  onCompleted,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const { showSuccess, showError, showWarning } = useAlert();

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Paso 1: Identidad
  const [nombreComercial, setNombreComercial] = useState(initialBusiness?.nombre_comercial || '');
  const [descripcion, setDescripcion] = useState(initialBusiness?.descripcion || '');

  // Paso 2: Ubicación y Contacto
  const [direccion, setDireccion] = useState(initialBusiness?.direccion || '');
  const [ciudad, setCiudad] = useState(initialBusiness?.ciudad || 'Santo Domingo');
  const [telefono, setTelefono] = useState(initialBusiness?.telefono || '');
  const [instagram, setInstagram] = useState(initialBusiness?.instagram || '');
  const [tiktok, setTiktok] = useState(initialBusiness?.tiktok || '');

  // Paso 3: Horario
  const [horaApertura, setHoraApertura] = useState('09:00:00');
  const [horaCierre, setHoraCierre] = useState('21:00:00');

  // Paso 4: Servicio inicial
  const [servicioNombre, setServicioNombre] = useState('Corte Clásico');
  const [servicioPrecio, setServicioPrecio] = useState('500');
  const [servicioDuracion, setServicioDuracion] = useState('45');

  // Paso 5: Especialista inicial
  const [barberoNombre, setBarberoNombre] = useState('');
  const [barberoEspecialidad, setBarberoEspecialidad] = useState('Barbero Master');

  // Guardar datos según el paso actual
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!nombreComercial.trim()) {
        showWarning('Campo obligatorio', 'Por favor ingresa el nombre comercial de tu negocio.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!telefono.trim() && !direccion.trim()) {
        showWarning('Datos de contacto', 'Por favor ingresa al menos un teléfono o dirección de atención.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Guardar todo en Supabase
      setSaving(true);
      try {
        // 1. Guardar o actualizar negocio
        const savedBiz = await businessService.saveBusiness({
          id: initialBusiness?.id,
          owner_id: userId,
          nombre_comercial: nombreComercial.trim(),
          descripcion: descripcion.trim() || null,
          direccion: direccion.trim() || null,
          ciudad: ciudad.trim() || 'Santo Domingo',
          telefono: telefono.trim() || null,
          instagram: instagram.trim() || null,
          tiktok: tiktok.trim() || null,
        });

        // 2. Guardar horario semanal básico
        if (savedBiz?.id) {
          const scheduleDays: {
            dia_semana: number;
            hora_apertura: string | null;
            hora_cierre: string | null;
            cerrado: boolean;
          }[] = [1, 2, 3, 4, 5, 6].map((dayNum) => ({
            dia_semana: dayNum,
            hora_apertura: horaApertura,
            hora_cierre: horaCierre,
            cerrado: false,
          }));
          // Domingo cerrado
          scheduleDays.push({
            dia_semana: 0,
            hora_apertura: null,
            hora_cierre: null,
            cerrado: true,
          });
          await businessService.saveBusinessHours(savedBiz.id, scheduleDays);

          // 3. Crear servicio inicial si se especificó
          if (servicioNombre.trim() && Number(servicioPrecio) > 0) {
            await businessService.createService({
              business_id: savedBiz.id,
              nombre: servicioNombre.trim(),
              precio: Number(servicioPrecio),
              duracion_minutos: Number(servicioDuracion) || 30,
            });
          }

          // 4. Crear especialista si se especificó
          if (barberoNombre.trim()) {
            await businessService.createSpecialist({
              business_id: savedBiz.id,
              nombre: barberoNombre.trim(),
              especialidad: barberoEspecialidad.trim(),
            });
          }
        }

        showSuccess(
          '¡Configuración Completada!',
          'Tu negocio ha quedado configurado con éxito. Ahora tus clientes podrán encontrarte y reservar citas.'
        );
        onCompleted?.();
        onClose();
      } catch (err: any) {
        showError('Error al guardar', err?.message || 'No se pudo guardar la configuración.');
      } finally {
        setSaving(false);
      }
    }
  };

  const stepsInfo = [
    { num: 1, title: 'Identidad', subtitle: 'Nombre y descripción de tu local' },
    { num: 2, title: 'Contacto', subtitle: 'Dirección, WhatsApp y redes' },
    { num: 3, title: 'Horarios', subtitle: 'Jornada laboral semanal' },
    { num: 4, title: 'Servicio', subtitle: 'Tu primer servicio en catálogo' },
    { num: 5, title: 'Equipo', subtitle: 'Profesionales y barberos' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#1C1A17' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          {/* Cabecera del Asistente */}
          <View style={styles.headerRow}>
            <View>
              <View style={styles.badgeRow}>
                <Ionicons name="sparkles" size={14} color="#D4AF37" />
                <Text style={styles.badgeText}>GUÍA DE CONFIGURACIÓN</Text>
              </View>
              <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
                {stepsInfo[currentStep - 1].title}
              </Text>
              <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
                {stepsInfo[currentStep - 1].subtitle}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Barra de Progreso de 5 pasos */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={['#BA8609', '#F3DA80', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${(currentStep / 5) * 100}%` }]}
              />
            </View>
            <Text style={[styles.stepCountText, { color: colors.textSecondary }]}>
              Paso {currentStep} de 5
            </Text>
          </View>

          {/* Contenido Dinámico de Cada Paso */}
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}>
            {/* PASO 1 */}
            {currentStep === 1 && (
              <View style={styles.stepForm}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Nombre Comercial del Negocio *
                </Text>
                <TextInput
                  value={nombreComercial}
                  onChangeText={setNombreComercial}
                  placeholder="Ej: Flowtime Barbershop & Studio"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Descripción / Ritual de Experiencia
                </Text>
                <TextInput
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Describe qué hace único a tu negocio, el estilo de atención y el ambiente..."
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>
            )}

            {/* PASO 2 */}
            {currentStep === 2 && (
              <View style={styles.stepForm}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Dirección Física
                </Text>
                <TextInput
                  value={direccion}
                  onChangeText={setDireccion}
                  placeholder="Ej: Av. Winston Churchill #45, Piantini"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Ciudad
                </Text>
                <TextInput
                  value={ciudad}
                  onChangeText={setCiudad}
                  placeholder="Ej: Santo Domingo"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Teléfono / WhatsApp de Citas
                </Text>
                <TextInput
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="+1 (809) 000-0000"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Instagram
                </Text>
                <TextInput
                  value={instagram}
                  onChangeText={setInstagram}
                  placeholder="@tunegocio"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  TikTok
                </Text>
                <TextInput
                  value={tiktok}
                  onChangeText={setTiktok}
                  placeholder="@tunegocio_style"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>
            )}

            {/* PASO 3 */}
            {currentStep === 3 && (
              <View style={styles.stepForm}>
                <View style={styles.infoCapsule}>
                  <Ionicons name="time-outline" size={20} color="#BA8609" />
                  <Text style={[styles.infoCapsuleText, { color: colors.textPrimary }]}>
                    Define el horario regular de atención. Podrás personalizar cada día en cualquier momento desde tu agenda.
                  </Text>
                </View>

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Hora de Apertura
                </Text>
                <TextInput
                  value={horaApertura}
                  onChangeText={setHoraApertura}
                  placeholder="09:00:00"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Hora de Cierre
                </Text>
                <TextInput
                  value={horaCierre}
                  onChangeText={setHoraCierre}
                  placeholder="21:00:00"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>
            )}

            {/* PASO 4 */}
            {currentStep === 4 && (
              <View style={styles.stepForm}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Nombre del Servicio Principal
                </Text>
                <TextInput
                  value={servicioNombre}
                  onChangeText={setServicioNombre}
                  placeholder="Ej: Corte Clásico & Perfilado"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Precio (DOP)
                </Text>
                <TextInput
                  value={servicioPrecio}
                  onChangeText={setServicioPrecio}
                  placeholder="500"
                  keyboardType="numeric"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Duración aproximada (minutos)
                </Text>
                <TextInput
                  value={servicioDuracion}
                  onChangeText={setServicioDuracion}
                  placeholder="45"
                  keyboardType="numeric"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>
            )}

            {/* PASO 5 */}
            {currentStep === 5 && (
              <View style={styles.stepForm}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Nombre del Especialista / Barbero
                </Text>
                <TextInput
                  value={barberoNombre}
                  onChangeText={setBarberoNombre}
                  placeholder="Ej: Carlos Ramírez"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Especialidad
                </Text>
                <TextInput
                  value={barberoEspecialidad}
                  onChangeText={setBarberoEspecialidad}
                  placeholder="Ej: Fade Master & Barba Tradicional"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F6EEDC',
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>
            )}
          </ScrollView>

          {/* Botones de Navegación Inferiores */}
          <View style={styles.footerRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={() => setCurrentStep((prev) => prev - 1)}
                disabled={saving}
                activeOpacity={0.8}
                style={[
                  styles.backBtn,
                  { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' },
                ]}>
                <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Atrás</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={saving}
              activeOpacity={0.88}
              style={[styles.nextBtnWrapper, currentStep === 1 && { flex: 1 }]}>
              <LinearGradient
                colors={['#BA8609', '#F3DA80', '#D4AF37']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.nextBtn, Shadows.goldButtonDrop]}>
                {saving ? (
                  <ActivityIndicator size="small" color="#1C1C1C" />
                ) : (
                  <>
                    <Text style={styles.nextBtnText}>
                      {currentStep === 5 ? 'Guardar y Finalizar' : 'Continuar'}
                    </Text>
                    <Ionicons
                      name={currentStep === 5 ? 'checkmark-circle' : 'arrow-forward'}
                      size={17}
                      color="#1C1C1C"
                      style={{ marginLeft: 6 }}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  progressContainer: {
    marginBottom: Spacing.base,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepCountText: {
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'right',
  },
  scrollBody: {
    paddingVertical: Spacing.xs,
  },
  stepForm: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  textArea: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  infoCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(186,134,9,0.12)',
    marginBottom: 8,
  },
  infoCapsuleText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.base,
    paddingTop: Spacing.xs,
  },
  backBtn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtnWrapper: {
    flex: 1,
  },
  nextBtn: {
    paddingVertical: 13,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
  },
});
