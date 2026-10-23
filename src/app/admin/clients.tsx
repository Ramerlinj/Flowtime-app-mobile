import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Linking,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { businessService } from '@/api/business.service';
import { appointmentService } from '@/api/appointment.service';
import { Appointment } from '@/api/types';
import { Gradients } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav';

export interface AdminClientItem {
  id: string;
  name: string;
  initials: string;
  phone: string;
  nextAppointment: string;
}

export default function AdminClientsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { showAlert, showError } = useAlert();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [clientsList, setClientsList] = useState<AdminClientItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchClients() {
      if (!user?.id) return;
      try {
        const biz = await businessService.getBusinessByOwnerId(user.id);
        if (biz && isMounted) {
          const apps = await appointmentService.getBusinessAppointments(biz.id);
          if (apps && apps.length > 0 && isMounted) {
            const clientMap = new Map<string, AdminClientItem>();

            apps.forEach((a: Appointment) => {
              if (a.client) {
                const fullName = `${a.client.nombre} ${a.client.apellido || ''}`.trim();
                const initials = `${a.client.nombre?.[0] || 'C'}${a.client.apellido?.[0] || ''}`.toUpperCase();
                const phone = a.client.telefono || 'Sin teléfono';
                const nextAppStr = `${a.fecha} a las ${a.hora_inicio ? a.hora_inicio.slice(0, 5) : '12:00'}`;

                if (!clientMap.has(a.client.id)) {
                  clientMap.set(a.client.id, {
                    id: a.client.id,
                    name: fullName,
                    initials,
                    phone,
                    nextAppointment: nextAppStr,
                  });
                }
              }
            });

            if (clientMap.size > 0 && isMounted) {
              setClientsList(Array.from(clientMap.values()));
            }
          }
        }
      } catch (err) {
        console.warn('Error cargando clientes:', err);
      }
    }
    fetchClients();
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
          const apps = await appointmentService.getBusinessAppointments(biz.id);
          if (apps && apps.length > 0) {
            const clientMap = new Map<string, AdminClientItem>();
            apps.forEach((a: Appointment) => {
              if (a.client) {
                const fullName = `${a.client.nombre} ${a.client.apellido || ''}`.trim();
                const initials = `${a.client.nombre?.[0] || 'C'}${a.client.apellido?.[0] || ''}`.toUpperCase();
                const phone = a.client.telefono || 'Sin teléfono';
                const nextAppStr = `${a.fecha} a las ${a.hora_inicio ? a.hora_inicio.slice(0, 5) : '12:00'}`;
                if (!clientMap.has(a.client.id)) {
                  clientMap.set(a.client.id, {
                    id: a.client.id,
                    name: fullName,
                    initials,
                    phone,
                    nextAppointment: nextAppStr,
                  });
                }
              }
            });
            if (clientMap.size > 0) {
              setClientsList(Array.from(clientMap.values()));
            }
          }
        }
      } catch (err) {
        console.warn('Error refrescando clientes:', err);
      }
    }
    setRefreshing(false);
  };

  // Filtrar clientes según búsqueda
  const filteredClients = clientsList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleOpenChat = (client: AdminClientItem) => {
    showAlert({
      title: `Contactar a ${client.name}`,
      message: `¿Deseas enviar un WhatsApp al número ${client.phone}?`,
      type: 'info',
      confirmText: 'Abrir WhatsApp',
      cancelText: 'Cancelar',
      onConfirm: () => {
        Linking.openURL(
          `https://wa.me/18090000000?text=Hola%20${encodeURIComponent(client.name)},%20te%20escribimos%20de%20Flowtime.`
        ).catch(() => {
          showError('Aviso', 'No se pudo abrir WhatsApp.');
        });
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
              <Ionicons name="people-outline" size={44} color="#D4AF37" />
              <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
                {searchQuery.length > 0 ? 'Sin resultados' : 'Sin clientes registrados'}
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {searchQuery.length > 0
                  ? `No se encontraron clientes que coincidan con "${searchQuery}".`
                  : 'Tus clientes aparecerán aquí automáticamente en cuanto reserven una cita en tu negocio o los atiendas en tu agenda.'}
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
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
