import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { DarkModeToggle } from '@/components/common/DarkModeToggle';

interface ServiceHistoryItem {
  id: string;
  name: string;
  description: string;
  date: string;
  year: string;
}

const DEFAULT_SERVICE_HISTORY: ServiceHistoryItem[] = [
  {
    id: 'h1',
    name: 'Taper Fade',
    description: 'Descripción',
    date: '15 de Sep',
    year: 'de 2026',
  },
  {
    id: 'h2',
    name: 'Barba',
    description: 'Descripción',
    date: '13 de Sep',
    year: 'de 2026',
  },
];

const CLIENT_DATA: Record<
  string,
  {
    name: string;
    initials: string;
    phone: string;
    nextAppointment: string;
    notes: string;
  }
> = {
  '1': {
    name: 'Juan R.',
    initials: 'JR',
    phone: '809-000-0000',
    nextAppointment: 'Mañana 4:00 P.M.',
    notes: '',
  },
  '2': {
    name: 'Pedro M.',
    initials: 'PM',
    phone: '809-000-0000',
    nextAppointment: 'Jueves 24 a las 5:00 P.M.',
    notes: '',
  },
  '3': {
    name: 'Carlos Ramírez',
    initials: 'CR',
    phone: '809-555-1234',
    nextAppointment: 'Viernes 25 a las 11:00 A.M.',
    notes: '',
  },
  '4': {
    name: 'Mateo Díaz',
    initials: 'MD',
    phone: '829-444-9876',
    nextAppointment: 'Sábado 26 a las 2:30 P.M.',
    notes: '',
  },
};

