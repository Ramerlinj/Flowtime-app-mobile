import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { businessService } from '@/api/business.service';
import { Business, Specialist } from '@/api/types';
import { Gradients } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav';
import { BusinessSetupCard } from '@/components/admin/BusinessSetupCard';
import { BusinessSetupGuideModal } from '@/components/admin/BusinessSetupGuideModal';
import { CustomSwitch } from '@/components/common/CustomSwitch';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&auto=format&fit=crop&q=80';

interface BarberWorker {
  id: string;
  name: string;
  initials: string;
  role: string;
  inTurn: boolean;
}

interface ScheduleDayState {
  dayName: string;
  dia_semana: number;
  isOpen: boolean;
  hours: string;
  hora_apertura: string;
  hora_cierre: string;
}

const INITIAL_SCHEDULE: ScheduleDayState[] = [
  { dayName: 'Lunes', dia_semana: 1, isOpen: true, hours: '9:00 AM - 9:00 PM', hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
  { dayName: 'Martes', dia_semana: 2, isOpen: true, hours: '9:00 AM - 9:00 PM', hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
  { dayName: 'Miércoles', dia_semana: 3, isOpen: true, hours: '9:00 AM - 9:00 PM', hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
  { dayName: 'Jueves', dia_semana: 4, isOpen: true, hours: '9:00 AM - 9:00 PM', hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
  { dayName: 'Viernes', dia_semana: 5, isOpen: true, hours: '9:00 AM - 9:00 PM', hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
  { dayName: 'Sábado', dia_semana: 6, isOpen: true, hours: '9:00 AM - 9:00 PM', hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
  { dayName: 'Domingo', dia_semana: 0, isOpen: false, hours: 'Cerrado', hora_apertura: '09:00:00', hora_cierre: '21:00:00' },
];

export default function AdminProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showConfirm } = useAlert();

  // Estados de Negocio
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isOpenPublic, setIsOpenPublic] = useState<boolean>(true);
  const [barbers, setBarbers] = useState<BarberWorker[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState<boolean>(false);

  // Estados de Horario Semanal
  const [schedule, setSchedule] = useState<ScheduleDayState[]>(INITIAL_SCHEDULE);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState<boolean>(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);

  // Estados para Registro de Especialista / Barbero
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffLastName, setNewStaffLastName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Barbero Master');
  const [isSavingStaff, setIsSavingStaff] = useState<boolean>(false);

  // Estados de Modales de Invitación y Edición General
  const [isInviteClientModalOpen, setIsInviteClientModalOpen] = useState<boolean>(false);
  const [isInviteStaffModalOpen, setIsInviteStaffModalOpen] = useState<boolean>(false);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState<boolean>(false);

  // Estados editables de información
  const [businessName, setBusinessName] = useState(
    user?.name ? `Barbería de ${user.name}` : 'Mi Negocio Flowtime'
  );
  const [inCharge, setInCharge] = useState(
    user?.name ? `${user.name} ${user.lastName || ''}`.trim() : 'Administrador'
  );
  const [description, setDescription] = useState(
    'Espacio de cuidado personal y estilo profesional. Agenda tu cita y vive la experiencia Flowtime.'
  );
  const [address, setAddress] = useState('Dirección física no configurada');
  const [phone, setPhone] = useState(user?.phone || 'Sin teléfono');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  const mapHoursToSchedule = (hours: any[]) => {
    const dayNames: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      0: 'Domingo',
    };
    return [1, 2, 3, 4, 5, 6, 0].map((diaNum) => {
      const found = hours.find((h) => h.dia_semana === diaNum);
      const isOpen = found ? !found.cerrado : diaNum !== 0;
      const open = found?.hora_apertura ? found.hora_apertura.slice(0, 5) : '09:00';
      const close = found?.hora_cierre ? found.hora_cierre.slice(0, 5) : '21:00';
      return {
        dayName: dayNames[diaNum],
        dia_semana: diaNum,
        isOpen,
        hours: isOpen ? `${open} - ${close}` : 'Cerrado',
        hora_apertura: found?.hora_apertura || '09:00:00',
        hora_cierre: found?.hora_cierre || '21:00:00',
      };
    });
  };

  const refreshBusiness = async () => {
    if (!user?.id) return;
    try {
      const b = await businessService.getBusinessByOwnerId(user.id);
      if (b) {
        setBusiness(b);
        setBusinessId(b.id);
        if (b.nombre_comercial) setBusinessName(b.nombre_comercial);
        if (b.descripcion) setDescription(b.descripcion);
        if (b.direccion) setAddress(b.direccion);
        if (b.telefono) setPhone(b.telefono);
        if (b.instagram) setInstagram(b.instagram);
        if (b.tiktok) setTiktok(b.tiktok);

        const [specs, hours] = await Promise.all([
          businessService.getSpecialists(b.id),
          businessService.getBusinessHours(b.id),
        ]);

        if (specs) {
          const mapped: BarberWorker[] = specs.map((s: Specialist) => ({
            id: s.id,
            name: `${s.nombre} ${s.apellido || ''}`.trim(),
            initials: `${s.nombre?.[0] || 'B'}${s.apellido?.[0] || ''}`.toUpperCase(),
            role: s.especialidad || 'Especialista',
            inTurn: s.activo !== false,
          }));
          setBarbers(mapped);
        }

        if (hours && hours.length > 0) {
          setSchedule(mapHoursToSchedule(hours));
        }
      }
    } catch (e) {
      console.warn('[AdminProfile] Error al refrescar negocio:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function initBusiness() {
      if (!user?.id) return;
      try {
        const b = await businessService.getBusinessByOwnerId(user.id);
        if (b && isMounted) {
          setBusiness(b);
          setBusinessId(b.id);
          if (b.nombre_comercial) setBusinessName(b.nombre_comercial);
          if (b.descripcion) setDescription(b.descripcion);
          if (b.direccion) setAddress(b.direccion);
          if (b.telefono) setPhone(b.telefono);
          if (b.instagram) setInstagram(b.instagram);
          if (b.tiktok) setTiktok(b.tiktok);

          const [specs, hours] = await Promise.all([
            businessService.getSpecialists(b.id),
            businessService.getBusinessHours(b.id),
          ]);

          if (specs && isMounted) {
            const mapped: BarberWorker[] = specs.map((s: Specialist) => ({
              id: s.id,
              name: `${s.nombre} ${s.apellido || ''}`.trim(),
              initials: `${s.nombre?.[0] || 'B'}${s.apellido?.[0] || ''}`.toUpperCase(),
              role: s.especialidad || 'Especialista',
              inTurn: s.activo !== false,
            }));
            setBarbers(mapped);
          }

          if (hours && hours.length > 0 && isMounted) {
            setSchedule(mapHoursToSchedule(hours));
          }
        }
      } catch (e) {
        console.warn('[AdminProfile] Error al cargar negocio:', e);
      }
    }
    initBusiness();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSaveBusinessInfo = async () => {
    if (!businessName.trim()) {
      showError('Nombre requerido', 'El negocio debe tener un nombre comercial.');
      return;
    }
    setIsSaving(true);
    try {
      if (user?.id) {
        const saved = await businessService.saveBusiness({
          id: businessId || undefined,
          owner_id: user.id,
          nombre_comercial: businessName.trim(),
          descripcion: description.trim(),
          direccion: address.trim(),
          telefono: phone.trim(),
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
        });
        setBusinessId(saved.id);
      }
      setIsEditInfoModalOpen(false);
      showSuccess('Guardado', 'Los datos del local han sido actualizados en la base de datos.');
    } catch (err: any) {
      showError('Error al guardar', err.message || 'No fue posible guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!businessId) {
      showWarning('Aviso', 'Configura tu local primero para guardar los horarios.');
      return;
    }
    setIsSavingSchedule(true);
    try {
      const payload = schedule.map((s) => ({
        dia_semana: s.dia_semana,
        hora_apertura: s.isOpen ? s.hora_apertura : null,
        hora_cierre: s.isOpen ? s.hora_cierre : null,
        cerrado: !s.isOpen,
      }));
      await businessService.saveBusinessHours(businessId, payload);
      setIsEditScheduleModalOpen(false);
      showSuccess('Horario Guardado', 'El horario de atención fue actualizado exitosamente.');
    } catch (err: any) {
      showError('Error al guardar', err?.message || 'No se pudo guardar el horario.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const toggleScheduleDay = (diaNum: number, newValue: boolean) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dia_semana === diaNum
          ? {
              ...item,
              isOpen: newValue,
              hours: newValue
                ? `${item.hora_apertura.slice(0, 5)} - ${item.hora_cierre.slice(0, 5)}`
                : 'Cerrado',
            }
          : item
      )
    );
  };

  const updateDayHours = (diaNum: number, open: string, close: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.dia_semana !== diaNum) return item;
        const cleanOpen = open.trim();
        const cleanClose = close.trim();
        return {
          ...item,
          hora_apertura: cleanOpen.length === 5 ? `${cleanOpen}:00` : cleanOpen,
          hora_cierre: cleanClose.length === 5 ? `${cleanClose}:00` : cleanClose,
          hours: `${cleanOpen.slice(0, 5)} - ${cleanClose.slice(0, 5)}`,
        };
      })
    );
  };

  const applyHoursToAllWeekdays = (open: string, close: string) => {
    const cleanOpen = open.trim();
    const cleanClose = close.trim();
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.dia_semana === 0) return item;
        return {
          ...item,
          isOpen: true,
          hora_apertura: cleanOpen.length === 5 ? `${cleanOpen}:00` : cleanOpen,
          hora_cierre: cleanClose.length === 5 ? `${cleanClose}:00` : cleanClose,
          hours: `${cleanOpen.slice(0, 5)} - ${cleanClose.slice(0, 5)}`,
        };
      })
    );
    showSuccess('Horario Aplicado', 'Se aplicó este horario a todos los días de Lunes a Sábado.');
  };

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) {
      showWarning('Nombre requerido', 'Por favor ingresa el nombre del profesional.');
      return;
    }
    if (!businessId) {
      showWarning('Aviso', 'Configura tu local primero para registrar profesionales.');
      return;
    }
    setIsSavingStaff(true);
    try {
      const created = await businessService.createSpecialist({
        business_id: businessId,
        nombre: newStaffName.trim(),
        apellido: newStaffLastName.trim() || undefined,
        especialidad: newStaffRole.trim() || 'Barbero Master',
      });
      setBarbers((prev) => [
        ...prev,
        {
          id: created.id,
          name: `${created.nombre} ${created.apellido || ''}`.trim(),
          initials: `${created.nombre[0] || 'B'}${created.apellido?.[0] || ''}`.toUpperCase(),
          role: created.especialidad || 'Especialista',
          inTurn: true,
        },
      ]);
      setNewStaffName('');
      setNewStaffLastName('');
      setNewStaffRole('Barbero Master');
      setIsAddStaffModalOpen(false);
      showSuccess('Profesional Registrado', `${created.nombre} ha sido agregado a tu equipo.`);
    } catch (err: any) {
      showError('Error', err?.message || 'No fue posible registrar al profesional.');
    } finally {
      setIsSavingStaff(false);
    }
  };

  const handleDeleteBarber = (id: string, name: string) => {
    showConfirm(
      'Eliminar profesional',
      `¿Deseas remover a "${name}" del equipo de tu local?`,
      async () => {
        try {
          await businessService.deleteSpecialist(id);
          setBarbers((prev) => prev.filter((b) => b.id !== id));
          showSuccess('Profesional eliminado', `"${name}" fue removido exitosamente.`);
        } catch (err: any) {
          showError('Error', err?.message || 'No se pudo eliminar al profesional.');
        }
      }
    );
  };

  const toggleBarberTurn = async (id: string) => {
    const target = barbers.find((b) => b.id === id);
    if (!target) return;
    const newTurn = !target.inTurn;
    setBarbers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, inTurn: newTurn } : b))
    );
    try {
      await businessService.updateSpecialist(id, { activo: newTurn });
    } catch (e: any) {
      console.warn('[AdminProfile] Error al cambiar turno:', e);
    }
  };

  const activeBarbersCount = barbers.filter((b) => b.inTurn).length;

  // Compartir enlace para invitar clientes a reservar cita
  const handleShareBookingLink = async () => {
    try {
      await Share.share({
        message: `¡Hola! Reserva tu cita en ${businessName} de forma rápida y sencilla en Flowtime: https://flowtime.app/b/${business?.id || 'reserva'}`,
        title: `Reserva en ${businessName}`,
      });
    } catch {
      setIsInviteClientModalOpen(true);
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
        showsVerticalScrollIndicator={false}>
        {/* Cabecera Superior: Logo Flowtime */}
        <View style={styles.topHeaderRow}>
          <Image
            source={require('@/assets/images/flowtime-logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        {/* Guía de Configuración del Negocio */}
        <BusinessSetupCard
          business={business}
          onPressSetup={() => setIsSetupGuideOpen(true)}
        />

        {/* 1. Hero Image con Nombre del Negocio y Encargado */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.85)']}
            locations={[0.3, 1]}
            style={styles.heroGradient}>
            <Text style={styles.heroTitle}>{businessName}</Text>
            <Text style={styles.heroSubtitle}>A cargo de: {inCharge}</Text>
          </LinearGradient>
        </View>

        {/* 2. Fila de Botones: Editar Información y Compartir (Invitar clientes a reservar) */}
        <View style={styles.actionsRow}>
          {/* Botón: Editar Información */}
          <TouchableOpacity
            onPress={() => setIsEditInfoModalOpen(true)}
            activeOpacity={0.85}
            style={styles.actionBtnLeft}>
            <Ionicons name="pencil" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnLeftText}>Editar Información</Text>
          </TouchableOpacity>

          {/* Botón: Compartir / Invitar Usuario a Reservar */}
          <TouchableOpacity
            onPress={handleShareBookingLink}
            activeOpacity={0.85}
            style={styles.actionBtnRight}>
            <Ionicons name="share-social-outline" size={16} color="#4A3B18" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnRightText}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Card de Estado: Local abierto al público / Cerrar */}
        <View
          style={[
            styles.card,
            styles.statusCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOpenPublic ? '#188E1C' : '#9E9E9E' },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                { color: isOpenPublic ? '#188E1C' : colors.textSecondary },
              ]}>
              {isOpenPublic ? 'Local abierto al público' : 'Local cerrado temporalmente'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsOpenPublic((prev) => !prev)}
            activeOpacity={0.8}
            style={[
              styles.statusToggleBtn,
              { borderColor: isOpenPublic ? '#188E1C' : '#8E8E93' },
            ]}>
            <Text
              style={[
                styles.statusToggleBtnText,
                { color: isOpenPublic ? '#188E1C' : '#8E8E93' },
              ]}>
              {isOpenPublic ? 'Cerrar' : 'Abrir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Card Descripción */}
        <View
          style={[
            styles.card,
            styles.descriptionCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>

        {/* 5. Card Ubicación y Contacto */}
        <View
          style={[
            styles.card,
            styles.ubicacionCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Ubicación</Text>

          {/* Fila Dirección Física */}
          <View style={styles.addressRow}>
            <View style={styles.addressIconCircle}>
              <Ionicons name="location" size={20} color="#BA8609" />
            </View>
            <View style={styles.addressTextCol}>
              <Text style={styles.addressLabel}>Dirección física del local</Text>
              <Text style={[styles.addressValue, { color: colors.textPrimary }]}>
                {address}
              </Text>
            </View>
          </View>

          {/* Subtítulo: Contacto y Redes Sociales */}
          <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
            Contacto y Redes Sociales
          </Text>

          {/* WhatsApp / Tel */}
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${phone}`).catch(() => {})}
            activeOpacity={0.7}
            style={styles.socialRow}>
            <Ionicons name="call-outline" size={17} color="#188E1C" style={{ marginRight: 8 }} />
            <Text style={styles.socialLabel}>WhatsApp / Tel </Text>
            <Text style={styles.socialPhoneValue}>{phone}</Text>
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://instagram.com').catch(() => {})}
            activeOpacity={0.7}
            style={styles.socialRow}>
            <Ionicons name="logo-instagram" size={17} color="#E1306C" style={{ marginRight: 8 }} />
            <Text style={styles.socialLabel}>Instagram: </Text>
            <Text style={styles.socialInstaValue}>{instagram}</Text>
          </TouchableOpacity>

          {/* TikTok */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://tiktok.com').catch(() => {})}
            activeOpacity={0.7}
            style={styles.socialRow}>
            <Ionicons name="cut-outline" size={17} color="#BA8609" style={{ marginRight: 8 }} />
            <Text style={styles.socialLabel}>Tiktok: </Text>
            <Text style={styles.socialTiktokValue}>{tiktok}</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Card Horario */}
        <View
          style={[
            styles.card,
            styles.horarioCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Horario de Atención</Text>
            <TouchableOpacity
              onPress={() => setIsEditScheduleModalOpen(true)}
              activeOpacity={0.7}
              style={[
                styles.editHeaderBtn,
                { backgroundColor: isDark ? '#2B261D' : '#F7F1E4', borderColor: '#BA8609' },
              ]}>
              <Ionicons name="pencil" size={13} color="#BA8609" style={{ marginRight: 4 }} />
              <Text style={styles.editHeaderBtnText}>Editar Horario</Text>
            </TouchableOpacity>
          </View>

          {schedule.map((item) => (
            <View key={item.dayName} style={styles.scheduleRow}>
              <View style={styles.scheduleDayLeft}>
                <View
                  style={[
                    styles.scheduleDot,
                    { backgroundColor: item.isOpen ? '#188E1C' : '#9E9E9E' },
                  ]}
                />
                <Text style={[styles.scheduleDayName, { color: colors.textPrimary }]}>
                  {item.dayName}
                </Text>
              </View>
              <Text
                style={[
                  styles.scheduleHours,
                  { color: item.isOpen ? colors.textPrimary : '#8E8E93' },
                ]}>
                {item.hours}
              </Text>
            </View>
          ))}
        </View>

        {/* 7. Card Profesionales de la Empresa */}
        <View
          style={[
            styles.card,
            styles.profesionalesCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          {/* Cabecera del Card */}
          <View style={styles.profesionalesHeaderRow}>
            <View style={styles.profesionalesHeaderLeft}>
              <View style={styles.profesionalesIconCircle}>
                <Ionicons name="people" size={18} color="#BA8609" />
              </View>
              <View>
                <Text style={[styles.profesionalesTitle, { color: colors.textPrimary }]}>
                  Profesionales de la Empresa
                </Text>
                <Text style={styles.profesionalesSubtitle}>
                  Equipo de especialistas de tu sede
                </Text>
              </View>
            </View>

            {/* Badge de Barberos Activos */}
            <View
              style={[
                styles.activeBadge,
                { backgroundColor: activeBarbersCount > 0 ? '#D5F2E1' : '#F2ECE1' },
              ]}>
              <Text
                style={[
                  styles.activeBadgeText,
                  { color: activeBarbersCount > 0 ? '#188E1C' : '#8E8E93' },
                ]}>
                {activeBarbersCount} activo{activeBarbersCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Botones de acción de Equipo */}
          <View style={styles.addStaffActionRow}>
            <TouchableOpacity
              onPress={() => setIsAddStaffModalOpen(true)}
              activeOpacity={0.85}
              style={[styles.addStaffBtn, Shadows.goldButtonDrop]}>
              <Ionicons name="person-add" size={15} color="#1C1C1C" style={{ marginRight: 6 }} />
              <Text style={styles.addStaffBtnText}>+ Agregar Profesional</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsInviteStaffModalOpen(true)}
              activeOpacity={0.85}
              style={[styles.inviteCodeBtn, { backgroundColor: isDark ? '#2A2418' : '#FAF3E3' }]}>
              <Ionicons name="key-outline" size={15} color="#BA8609" style={{ marginRight: 4 }} />
              <Text style={styles.inviteCodeBtnText}>Código</Text>
            </TouchableOpacity>
          </View>

          {/* Subtarjetas de Barberos */}
          <View style={styles.barbersSubcardsRow}>
            {barbers.length > 0 ? (
              barbers.map((barber) => (
                <View
                  key={barber.id}
                  style={[
                    styles.barberMiniCard,
                    { backgroundColor: isDark ? '#2C261A' : '#F6F2EA' },
                  ]}>
                  {/* Botón Eliminar Profesional */}
                  <TouchableOpacity
                    onPress={() => handleDeleteBarber(barber.id, barber.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.deleteBarberBtn}>
                    <Ionicons name="trash-outline" size={14} color="#E02424" />
                  </TouchableOpacity>

                  {/* Avatar con Dot de Estado */}
                  <View style={styles.barberAvatarWrapper}>
                    <View
                      style={[
                        styles.barberAvatarCircle,
                        { backgroundColor: barber.inTurn ? '#DDB04E' : '#E8D5A0' },
                      ]}>
                      <Text style={styles.barberAvatarText}>{barber.initials}</Text>
                    </View>
                    <View
                      style={[
                        styles.barberDot,
                        { backgroundColor: barber.inTurn ? '#188E1C' : '#9E9E9E' },
                      ]}
                    />
                  </View>

                  {/* Nombre y Cargo */}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.barberNameText,
                      { color: barber.inTurn ? colors.textPrimary : '#8E8E93' },
                    ]}>
                    {barber.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.barberRoleText,
                      { color: barber.inTurn ? colors.textSecondary : '#8E8E93' },
                    ]}>
                    {barber.role}
                  </Text>

                  {/* Botón de Turno */}
                  <TouchableOpacity
                    onPress={() => toggleBarberTurn(barber.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.turnBtn,
                      { backgroundColor: barber.inTurn ? '#2E9D47' : '#EDE8DD' },
                    ]}>
                    <Text
                      style={[
                        styles.turnBtnText,
                        { color: barber.inTurn ? '#FFFFFF' : '#9E9E9E' },
                      ]}>
                      {barber.inTurn ? 'En turno' : 'En pausa'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyBarbersBox}>
                <Ionicons name="people-outline" size={28} color={colors.placeholder} />
                <Text style={[styles.emptyBarbersText, { color: colors.textSecondary }]}>
                  Aún no has registrado profesionales en tu equipo.
                </Text>
                <TouchableOpacity
                  onPress={() => setIsAddStaffModalOpen(true)}
                  style={styles.quickAddStaffBtn}>
                  <Text style={styles.quickAddStaffBtnText}>+ Agregar Primer Profesional</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 8. Card Resumen de Reseñas de Clientes */}
        <View
          style={[
            styles.card,
            styles.reviewsSummaryCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <Text style={[styles.cardTitleCenter, { color: colors.textPrimary }]}>
            Resumen de Reseñas de Clientes
          </Text>
          <Text style={styles.bigRatingText}>
            {business?.rating ? Number(business.rating).toFixed(1) : '5.0'}
          </Text>

          {/* 5 Estrellas Doradas */}
          <View style={styles.starsRowCenter}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={`sum-star-${star}`}
                name="star"
                size={18}
                color="#E5A93B"
                style={{ marginHorizontal: 2 }}
              />
            ))}
          </View>
          <Text style={styles.reviewsCountText}>
            {business?.total_resenas ? `${business.total_resenas} opiniones` : '0 opiniones registradas'}
          </Text>
        </View>

        {/* 9. Sección: Comentarios Recientes */}
        <Text style={[styles.comentariosSectionTitle, { color: colors.textPrimary }]}>
          Comentarios Recientes
        </Text>

        <View
          style={[
            styles.card,
            styles.emptyReviewsCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <Ionicons name="chatbubbles-outline" size={26} color={colors.placeholder} />
          <Text style={[styles.emptyReviewsTitle, { color: colors.textPrimary }]}>
            Sin comentarios todavía
          </Text>
          <Text style={[styles.emptyReviewsSub, { color: colors.textSecondary }]}>
            Cuando tus clientes completen citas en tu negocio, sus valoraciones y comentarios verificados aparecerán en este espacio.
          </Text>
        </View>
      </ScrollView>

      {/* Modal: Editar Horario de Atención */}
      <Modal
        visible={isEditScheduleModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditScheduleModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
              Shadows.drop,
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Configurar Horario
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditScheduleModalOpen(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Configura las horas disponibles para cada día de la semana. Los clientes sólo podrán reservar en estos intervalos.
            </Text>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <View style={styles.scheduleEditList}>
                {schedule.map((item) => (
                  <View
                    key={`edit-sch-${item.dia_semana}`}
                    style={[
                      styles.scheduleEditItem,
                      { backgroundColor: isDark ? '#26221A' : '#FFFFFF' },
                    ]}>
                    <View style={styles.scheduleEditHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.scheduleEditDay,
                            { color: item.isOpen ? colors.textPrimary : '#8E8E93' },
                          ]}>
                          {item.dayName}
                        </Text>
                        <Text
                          style={[
                            styles.scheduleEditHours,
                            { color: item.isOpen ? '#BA8609' : '#8E8E93' },
                          ]}>
                          {item.isOpen ? item.hours : 'Cerrado / No disponible'}
                        </Text>
                      </View>
                      <CustomSwitch
                        value={item.isOpen}
                        onValueChange={(val) => toggleScheduleDay(item.dia_semana, val)}
                      />
                    </View>

                    {item.isOpen && (
                      <View style={styles.scheduleTimeConfigBox}>
                        <View style={styles.timeInputsRow}>
                          <View style={styles.timeInputCol}>
                            <Text style={[styles.timeInputLabel, { color: colors.textSecondary }]}>
                              Apertura
                            </Text>
                            <TextInput
                              value={item.hora_apertura ? item.hora_apertura.slice(0, 5) : '09:00'}
                              onChangeText={(val) =>
                                updateDayHours(
                                  item.dia_semana,
                                  val,
                                  item.hora_cierre ? item.hora_cierre.slice(0, 5) : '21:00'
                                )
                              }
                              placeholder="09:00"
                              placeholderTextColor={colors.placeholder}
                              maxLength={5}
                              style={[
                                styles.timeInputField,
                                {
                                  backgroundColor: isDark ? '#1C1914' : '#F6F2EA',
                                  color: colors.textPrimary,
                                  borderColor: isDark ? '#3D3728' : '#DED5C4',
                                },
                              ]}
                            />
                          </View>

                          <Text style={[styles.timeInputSep, { color: colors.textSecondary }]}>a</Text>

                          <View style={styles.timeInputCol}>
                            <Text style={[styles.timeInputLabel, { color: colors.textSecondary }]}>
                              Cierre
                            </Text>
                            <TextInput
                              value={item.hora_cierre ? item.hora_cierre.slice(0, 5) : '21:00'}
                              onChangeText={(val) =>
                                updateDayHours(
                                  item.dia_semana,
                                  item.hora_apertura ? item.hora_apertura.slice(0, 5) : '09:00',
                                  val
                                )
                              }
                              placeholder="21:00"
                              placeholderTextColor={colors.placeholder}
                              maxLength={5}
                              style={[
                                styles.timeInputField,
                                {
                                  backgroundColor: isDark ? '#1C1914' : '#F6F2EA',
                                  color: colors.textPrimary,
                                  borderColor: isDark ? '#3D3728' : '#DED5C4',
                                },
                              ]}
                            />
                          </View>
                        </View>

                        {item.dia_semana !== 0 && (
                          <TouchableOpacity
                            onPress={() =>
                              applyHoursToAllWeekdays(
                                item.hora_apertura ? item.hora_apertura.slice(0, 5) : '09:00',
                                item.hora_cierre ? item.hora_cierre.slice(0, 5) : '21:00'
                              )
                            }
                            style={styles.copyScheduleBtn}>
                            <Ionicons name="copy-outline" size={12} color="#BA8609" style={{ marginRight: 4 }} />
                            <Text style={styles.copyScheduleBtnText}>
                              Copiar a todos los días laborales
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSaveSchedule}
              disabled={isSavingSchedule}
              activeOpacity={0.88}
              style={[
                styles.modalActionBtn,
                Shadows.goldButtonDrop,
                { marginTop: 14 },
                isSavingSchedule && { opacity: 0.7 },
              ]}>
              {isSavingSchedule ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalActionBtnText}>Guardar Horarios Semanales</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Registrar Profesional */}
      <Modal
        visible={isAddStaffModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddStaffModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
              Shadows.drop,
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Registrar Profesional
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddStaffModalOpen(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Agrega un colaborador a tu equipo para asignarle citas en el cronograma.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Nombre *</Text>
            <TextInput
              value={newStaffName}
              onChangeText={setNewStaffName}
              placeholder="Ej: Keny, Marco"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.fieldInput,
                {
                  backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                  borderColor: isDark ? '#3D372A' : '#E3DBD0',
                  color: colors.textPrimary,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Apellido (Opcional)</Text>
            <TextInput
              value={newStaffLastName}
              onChangeText={setNewStaffLastName}
              placeholder="Ej: Herrera, López"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.fieldInput,
                {
                  backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                  borderColor: isDark ? '#3D372A' : '#E3DBD0',
                  color: colors.textPrimary,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Especialidad o Cargo</Text>
            <TextInput
              value={newStaffRole}
              onChangeText={setNewStaffRole}
              placeholder="Ej: Barbero Master, Estilista"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.fieldInput,
                {
                  backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                  borderColor: isDark ? '#3D372A' : '#E3DBD0',
                  color: colors.textPrimary,
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleAddStaff}
              disabled={isSavingStaff}
              activeOpacity={0.88}
              style={[styles.modalActionBtn, Shadows.goldButtonDrop, isSavingStaff && { opacity: 0.7 }]}>
              {isSavingStaff ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalActionBtnText}>Guardar Profesional</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Invitar Profesional (Código único de vinculación) */}
      <Modal
        visible={isInviteStaffModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInviteStaffModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
              Shadows.drop,
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Invitar Profesional
              </Text>
              <TouchableOpacity
                onPress={() => setIsInviteStaffModalOpen(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Comparte este código con tu colaborador para vincularlo a {businessName}.
            </Text>

            {/* Código Único Dinámico */}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>
                {businessId
                  ? `FLOW-${(businessName || 'BIZ').replace(/\s+/g, '').toUpperCase().slice(0, 4)}-${businessId.slice(0, 4).toUpperCase()}`
                  : 'FLOW-TEAM-2026'}
              </Text>
              <TouchableOpacity
                onPress={() => showSuccess('Copiado', 'Código copiado al portapapeles.')}
                style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color="#BA8609" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                const c = businessId
                  ? `FLOW-${(businessName || 'BIZ').replace(/\s+/g, '').toUpperCase().slice(0, 4)}-${businessId.slice(0, 4).toUpperCase()}`
                  : 'FLOW-TEAM-2026';
                Linking.openURL(
                  `https://wa.me/?text=Hola%2C%20únete%20a%20mi%20equipo%20en%20Flowtime%20usando%20el%20código%3A%20${encodeURIComponent(
                    c
                  )}`
                ).catch(() => {});
              }}
              activeOpacity={0.88}
              style={[styles.modalActionBtn, Shadows.goldButtonDrop]}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.modalActionBtnText}>Enviar por WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Invitar Cliente a Reservar Cita */}
      <Modal
        visible={isInviteClientModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInviteClientModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
              Shadows.drop,
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Invitar a Reservar Cita
              </Text>
              <TouchableOpacity
                onPress={() => setIsInviteClientModalOpen(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Envía el enlace oficial de tu barbería a tus clientes para que reserven su turno.
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.linkText} numberOfLines={1}>
                {businessId ? `https://flowtime.app/b/${businessId}` : 'https://flowtime.app/b/reserva'}
              </Text>
              <TouchableOpacity
                onPress={() => showSuccess('Copiado', 'Enlace copiado al portapapeles.')}
                style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color="#BA8609" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                const bLink = businessId
                  ? `https://flowtime.app/b/${businessId}`
                  : 'https://flowtime.app/b/reserva';
                Linking.openURL(
                  `https://wa.me/?text=Hola%2C%20reserva%20tu%20cita%20en%20${encodeURIComponent(
                    businessName
                  )}%20aquí%3A%20${encodeURIComponent(bLink)}`
                ).catch(() => {});
              }}
              activeOpacity={0.88}
              style={[styles.modalActionBtn, Shadows.goldButtonDrop]}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.modalActionBtnText}>Compartir por WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Información */}
      <Modal
        visible={isEditInfoModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditInfoModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.editModalScroll}
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1C1A17' : '#FBF8F3' },
                Shadows.drop,
              ]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Editar Información
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditInfoModalOpen(false)}
                  style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                Actualiza los datos públicos de tu barbería.
              </Text>

              {/* Nombre */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Nombre del Local</Text>
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                    borderColor: isDark ? '#3D372A' : '#E3DBD0',
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Encargado */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>A cargo de</Text>
              <TextInput
                value={inCharge}
                onChangeText={setInCharge}
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                    borderColor: isDark ? '#3D372A' : '#E3DBD0',
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Dirección */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Dirección Física</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                    borderColor: isDark ? '#3D372A' : '#E3DBD0',
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Teléfono */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>WhatsApp / Teléfono</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                    borderColor: isDark ? '#3D372A' : '#E3DBD0',
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Instagram */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Instagram</Text>
              <TextInput
                value={instagram}
                onChangeText={setInstagram}
                placeholder="@usuario"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                    borderColor: isDark ? '#3D372A' : '#E3DBD0',
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* TikTok */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>TikTok</Text>
              <TextInput
                value={tiktok}
                onChangeText={setTiktok}
                placeholder="@usuario"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                    borderColor: isDark ? '#3D372A' : '#E3DBD0',
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Descripción */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Descripción del Local</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: isDark ? '#26221A' : '#FFFFFF',
                    borderColor: isDark ? '#3D372A' : '#E3DBD0',
                    color: colors.textPrimary,
                    height: 80,
                    textAlignVertical: 'top',
                  },
                ]}
              />

              {/* Botón Guardar */}
              <TouchableOpacity
                onPress={handleSaveBusinessInfo}
                disabled={isSaving}
                activeOpacity={0.88}
                style={[styles.modalActionBtn, Shadows.goldButtonDrop, isSaving && { opacity: 0.7 }]}>
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalActionBtnText}>Guardar Cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Guía de Configuración de Negocio */}
      <BusinessSetupGuideModal
        visible={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        userId={user?.id || ''}
        initialBusiness={business}
        onCompleted={refreshBusiness}
      />

      {/* Barra de Navegación Inferior (Admin) */}
      <AdminBottomNav currentTab="perfil" />
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
    gap: 12,
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
  heroContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#F4F4F6',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  actionBtnLeft: {
    flex: 1.2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#C8942A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLeftText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnRight: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5C365',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnRightText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#4A3B18',
  },
  card: {
    borderRadius: 18,
    padding: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusToggleBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  statusToggleBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  descriptionCard: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  ubicacionCard: {
    gap: 10,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  editHeaderBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#BA8609',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FBEEC8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressTextCol: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  addressValue: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  subSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  socialLabel: {
    fontSize: 12.5,
    color: '#8E8E93',
  },
  socialPhoneValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#188E1C',
  },
  socialInstaValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#E1306C',
  },
  socialTiktokValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#BA8609',
  },
  horarioCard: {
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  scheduleDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  scheduleDayName: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleHours: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  profesionalesCard: {
    gap: 12,
  },
  profesionalesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profesionalesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profesionalesIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profesionalesTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  profesionalesSubtitle: {
    fontSize: 11.5,
    color: '#8E8E93',
    marginTop: 1,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  barbersSubcardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  emptyBarbersBox: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyBarbersText: {
    fontSize: 12.5,
    textAlign: 'center',
  },
  barberMiniCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  barberAvatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  barberAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barberAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  barberDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  barberNameText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  barberRoleText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  turnBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  turnBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  deleteBarberBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    padding: 4,
  },
  addStaffActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  addStaffBtn: {
    flex: 1.5,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FBE29D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStaffBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  inviteCodeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5C365',
  },
  inviteCodeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BA8609',
  },
  quickAddStaffBtn: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FBE29D',
  },
  quickAddStaffBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  inviteStaffBtn: {
    backgroundColor: '#FBE29D',
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  inviteStaffBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  inviteStaffCaption: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 15,
  },
  reviewsSummaryCard: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  cardTitleCenter: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bigRatingText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#BA8609',
    marginVertical: 2,
  },
  starsRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  reviewsCountText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  comentariosSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 2,
  },
  emptyReviewsCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  emptyReviewsTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  emptyReviewsSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  scheduleEditList: {
    gap: 10,
    marginVertical: 10,
  },
  scheduleEditItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(186, 134, 9, 0.15)',
  },
  scheduleEditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleTimeConfigBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 134, 9, 0.15)',
    gap: 8,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputCol: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeInputField: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  timeInputSep: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
  copyScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(186, 134, 9, 0.1)',
  },
  copyScheduleBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#BA8609',
  },
  scheduleEditDay: {
    fontSize: 14,
    fontWeight: '700',
  },
  scheduleEditHours: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  reviewCommentCard: {
    padding: 16,
    marginBottom: 20,
  },
  reviewCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewerServiceDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  reviewStarsRow: {
    flexDirection: 'row',
  },
  reviewerCommentText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
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
    marginBottom: 16,
    lineHeight: 17,
  },
  codeBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5C365',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#BA8609',
    letterSpacing: 1,
  },
  linkText: {
    fontSize: 13,
    color: '#BA8609',
    flex: 1,
    marginRight: 8,
  },
  copyBtn: {
    padding: 4,
  },
  modalActionBtn: {
    backgroundColor: '#BA8609',
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editModalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  fieldInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13.5,
    marginBottom: 8,
  },
});
