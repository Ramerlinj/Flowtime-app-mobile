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

interface ProfessionalOption {
  id: string;
  name: string;
  subtitle: string;
  initials?: string;
  isAvailable: boolean;
  isAny?: boolean;
}

const PROFESSIONALS: ProfessionalOption[] = [
  {
    id: 'any',
    name: 'Seleccionar cualquier',
    subtitle: 'Disponible para citas hoy',
    isAvailable: true,
    isAny: true,
  },
  {
    id: 'diego',
    name: 'Diego Tejeda',
    subtitle: 'Disponible para citas hoy',
    initials: 'DT',
    isAvailable: true,
  },
  {
    id: 'julio',
    name: 'Julio Martinéz',
    subtitle: 'No está disponible',
    initials: 'JM',
    isAvailable: false,
  },
];

export default function SelectProfessionalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  // Por defecto "any" ("Seleccionar cualquier") está seleccionado como en el mockup
  const [selectedProfId, setSelectedProfId] = useState<string>('any');

  const totalPrice = params.totalPrice ? params.totalPrice.toString() : '700';
  const totalDuration = params.totalDuration ? params.totalDuration.toString() : '40';
  const count = params.count ? params.count.toString() : '1';
  const serviceName = params.serviceName
    ? params.serviceName.toString()
    : 'Corte y barba o afeitado';

  const selectedProfessional = PROFESSIONALS.find((p) => p.id === selectedProfId);

  const handleContinue = () => {
    if (!selectedProfId) return;

    router.push({
      pathname: '/client/select-datetime',
      params: {
        ...params,
        professionalId: selectedProfId,
        professionalName:
          selectedProfId === 'any'
            ? 'Cualquier barbero'
            : selectedProfessional?.name || 'Diego Tejeda',
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
          Selecciona el Profesional
        </Text>
      </View>

      {/* Lista de Profesionales */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {PROFESSIONALS.map((prof) => {
          const isSelected = selectedProfId === prof.id;

          return (
            <TouchableOpacity
              key={prof.id}
              disabled={!prof.isAvailable}
              onPress={() => setSelectedProfId(prof.id)}
              activeOpacity={prof.isAvailable ? 0.9 : 1}
              style={[
                styles.profCard,
                {
                  backgroundColor:
                    prof.id === 'diego' && !isDark
                      ? '#E2F2E9' // Tono menta suave de la captura
                      : colors.card,
                  opacity: prof.isAvailable ? 1 : 0.8,
                },
                Shadows.drop,
              ]}>
              {/* Badge o Avatar */}
              <View style={styles.avatarWrapper}>
                {prof.isAny ? (
                  <View style={styles.anyAvatarCircle}>
                    <Ionicons name="swap-horizontal" size={22} color="#8E6D18" />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.initialsCircle,
                      {
                        backgroundColor: prof.isAvailable ? '#D9B452' : '#CFCAC0',
                      },
                    ]}>
                    <Text style={styles.initialsText}>{prof.initials}</Text>
                    {/* Indicador de disponibilidad */}
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: prof.isAvailable ? '#188E1C' : '#9E9E9E',
                        },
                      ]}
                    />
                  </View>
                )}
              </View>

              {/* Textos */}
              <View style={styles.textCol}>
                <Text
                  style={[
                    styles.profName,
                    {
                      color: prof.isAvailable ? colors.textPrimary : colors.textSecondary,
                    },
                  ]}>
                  {prof.name}
                </Text>
                <Text style={[styles.profSubtitle, { color: colors.textSecondary }]}>
                  {prof.subtitle}
                </Text>
              </View>

              {/* Botón Estado */}
              <View style={styles.actionCol}>
                {!prof.isAvailable ? (
                  <View style={styles.pausedButton}>
                    <Text style={styles.pausedButtonText}>En pausa</Text>
                  </View>
                ) : isSelected ? (
                  <LinearGradient
                    colors={['#B8860B', '#D4AF37']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.selectedButton, Shadows.drop]}>
                    <Text style={styles.selectedButtonText}>Seleccionado</Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.unselectedButton,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2EADC',
                      },
                      Shadows.drop,
                    ]}>
                    <Text style={styles.unselectedButtonText}>Seleccionar</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
          disabled={!selectedProfId}
          activeOpacity={0.88}
          style={styles.continueButtonWrapper}>
          <LinearGradient
            colors={['#B8860B', '#F3DA80', '#D4AF37']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.continueButton,
              Shadows.goldButtonDrop,
              { opacity: selectedProfId ? 1 : 0.6 },
            ]}>
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
  profCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  anyAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDECB8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  textCol: {
    flex: 1,
  },
  profName: {
    fontSize: 15,
    fontWeight: '700',
  },
  profSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionCol: {
    marginLeft: 8,
  },
  selectedButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unselectedButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8860B',
  },
  pausedButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#EFEBE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8B3A8',
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
