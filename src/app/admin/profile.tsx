import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Share,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Gradients } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&auto=format&fit=crop&q=80';

interface BarberWorker {
  id: string;
  name: string;
  initials: string;
  role: string;
  inTurn: boolean;
}

const INITIAL_BARBERS: BarberWorker[] = [
  {
    id: '1',
    name: 'Diego Tejeda',
    initials: 'DT',
    role: 'Fade master y Barba',
    inTurn: true,
  },
  {
    id: '2',
    name: 'Julio Martínez',
    initials: 'JM',
    role: 'Fade master y Barba',
    inTurn: false,
  },
];

export default function AdminProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  // Estados de Negocio
  const [isOpenPublic, setIsOpenPublic] = useState<boolean>(true);
  const [barbers, setBarbers] = useState<BarberWorker[]>(INITIAL_BARBERS);

  // Estados de Modales
  const [isInviteClientModalOpen, setIsInviteClientModalOpen] = useState<boolean>(false);
  const [isInviteStaffModalOpen, setIsInviteStaffModalOpen] = useState<boolean>(false);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState<boolean>(false);

  // Estados editables de información
  const [businessName, setBusinessName] = useState('Keny’s Barbershop');
  const [inCharge, setInCharge] = useState('Keny Herrera');
  const [description, setDescription] = useState(
    'Keny’s Barbershop es más que un corte de pelo: es un ritual. Fusionamos la barbería de la vieja escuela con las mejores técnicas actuales para ofrecerte una experiencia de cuidado masculino sin prisas. Desde un perfilado de barba con toalla caliente hasta un estilo clásico impecable, en nuestras sillas encuentras el espacio ideal para desconectar, tomar algo y salir con tu mejor versión.'
  );
  const [address, setAddress] = useState('Cra 11 #93-18, Santo Domingo');
  const [phone, setPhone] = useState('+1 (829)-000-0000');
  const [instagram, setInstagram] = useState('@kenysbarbershop');
  const [tiktok, setTiktok] = useState('@keny_style');

  const activeBarbersCount = barbers.filter((b) => b.inTurn).length;

  const toggleBarberTurn = (id: string) => {
    setBarbers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, inTurn: !b.inTurn } : b))
    );
  };

  // Compartir enlace para invitar clientes a reservar cita
  const handleShareBookingLink = async () => {
    try {
      await Share.share({
        message: `¡Hola! Reserva tu cita en ${businessName} de forma rápida y sencilla en Flowtime: https://flowtime.app/b/kenys-barbershop`,
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
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Horario</Text>

          {[
            { day: 'Lunes', hours: '9:00 AM - 9:00 PM', isOpen: true },
            { day: 'Martes', hours: '9:00 AM - 9:00 PM', isOpen: true },
            { day: 'Miercoles', hours: '9:00 AM - 9:00 PM', isOpen: true },
            { day: 'Jueves', hours: '9:00 AM - 9:00 PM', isOpen: true },
            { day: 'Viernes', hours: '9:00 AM - 9:00 PM', isOpen: true },
            { day: 'Sábado', hours: '9:00 AM - 9:00 PM', isOpen: true },
            { day: 'Domingo', hours: 'Cerrado', isOpen: false },
          ].map((item) => (
            <View key={item.day} style={styles.scheduleRow}>
              <View style={styles.scheduleDayLeft}>
                <View
                  style={[
                    styles.scheduleDot,
                    { backgroundColor: item.isOpen ? '#188E1C' : '#9E9E9E' },
                  ]}
                />
                <Text style={[styles.scheduleDayName, { color: colors.textPrimary }]}>
                  {item.day}
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

        {/* 7. Card Profesionales de la Empresa (Component 133 de Figma) */}
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
                  Colaboradores en esta sede
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

          {/* Subtarjetas de Barberos (Component 133) */}
          <View style={styles.barbersSubcardsRow}>
            {barbers.map((barber) => (
              <View
                key={barber.id}
                style={[
                  styles.barberMiniCard,
                  { backgroundColor: isDark ? '#2C261A' : '#F6F2EA' },
                ]}>
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
                  style={[
                    styles.barberNameText,
                    { color: barber.inTurn ? colors.textPrimary : '#8E8E93' },
                  ]}>
                  {barber.name}
                </Text>
                <Text
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
            ))}
          </View>

          {/* Botón: + Invitar Profesional a la Empresa */}
          <TouchableOpacity
            onPress={() => setIsInviteStaffModalOpen(true)}
            activeOpacity={0.85}
            style={styles.inviteStaffBtn}>
            <Ionicons name="person-add" size={16} color="#1C1C1C" style={{ marginRight: 6 }} />
            <Text style={styles.inviteStaffBtnText}>
              Invitar Profesional a la Empresa
            </Text>
          </TouchableOpacity>

          <Text style={styles.inviteStaffCaption}>
            Genera un código único de la empresa para vincular nuevos barberos a tu sede y gestionar sus agendas.
          </Text>
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
          <Text style={styles.bigRatingText}>4.95</Text>

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
          <Text style={styles.reviewsCountText}>184 opiniones</Text>
        </View>

        {/* 9. Sección: Comentarios Recientes */}
        <Text style={[styles.comentariosSectionTitle, { color: colors.textPrimary }]}>
          Comentarios Recientes
        </Text>

        <View
          style={[
            styles.card,
            styles.reviewCommentCard,
            { backgroundColor: isDark ? '#1F1F24' : '#FFFFFF' },
            Shadows.drop,
          ]}>
          <View style={styles.reviewCommentHeader}>
            <View>
              <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>
                Sebastián Mora
              </Text>
              <Text style={styles.reviewerServiceDate}>Taper Fade · Ayer</Text>
            </View>

            <View style={styles.reviewStarsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={`rev-star-${star}`}
                  name="star"
                  size={14}
                  color="#E5A93B"
                  style={{ marginLeft: 2 }}
                />
              ))}
            </View>
          </View>

          <Text style={[styles.reviewerCommentText, { color: colors.textSecondary }]}>
            Exelente fade y un servicio acogedor.
          </Text>
        </View>
      </ScrollView>

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
              Comparte este código con tu nuevo colaborador para vincularlo a {businessName}.
            </Text>

            {/* Código Único */}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>KENY-2026-FLOW</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Copiado', 'Código copiado al portapapeles.')}
                style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color="#BA8609" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  `https://wa.me/?text=Hola%2C%20únete%20a%20mi%20equipo%20en%20Flowtime%20usando%20el%20código%3A%20KENY-2026-FLOW`
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
                https://flowtime.app/b/kenys-barbershop
              </Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Copiado', 'Enlace copiado al portapapeles.')}
                style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color="#BA8609" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  `https://wa.me/?text=Hola%2C%20reserva%20tu%20cita%20en%20${encodeURIComponent(
                    businessName
                  )}%20aquí%3A%20https%3A%2F%2Fflowtime.app%2Fb%2Fkenys-barbershop`
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

              {/* Botón Guardar */}
              <TouchableOpacity
                onPress={() => {
                  setIsEditInfoModalOpen(false);
                  Alert.alert('Guardado', 'Los datos del local han sido actualizados.');
                }}
                activeOpacity={0.88}
                style={[styles.modalActionBtn, Shadows.goldButtonDrop]}>
                <Text style={styles.modalActionBtnText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

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
    gap: 10,
    marginTop: 4,
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