export default function AdminClientDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string; phone?: string; initials?: string; nextAppointment?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const clientId = params.id || '1';
  const baseClient = CLIENT_DATA[clientId] || {
    name: params.name || 'Juan R.',
    initials: params.initials || 'JR',
    phone: params.phone || '809-000-0000',
    nextAppointment: params.nextAppointment || 'Mañana 4:00 P.M.',
    notes: '',
  };

  const clientName = params.name || baseClient.name;
  const clientInitials = params.initials || baseClient.initials;
  const clientPhone = params.phone || baseClient.phone;
  const clientNextApp = params.nextAppointment || baseClient.nextAppointment;

  const [notes, setNotes] = useState<string>(baseClient.notes);
  const [history] = useState<ServiceHistoryItem[]>(DEFAULT_SERVICE_HISTORY);

  const handleOpenChat = () => {
    Alert.alert(
      `Chat con ${clientName}`,
      `¿Deseas abrir WhatsApp para escribir al ${clientPhone}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir WhatsApp',
          onPress: () => {
            Linking.openURL(
              `https://wa.me/18090000000?text=Hola%20${encodeURIComponent(clientName)},%20te%20escribimos%20de%20Flowtime.`
            ).catch(() => {
              Alert.alert('Aviso', 'No se pudo abrir WhatsApp.');
            });
          },
        },
      ]
    );
  };

  const handleCall = () => {
    Alert.alert(
      `Llamar a ${clientName}`,
      `¿Deseas iniciar una llamada al ${clientPhone}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: () => {
            Linking.openURL(`tel:${clientPhone}`).catch(() => {
              Alert.alert('Aviso', 'No se pudo iniciar la llamada.');
            });
          },
        },
      ]
    );
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

      {/* Toggle de Modo Oscuro Flotante */}
      <DarkModeToggle />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Cabecera Superior: Logo Flowtime */}
        <View style={styles.topHeaderRow}>
          <Image
            source={require('@/assets/images/flowtime-logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        {/* Fila de Regreso con Nombre del Cliente */}
        <View style={styles.navigationRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.navClientName, { color: colors.textPrimary }]}>
            {clientName}
          </Text>
        </View>

        {/* Sección 1: Detalles del Cliente */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Detalles del Cliente
        </Text>

        <View
          style={[
            styles.card,
            styles.clientDetailsCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          {/* Fila Superior: Avatar + Info */}
          <View style={styles.clientMainRow}>
            {/* Avatar Circular Dorado */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{clientInitials}</Text>
            </View>

            {/* Info Texto */}
            <View style={styles.clientInfoCol}>
              <Text style={[styles.clientNameText, { color: colors.textPrimary }]}>
                {clientName}
              </Text>
              <Text style={[styles.clientPhoneText, { color: colors.textSecondary }]}>
                {clientPhone}
              </Text>
              <View style={styles.nextAppointmentRow}>
                <Text style={[styles.nextAppointmentLabel, { color: colors.textSecondary }]}>
                  Proxima Cita:{' '}
                </Text>
                <Text style={styles.nextAppointmentValue}>
                  {clientNextApp}
                </Text>
              </View>
            </View>
          </View>

          {/* Divisor Horizontal */}
          <View
            style={[
              styles.cardDivider,
              { backgroundColor: isDark ? '#2E2B25' : '#EAE6DF' },
            ]}
          />

          {/* Fila de Acciones: Chat y Llamar */}
          <View style={styles.actionsRow}>
            {/* Botón Chat Dorado */}
            <TouchableOpacity
              onPress={handleOpenChat}
              activeOpacity={0.85}
              style={styles.chatButtonWrapper}>
              <LinearGradient
                colors={['#B8860B', '#F3DA80', '#D4AF37']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.chatButton, Shadows.goldButtonDrop]}>
                <Ionicons
                  name="chatbubble-outline"
                  size={17}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.chatButtonText}>Chat</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón Llamar con Borde */}
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.8}
              style={[
                styles.callButton,
                {
                  backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                  borderColor: isDark ? '#4B4636' : '#5E584D',
                },
              ]}>
              <Ionicons
                name="call-outline"
                size={17}
                color={colors.textPrimary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.callButtonText, { color: colors.textPrimary }]}>
                Llamar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección 2: Preferencias y Notas */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Preferencias y Notas
        </Text>

        <View
          style={[
            styles.card,
            styles.notesCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Escribe aquí los detalles y preferencias del cliente"
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
            style={[styles.notesInput, { color: colors.textPrimary }]}
          />
        </View>

        {/* Sección 3: Historial de Servicios */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Historial de Servicios
        </Text>

        <View style={styles.historyList}>
          {history.map((item) => (
            <View
              key={item.id}
              style={[
                styles.historyCard,
                { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
                Shadows.drop,
              ]}>
              <View style={styles.historyLeftCol}>
                <Text style={[styles.historyName, { color: colors.textPrimary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.historyDesc, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>

              <View style={styles.historyRightCol}>
                <Text style={[styles.historyDate, { color: colors.textPrimary }]}>
                  {item.date}
                </Text>
                <Text style={[styles.historyYear, { color: colors.textSecondary }]}>
                  {item.year}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    gap: 6,
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
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  navClientName: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    borderRadius: 20,
    padding: 16,
  },
  clientDetailsCard: {
    marginBottom: 10,
  },
  clientMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D7A84B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clientInfoCol: {
    flex: 1,
    marginLeft: 16,
  },
  clientNameText: {
    fontSize: 19,
    fontWeight: '700',
  },
  clientPhoneText: {
    fontSize: 14,
    marginTop: 2,
  },
  nextAppointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  nextAppointmentLabel: {
    fontSize: 12.5,
  },
  nextAppointmentValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#188E1C',
  },
  cardDivider: {
    height: 1,
    marginVertical: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  chatButtonWrapper: {
    flex: 1,
  },
  chatButton: {
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  callButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  notesCard: {
    minHeight: 180,
    marginBottom: 10,
  },
  notesInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 150,
  },
  historyList: {
    gap: 10,
    marginBottom: 20,
  },
  historyCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeftCol: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyDesc: {
    fontSize: 12.5,
    marginTop: 2,
  },
  historyRightCol: {
    alignItems: 'flex-end',
  },
  historyDate: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  historyYear: {
    fontSize: 12,
    marginTop: 2,
  },
});
