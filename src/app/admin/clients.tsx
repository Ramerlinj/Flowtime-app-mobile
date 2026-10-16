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
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav';

export interface AdminClientItem {
  id: string;
  name: string;
  initials: string;
  phone: string;
  nextAppointment: string;
}

const INITIAL_CLIENTS: AdminClientItem[] = [
  {
    id: '1',
    name: 'Juan R.',
    initials: 'JR',
    phone: '809-000-0000',
    nextAppointment: 'Mañana 4:00 P.M.',
  },
  {
    id: '2',
    name: 'Pedro M.',
    initials: 'PM',
    phone: '809-000-0000',
    nextAppointment: 'Jueves 24 a las 5:00 P.M.',
  },
  {
    id: '3',
    name: 'Carlos Ramírez',
    initials: 'CR',
    phone: '809-555-1234',
    nextAppointment: 'Viernes 25 a las 11:00 A.M.',
  },
  {
    id: '4',
    name: 'Mateo Díaz',
    initials: 'MD',
    phone: '829-444-9876',
    nextAppointment: 'Sábado 26 a las 2:30 P.M.',
  },
];

export default function AdminClientsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar clientes según búsqueda
  const filteredClients = INITIAL_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleOpenChat = (client: AdminClientItem) => {
    Alert.alert(
      `Contactar a ${client.name}`,
      `¿Deseas enviar un mensaje o llamar al ${client.phone}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'WhatsApp',
          onPress: () => {
            Linking.openURL(`https://wa.me/18090000000?text=Hola%20${encodeURIComponent(client.name)},%20te%20escribimos%20de%20Flowtime.`).catch(() => {
              Alert.alert('Aviso', 'No se pudo abrir WhatsApp.');
            });
          },
        },
        {
          text: 'Llamar',
          onPress: () => {
            Linking.openURL(`tel:${client.phone}`).catch(() => {
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

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
            paddingBottom: insets.bottom + 90,
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

        {/* Título de la Sección */}
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
          Mis Clientes
        </Text>

        {/* Barra de Búsqueda */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre o teléfono..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Tarjetas de Clientes */}
        <View style={styles.clientsList}>
          {filteredClients.map((client) => (
            <TouchableOpacity
              key={client.id}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/admin/client/[id]',
                  params: {
                    id: client.id,
                    name: client.name,
                    initials: client.initials,
                    phone: client.phone,
                    nextAppointment: client.nextAppointment,
                  },
                })
              }
              style={[
                styles.clientCard,
                { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
                Shadows.drop,
              ]}>
              {/* Círculo de Iniciales Dorado */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{client.initials}</Text>
              </View>

              {/* Información del Cliente */}
              <View style={styles.clientInfoCol}>
                <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                  {client.name}
                </Text>
                <Text style={[styles.clientPhone, { color: colors.textSecondary }]}>
                  {client.phone}
                </Text>
                <View style={styles.appointmentRow}>
                  <Text style={[styles.appointmentLabel, { color: colors.textSecondary }]}>
                    Proxima Cita:{' '}
                  </Text>
                  <Text style={styles.appointmentValue}>
                    {client.nextAppointment}
                  </Text>
                </View>
              </View>

              {/* Botón Circular Dorado de Chat */}
              <TouchableOpacity
                onPress={() => handleOpenChat(client)}
                activeOpacity={0.8}
                style={[styles.chatBtn, Shadows.goldButtonDrop]}>
                <Ionicons
                  name="chatbubble-outline"
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {filteredClients.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={colors.placeholder} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No se encontraron clientes con "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Admin) */}
      <AdminBottomNav currentTab="clientes" />
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  clientsList: {
    gap: 12,
  },
  clientCard: {
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D7A84B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clientInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  clientName: {
    fontSize: 16.5,
    fontWeight: '700',
  },
  clientPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  appointmentLabel: {
    fontSize: 12,
  },
  appointmentValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#188E1C',
  },
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#BA8609',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
