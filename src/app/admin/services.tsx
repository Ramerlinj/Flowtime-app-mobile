import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { businessService } from '@/api/business.service';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { CustomSwitch } from '@/components/common/CustomSwitch';
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  active: boolean;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: '1',
    name: 'Taper Fade',
    description: 'Corte tradicional degradado y perfilado',
    duration: '30 min',
    price: 300,
    active: true,
  },
  {
    id: '2',
    name: 'Barba',
    description: 'Perfilado y toalla caliente',
    duration: '30 min',
    price: 250,
    active: true,
  },
];

export default function AdminServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const { showWarning, showSuccess, showError, showConfirm } = useAlert();

  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modales de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('30 min');
  const [formDescription, setFormDescription] = useState('Descripción');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServicesData = async (bIdParam?: string | null) => {
    try {
      let bId = bIdParam || businessId;
      if (!bId && user?.id) {
        const b = await businessService.getBusinessByOwnerId(user.id);
        if (b) {
          bId = b.id;
          setBusinessId(b.id);
        } else {
          setBusinessId(null);
          setServices([]);
        }
      }

      if (bId) {
        const list = await businessService.getAllServicesForAdmin(bId);
        setServices(
          list.map((s) => ({
            id: s.id,
            name: s.nombre,
            description: s.descripcion || 'Descripción',
            duration: `${s.duracion_minutos} min`,
            price: Number(s.precio),
            active: s.activo,
          }))
        );
      } else {
        setServices([]);
      }
    } catch (e) {
      console.warn('[AdminServices] Error al sincronizar servicios:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      let bId = businessId;
      if (!bId && user?.id) {
        const b = await businessService.getBusinessByOwnerId(user.id);
        if (b && isMounted) {
          bId = b.id;
          setBusinessId(b.id);
        } else if (isMounted) {
          setBusinessId(null);
          setServices([]);
        }
      }

      if (bId) {
        const list = await businessService.getAllServicesForAdmin(bId);
        if (isMounted) {
          setServices(
            list.map((s) => ({
              id: s.id,
              name: s.nombre,
              description: s.descripcion || 'Descripción',
              duration: `${s.duracion_minutos} min`,
              price: Number(s.precio),
              active: s.activo,
            }))
          );
        }
      } else if (isMounted) {
        setServices([]);
      }
      if (isMounted) {
        setLoading(false);
        setRefreshing(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user?.id, businessId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServicesData();
  };

  const activeCount = services.filter((s) => s.active).length;

  const handleToggleActive = async (id: string, newActive: boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: newActive } : s))
    );
    try {
      await businessService.updateService(id, { activo: newActive });
    } catch (e) {
      console.warn('[AdminServices] Error al actualizar estado activo:', e);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingServiceId(null);
    setFormName('');
    setFormPrice('');
    setFormDuration('30 min');
    setFormDescription('Descripción');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setFormName(service.name);
    setFormPrice(service.price.toString());
    setFormDuration(service.duration);
    setFormDescription(service.description);
    setIsModalOpen(true);
  };

  const handleDeleteService = (id: string, name: string) => {
    showConfirm(
      'Eliminar servicio',
      `¿Deseas eliminar "${name}" del catálogo?`,
      async () => {
        try {
          await businessService.deleteService(id);
          setServices((prev) => prev.filter((s) => s.id !== id));
          showSuccess('Servicio Eliminado', `"${name}" fue removido exitosamente.`);
        } catch (err: any) {
          showError('Error', err.message || 'No se pudo eliminar el servicio.');
        }
      },
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
      }
    );
  };

  const handleSaveService = async () => {
    if (!formName.trim() || !formPrice.trim()) {
      showWarning('Datos incompletos', 'Por favor ingresa nombre y precio.');
      return;
    }

    const priceNum = parseFloat(formPrice) || 0;
    const durNum = parseInt(formDuration.replace(/\D/g, ''), 10) || 30;

    setIsSubmitting(true);
    try {
      if (editingServiceId) {
        await businessService.updateService(editingServiceId, {
          nombre: formName.trim(),
          precio: priceNum,
          duracion_minutos: durNum,
          descripcion: formDescription.trim() || 'Descripción',
        });

        setServices((prev) =>
          prev.map((s) =>
            s.id === editingServiceId
              ? {
                  ...s,
                  name: formName.trim(),
                  price: priceNum,
                  duration: `${durNum} min`,
                  description: formDescription.trim() || 'Descripción',
                }
              : s
          )
        );
        showSuccess('Servicio Actualizado', `El servicio "${formName}" ha sido actualizado.`);
      } else {
        if (businessId) {
          const created = await businessService.createService({
            business_id: businessId,
            nombre: formName.trim(),
            precio: priceNum,
            duracion_minutos: durNum,
            descripcion: formDescription.trim() || 'Descripción',
          });

          setServices((prev) => [
            ...prev,
            {
              id: created.id,
              name: created.nombre,
              description: created.descripcion || 'Descripción',
              duration: `${created.duracion_minutos} min`,
              price: Number(created.precio),
              active: created.activo,
            },
          ]);
        } else {
          const newService: ServiceItem = {
            id: Date.now().toString(),
            name: formName.trim(),
            description: formDescription.trim() || 'Descripción',
            duration: `${durNum} min`,
            price: priceNum,
            active: true,
          };
          setServices((prev) => [...prev, newService]);
        }
        showSuccess('Servicio Creado', `El servicio "${formName}" ha sido añadido al catálogo.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showError('Error', err.message || 'No fue posible guardar el servicio.');
    } finally {
      setIsSubmitting(false);
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
            tintColor="#BA8609"
            colors={['#BA8609']}
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

        {/* Título de Pantalla con Botón de Regreso */}
        <View style={styles.screenTitleRow}>
          <TouchableOpacity
            onPress={() => router.push('/admin')}
            activeOpacity={0.7}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.screenTitleCol}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
              Catálogo de Servicios y Precios
            </Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              {activeCount} activos de {services.length} servicios registrados
            </Text>
          </View>
        </View>

        {/* Lista de Servicios */}
        <View style={styles.servicesList}>
          {loading && (
            <ActivityIndicator size="small" color="#BA8609" style={{ marginVertical: 12 }} />
          )}
          {services.map((item) => {
            return (
              <View
                key={item.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
                  Shadows.drop,
                ]}>
                {/* Fila Superior: Nombre y Precio */}
                <View style={styles.cardTopRow}>
                  <View style={styles.cardNameCol}>
                    <Text
                      style={[
                        styles.serviceName,
                        { color: item.active ? colors.textPrimary : '#8E8E93' },
                      ]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.servicePrice,
                      { color: item.active ? '#BA8609' : '#8E8E93' },
                    ]}>
                    DOP {item.price}
                  </Text>
                </View>

                {/* Fila Inferior: Duración, Editar y Switch */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.cardBottomLeft}>
                    {/* Pill de Duración */}
                    <View
                      style={[
                        styles.durationPill,
                        { backgroundColor: isDark ? '#2C261A' : '#F6EFE3' },
                      ]}>
                      <Ionicons
                        name="hourglass-outline"
                        size={13}
                        color="#BA8609"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.durationPillText}>{item.duration}</Text>
                    </View>

                    {/* Botón Editar */}
                    <TouchableOpacity
                      onPress={() => handleOpenEditModal(item)}
                      activeOpacity={0.7}
                      style={[
                        styles.editButton,
                        {
                          backgroundColor: isDark ? '#2A2A2E' : '#FFFFFF',
                          borderColor: isDark ? '#3D3D42' : '#D5CCA9',
                        },
                      ]}>
                      <Ionicons
                        name="pencil"
                        size={12}
                        color={colors.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>
                        Editar
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Eliminar */}
                    <TouchableOpacity
                      onPress={() => handleDeleteService(item.id, item.name)}
                      activeOpacity={0.7}
                      style={[
                        styles.deleteButton,
                        {
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FDE8E8',
                          borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#F98080',
                        },
                      ]}>
                      <Ionicons name="trash-outline" size={13} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Fila Derecha: Estado y Switch */}
                  <View style={styles.switchGroup}>
                    <Text
                      style={[
                        styles.switchLabel,
                        { color: item.active ? '#BA8609' : '#8E8E93' },
                      ]}>
                      {item.active ? 'Activo' : 'Pausado'}
                    </Text>
                    <CustomSwitch
                      value={item.active}
                      onValueChange={(val) => handleToggleActive(item.id, val)}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Botón Flotante FAB: + Nuevo Servicio */}
      <TouchableOpacity
        onPress={handleOpenCreateModal}
        activeOpacity={0.88}
        style={[styles.fabButtonWrapper, { bottom: insets.bottom + 74 }]}>
        <LinearGradient
          colors={['#B8860B', '#F3DA80', '#D4AF37']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fabButton, Shadows.goldButtonDrop]}>
          <Text style={styles.fabButtonText}>+ Nuevo Servicio</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal: Crear / Editar Servicio */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
              Shadows.drop,
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {editingServiceId ? 'Editar Servicio' : 'Nuevo Servicio'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              {editingServiceId
                ? 'Actualiza el nombre, duración y tarifa del servicio.'
                : 'Define el nuevo corte o tratamiento para tu catálogo.'}
            </Text>

            {/* Input Nombre */}
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Nombre del Servicio
            </Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="Ej: Fade Clásico"
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

            {/* Input Precio */}
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Precio (DOP)
            </Text>
            <TextInput
              value={formPrice}
              onChangeText={setFormPrice}
              placeholder="Ej: 350"
              keyboardType="numeric"
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

            {/* Selector de Duración */}
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Duración
            </Text>
            <View style={styles.durationSelectorRow}>
              {['20 min', '30 min', '45 min', '60 min'].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  onPress={() => setFormDuration(dur)}
                  style={[
                    styles.durationOptionPill,
                    formDuration === dur
                      ? styles.durationOptionPillActive
                      : { backgroundColor: isDark ? '#26221A' : '#FFFFFF' },
                  ]}>
                  <Text
                    style={[
                      styles.durationOptionText,
                      formDuration === dur
                        ? styles.durationOptionTextActive
                        : { color: colors.textPrimary },
                    ]}>
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botón de Guardar */}
            <TouchableOpacity
              onPress={handleSaveService}
              disabled={isSubmitting}
              activeOpacity={0.88}
              style={[styles.saveServiceBtn, Shadows.goldButtonDrop, isSubmitting && { opacity: 0.7 }]}>
              {isSubmitting ? (
                <ActivityIndicator color="#121214" />
              ) : (
                <Text style={styles.saveServiceBtnText}>
                  {editingServiceId ? 'Guardar Cambios' : 'Crear Servicio'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barra de Navegación Inferior (Admin) */}
      <AdminBottomNav currentTab="servicios" />
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
  screenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  screenTitleCol: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    borderRadius: 18,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardNameCol: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  durationPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#BA8609',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fabButtonWrapper: {
    position: 'absolute',
    right: 18,
    zIndex: 90,
  },
  fabButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: BorderRadius.pill,
  },
  fabButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: Spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSub: {
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13.5,
    marginBottom: 8,
  },
  durationSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationOptionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationOptionPillActive: {
    backgroundColor: '#BA8609',
  },
  durationOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveServiceBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BA8609',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveServiceBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
