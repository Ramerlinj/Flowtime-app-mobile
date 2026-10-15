import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Gradients, BrandColors } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

export interface ServiceItem {
  id: string;
  name: string;
  duration: number; // minutos
  description: string;
  price: number;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: '1',
    name: 'Corte Adulto sin barba',
    duration: 40,
    description: 'Solo corte no incluye la barba al afeitarse.',
    price: 300,
  },
  {
    id: '2',
    name: 'Corte y barba o afeitado',
    duration: 50,
    description: 'Es el corte y el afeitado o barba.',
    price: 700,
  },
  {
    id: '3',
    name: 'Cerquillo',
    duration: 20,
    description: 'Es el corte y el afeitado o barba.',
    price: 300,
  },
  {
    id: '4',
    name: 'Corte de Niños hasta 12 años',
    duration: 40,
    description: 'Es el corte y el afeitado o barba.',
    price: 500,
  },
];

export default function SelectServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  // Por defecto el servicio 2 ("Corte y barba o afeitado") está seleccionado tal como en el mockup
  const [selectedIds, setSelectedIds] = useState<string[]>(['2']);

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = SERVICES_DATA.filter((s) => selectedIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const count = selectedServices.length;

  const handleContinue = () => {
    if (count === 0) {
      Alert.alert(
        'Selecciona un servicio',
        'Por favor selecciona al menos un servicio para poder agendar tu cita.'
      );
      return;
    }

    const mainService = selectedServices[0];
    router.push({
      pathname: '/client/select-professional',
      params: {
        serviceId: mainService?.id || '2',
        serviceName: mainService?.name || 'Corte y barba o afeitado',
        totalPrice: totalPrice.toString(),
        totalDuration: totalDuration.toString(),
        count: count.toString(),
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

      {/* Cabecera con Botón de Regreso y Título */}
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
          Selecciona tu servicio
        </Text>
      </View>

      {/* Lista de Servicios */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {SERVICES_DATA.map((service) => {
          const isSelected = selectedIds.includes(service.id);

          return (
            <TouchableOpacity
              key={service.id}
              onPress={() => toggleService(service.id)}
              activeOpacity={0.92}
              style={[
                styles.serviceCard,
                { backgroundColor: colors.card },
                Shadows.drop,
              ]}>
              {/* Título del Servicio */}
              <Text style={[styles.serviceTitle, { color: colors.textPrimary }]}>
                {service.name}
              </Text>

              {/* Duración */}
              <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>
                {service.duration} min
              </Text>

              {/* Descripción */}
              <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                {service.description}
              </Text>

              {/* Fila Inferior de la Card: Precio y Botón Seleccionar */}
              <View style={styles.cardBottomRow}>
                <Text style={styles.servicePrice}>DOP {service.price}</Text>

                {isSelected ? (
                  <View style={styles.selectedButtonWrapper}>
                    <LinearGradient
                      colors={['#B8860B', '#D4AF37']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.selectedButton, Shadows.drop]}>
                      <Text style={styles.selectedButtonText}>Seleccionado</Text>
                    </LinearGradient>
                  </View>
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

      {/* Barra Inferior Fija (Sticky Footer de Selección) */}
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
            {count === 0
              ? 'Selecciona un servicio'
              : `${count} Servicio${count > 1 ? 's' : ''} seleccionado${count > 1 ? 's' : ''} · ${totalDuration} min`}
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
  serviceCard: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  serviceDuration: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  serviceDescription: {
    fontSize: 13.5,
    lineHeight: 18.5,
    marginTop: 6,
    marginBottom: 14,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#E9A83A',
  },
  selectedButtonWrapper: {
    borderRadius: BorderRadius.pill,
  },
  selectedButton: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unselectedButton: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#B8860B',
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
