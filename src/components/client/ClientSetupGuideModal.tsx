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
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/common/UserAvatar';
import { User } from '@/api/types';
import { Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onCompleted?: () => void;
}

const PRESET_AVATARS = [
  { id: 'initials', label: 'Mis Iniciales', url: '' },
  { id: 'av1', label: 'Estilo 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Estilo 2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Estilo 3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Estilo 4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
];

export function ClientSetupGuideModal({
  visible,
  onClose,
  currentUser,
  onCompleted,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const { updateProfile } = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Paso 1: Nombre y Apellido
  const [name, setName] = useState(currentUser?.name || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');

  // Paso 2: Avatar / Foto
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Paso 3: Teléfono
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Paso 4: Ciudad
  const [city, setCity] = useState('Santo Domingo');

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        showWarning('Nombre obligatorio', 'Por favor ingresa tu nombre de usuario.');
        return;
      }
      if (!lastName.trim()) {
        showWarning('Apellido obligatorio', 'Por favor ingresa tu apellido.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!phone.trim()) {
        showWarning('Teléfono requerido', 'Por favor ingresa tu número de contacto para confirmar citas.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Guardar todo el perfil en Supabase
      setSaving(true);
      try {
        await updateProfile({
          name: name.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
          avatarUrl: selectedAvatarUrl.trim() || null,
        });

        showSuccess(
          '¡Perfil Configurado!',
          'Tus datos han quedado guardados con éxito. Ahora puedes reservar tus citas sin demoras.'
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
    { num: 1, title: 'Nombre', subtitle: 'Tu nombre y apellido oficial' },
    { num: 2, title: 'Avatar', subtitle: 'Foto de perfil o iniciales' },
    { num: 3, title: 'Teléfono', subtitle: 'Para confirmaciones y alertas' },
    { num: 4, title: 'Ubicación', subtitle: 'Ciudad para barberías cercanas' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#1C1914' : '#FBF8F3' },
            Shadows.drop,
          ]}>
          {/* Header con Título y Botón Cerrar */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.sparkleBadge}>
                <Ionicons name="sparkles" size={16} color="#BA8609" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  Configura tu Perfil
                </Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                  Paso {currentStep} de 4: {stepsInfo[currentStep - 1].title}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Stepper Dots & Indicator */}
          <View style={styles.stepperTrack}>
            {stepsInfo.map((st) => (
              <View
                key={`step-${st.num}`}
                style={[
                  styles.stepperDot,
                  {
                    backgroundColor:
                      st.num <= currentStep ? '#BA8609' : isDark ? '#3D3728' : '#E8DEC8',
                    flex: 1,
                  },
                ]}
              />
            ))}
          </View>

          {/* Contenido según el paso */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {currentStep === 1 && (
              <View style={styles.stepBox}>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  {stepsInfo[0].subtitle}. Tus profesionales verán este nombre al recibir tus reservas.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Nombre *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Carlos, Juan"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                      borderColor: isDark ? '#3D372A' : '#E3DBD0',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Apellido *</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Ej: Pérez, Rodríguez"
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                      borderColor: isDark ? '#3D372A' : '#E3DBD0',
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>
            )}

            {currentStep === 2 && (
              <View style={styles.stepBox}>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Selecciona cómo quieres que se vea tu perfil. Si prefieres no usar foto, mostraremos tus iniciales con estilo doradas.
                </Text>

                {/* Preview del Avatar */}
                <View style={styles.avatarPreviewCenter}>
                  <UserAvatar
                    size={80}
                    avatarUrl={selectedAvatarUrl || null}
                    name={name}
                    lastName={lastName}
                    borderWidth={2.5}
                  />
                  <Text style={[styles.previewName, { color: colors.textPrimary }]}>
                    {name ? `${name} ${lastName}`.trim() : 'Tu Nombre'}
                  </Text>
                </View>

                {/* Opciones de Avatares */}
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                  Elige un avatar o estilo
                </Text>
                <View style={styles.presetsRow}>
                  {PRESET_AVATARS.map((av) => {
                    const isSelected = selectedAvatarUrl === av.url;
                    return (
                      <TouchableOpacity
                        key={av.id}
                        onPress={() => setSelectedAvatarUrl(av.url)}
                        activeOpacity={0.8}
                        style={[
                          styles.presetItem,
                          isSelected && styles.presetItemSelected,
                        ]}>
                        <UserAvatar
                          size={44}
                          avatarUrl={av.url || null}
                          name={name}
                          lastName={lastName}
                          borderWidth={isSelected ? 2 : 1}
                          borderColor={isSelected ? '#BA8609' : '#D1C4A5'}
                        />
                        <Text
                          style={[
                            styles.presetLabel,
                            { color: isSelected ? '#BA8609' : colors.textSecondary },
                          ]}>
                          {av.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {currentStep === 3 && (
              <View style={styles.stepBox}>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  {stepsInfo[2].subtitle}. Indispensable para contactarte si el local tiene alguna novedad o confirmación previa a tu corte.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                  Número de Teléfono / WhatsApp *
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="809-555-0123"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                      borderColor: isDark ? '#3D372A' : '#E3DBD0',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <View style={styles.infoCallout}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#188E1C" style={{ marginRight: 8 }} />
                  <Text style={[styles.infoCalloutText, { color: colors.textSecondary }]}>
                    Tu número se mantendrá privado y sólo se compartirá con el profesional donde reserves tu cita.
                  </Text>
                </View>
              </View>
            )}

            {currentStep === 4 && (
              <View style={styles.stepBox}>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  {stepsInfo[3].subtitle}. Así te mostraremos barberías y especialistas con disponibilidad cerca de tu zona.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Ciudad o Municipio</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Santo Domingo, Santiago, etc."
                  placeholderTextColor={colors.placeholder}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                      borderColor: isDark ? '#3D372A' : '#E3DBD0',
                      color: colors.textPrimary,
                    },
                  ]}
                />

                <View style={styles.summaryBox}>
                  <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                    Resumen de tu cuenta
                  </Text>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Nombre:</Text>
                    <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                      {name} {lastName}
                    </Text>
                  </View>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Teléfono:</Text>
                    <Text style={[styles.summaryVal, { color: '#BA8609' }]}>{phone}</Text>
                  </View>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Ciudad:</Text>
                    <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>{city}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Botones de Navegación Inferior */}
          <View style={styles.bottomActionsRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={() => setCurrentStep((prev) => prev - 1)}
                disabled={saving}
                style={[styles.backStepBtn, { borderColor: isDark ? '#3D3728' : '#D1C4A5' }]}>
                <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
                <Text style={[styles.backStepBtnText, { color: colors.textPrimary }]}>Atrás</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={saving}
              activeOpacity={0.88}
              style={[styles.nextStepBtn, Shadows.goldButtonDrop, { flex: 1 }]}>
              <LinearGradient
                colors={['#BA8609', '#F3DA80', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextGradient}>
                {saving ? (
                  <ActivityIndicator color="#1C1C1C" />
                ) : (
                  <>
                    <Text style={styles.nextStepBtnText}>
                      {currentStep === 4 ? 'Finalizar y Guardar' : 'Continuar'}
                    </Text>
                    <Ionicons name="arrow-forward" size={17} color="#1C1C1C" style={{ marginLeft: 6 }} />
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sparkleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(186, 134, 9, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  stepperTrack: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
  },
  stepperDot: {
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  stepBox: {
    gap: 10,
  },
  stepDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 4,
  },
  textInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  avatarPreviewCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  presetItem: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    width: '30%',
  },
  presetItemSelected: {
    borderColor: '#BA8609',
    backgroundColor: 'rgba(186, 134, 9, 0.1)',
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  infoCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(24, 142, 28, 0.08)',
    marginTop: 8,
  },
  infoCalloutText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
  summaryBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(186, 134, 9, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(186, 134, 9, 0.2)',
    marginTop: 8,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryVal: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
  },
  backStepBtn: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backStepBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  nextStepBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextGradient: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
  },
});
