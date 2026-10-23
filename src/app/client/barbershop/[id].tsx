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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';
import { businessService, Business, Specialist } from '@/api/business.service';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

// Imagen de portada con lámparas colgantes y sillones de barbería vintage
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&auto=format&fit=crop&q=80';

interface ScheduleItem {
  day: string;
  hours: string;
  isOpen: boolean;
}

const SCHEDULE: ScheduleItem[] = [
  { day: 'Lunes', hours: '9:00 AM - 9:00 PM', isOpen: true },
  { day: 'Martes', hours: '9:00 AM - 9:00 PM', isOpen: true },
  { day: 'Miercoles', hours: '9:00 AM - 9:00 PM', isOpen: true },
  { day: 'Jueves', hours: '9:00 AM - 9:00 PM', isOpen: true },
  { day: 'Viernes', hours: '9:00 AM - 9:00 PM', isOpen: true },
  { day: 'Sábado', hours: '9:00 AM - 9:00 PM', isOpen: true },
  { day: 'Domingo', hours: 'Cerrado', isOpen: false },
];

interface Professional {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  rating: string;
}

const DEFAULT_PROFESSIONALS: Professional[] = [];

interface ReviewItem {
  id: string;
  author: string;
  service: string;
  date: string;
  rating: number;
  comment: string;
}

const REVIEWS_LIST: ReviewItem[] = [
  {
    id: '1',
    author: 'Sebastián Mora',
    service: 'Taper Fade',
    date: 'Ayer',
    rating: 5,
    comment: 'Exelente fade y un servicio acogedor.',
  },
  {
    id: '2',
    author: 'Mateo Gómez',
    service: 'Corte Clásico + Barba',
    date: 'Hace 3 días',
    rating: 5,
    comment: 'Puntualidad impecable y los detalles en el perfilado con toalla caliente son de otro nivel.',
  },
  {
    id: '3',
    author: 'Andrés Castillo',
    service: 'Fade Master',
    date: 'Hace 1 semana',
    rating: 5,
    comment: 'Atención de primera. Keny y todo su equipo tienen las mejores manos de la ciudad.',
  },
];

export default function BarbershopDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { showInfo } = useAlert();
  const [isFavorite, setIsFavorite] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!id || id === 'kenys' || id === 'vintage') return;
      try {
        const [biz, specs] = await Promise.all([
          businessService.getBusinessById(id as string),
          businessService.getSpecialists(id as string),
        ]);
        if (biz) setBusiness(biz);
        if (specs && specs.length > 0) setSpecialists(specs);
      } catch (err) {
        console.error('Error loading business detail:', err);
      }
    }
    loadData();
  }, [id]);

  const handleBooking = () => {
    router.push({
      pathname: '/client/services',
      params: { id: business?.id || (id as string) || 'kenys' },
    });
  };

  const handleLeaveReview = () => {
    showInfo(
      'Escribir Reseña',
      'La calificación y comentarios estarán habilitados una vez completada tu cita.'
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Te recomiendo ${business?.nombre_comercial || "Keny's Barbershop"} en Flowtime! ${
          business?.direccion || 'Cra 11 #93-18, Santo Domingo.'
        }`,
      });
    } catch {
      // Ignorar cancelación de compartir
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showInfo('Contacto', `Enlace: ${url}`);
    });
  };

  const displayTitle = business?.nombre_comercial || 'Barbería Flowtime';
  const displayHero = business?.foto_portada || business?.foto_perfil || HERO_IMAGE;
  const displayAddress = business?.direccion
    ? `${business.direccion}${business.ciudad ? ', ' + business.ciudad : ''}`
    : 'Dirección física por confirmar';
  const displayPhone = business?.telefono || 'Sin teléfono';
  const displayInstagram = business?.instagram
    ? business.instagram.startsWith('@')
      ? business.instagram
      : `@${business.instagram}`
    : '';
  const displayTiktok = business?.tiktok
    ? business.tiktok.startsWith('@')
      ? business.tiktok
      : `@${business.tiktok}`
    : '';
  const displayDesc =
    business?.descripcion ||
    'Local de cuidado personal y estilo profesional registrado en Flowtime.';

  const activeProfessionals =
    specialists.length > 0
      ? specialists.map((s) => ({
          id: s.id,
          initials: `${s.nombre?.[0] || 'B'}${s.apellido?.[0] || ''}`.toUpperCase(),
          name: `${s.nombre} ${s.apellido || ''}`.trim(),
          specialty: s.especialidad || 'Especialista en Estilo',
          rating: '5.0',
        }))
      : DEFAULT_PROFESSIONALS;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Fondo Gradiente Principal de la pantalla */}
      <LinearGradient
        colors={isDark ? Gradients.backgroundDark : Gradients.backgroundLight}
        locations={isDark ? Gradients.backgroundDarkLocations : Gradients.backgroundLightLocations}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Cabecera Hero con Imagen y Botones Flotantes */}
        <View style={styles.heroWrapper}>
          <Image
            source={{ uri: displayHero }}
            style={styles.heroImage}
            contentFit="cover"
          />

          {/* Gradiente oscuro inferior para texto */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.88)']}
            locations={[0, 0.45, 1]}
            style={styles.heroGradientOverlay}
          />

          {/* Botones flotantes superiores: Atrás y Favorito */}
          <View style={[styles.topActionsRow, { top: Math.max(insets.top, 20) + 6 }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              style={styles.floatingRoundButton}>
              <Ionicons name="chevron-back" size={22} color="#1C1C1C" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsFavorite((prev) => !prev)}
              activeOpacity={0.85}
              style={styles.floatingRoundButton}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={21}
                color={isFavorite ? '#E74C3C' : '#1C1C1C'}
              />
            </TouchableOpacity>
          </View>

          {/* Información del negocio sobre la imagen hero */}
          <View style={styles.heroTextContainer}>
            <Text style={styles.businessTitle}>{displayTitle}</Text>
            <Text style={styles.businessOwner}>
              {business ? `Local verificado: ${business.nombre_comercial}` : 'A cargo de: Keny Herrera'}
            </Text>
          </View>
        </View>

        {/* Cuerpo de la pantalla con Cards y Acciones */}
        <View style={styles.contentBody}>
          {/* Fila de Botones: Reservar Cita y Compartir */}
          <View style={styles.ctaRow}>
            {/* Botón Reservar Cita (Dorado Premium) */}
            <TouchableOpacity
              onPress={handleBooking}
              activeOpacity={0.88}
              style={styles.ctaButtonWrapper}>
              <LinearGradient
                colors={['#B8860B', '#F3DA80', '#D4AF37']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.ctaButton, Shadows.goldButtonDrop]}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#1C1C1C"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.ctaReserveText}>Reservar Cita</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón Compartir (Dorado Claro con Icono) */}
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.88}
              style={styles.ctaButtonWrapper}>
              <LinearGradient
                colors={['#E5C365', '#DFB754']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.ctaButton, Shadows.drop]}>
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color="#1C1C1C"
                  style={styles.shareIcon}
                />
                <Text style={styles.ctaShareText}>Compartir</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Card / Cápsula: Estado Local Abierto */}
          <View
            style={[
              styles.card,
              styles.statusCapsule,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.greenDot} />
            <Text style={styles.statusOpenText}>Local Abierto</Text>
          </View>

          {/* Card: Descripción del Negocio */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {displayDesc}
            </Text>
          </View>

          {/* Card: Ubicación y Contacto */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Ubicación</Text>

            {/* Dirección */}
            <View style={styles.addressRow}>
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={20} color="#B8860B" />
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>
                  Dirección física del local
                </Text>
                <Text style={[styles.addressValue, { color: colors.textPrimary }]}>
                  {displayAddress}
                </Text>
              </View>
            </View>

            {/* Contacto y Redes Sociales */}
            <Text style={[styles.contactSectionTitle, { color: colors.textPrimary }]}>
              Contacto y Redes Sociales
            </Text>

            <TouchableOpacity
              onPress={() => handleOpenLink(`tel:${displayPhone.replace(/[^0-9+]/g, '')}`)}
              activeOpacity={0.7}
              style={styles.contactRow}>
              <Ionicons
                name="call-outline"
                size={16}
                color="#188E1C"
                style={styles.contactIcon}
              />
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                WhatsApp / Tel:{' '}
                <Text style={styles.contactValueWhatsApp}>{displayPhone}</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleOpenLink(`https://instagram.com/${displayInstagram.replace('@', '')}`)}
              activeOpacity={0.7}
              style={styles.contactRow}>
              <Ionicons
                name="logo-instagram"
                size={16}
                color="#D62976"
                style={styles.contactIcon}
              />
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                Instagram:{' '}
                <Text style={styles.contactValueInstagram}>{displayInstagram}</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleOpenLink(`https://tiktok.com/@${displayTiktok.replace('@', '')}`)}
              activeOpacity={0.7}
              style={styles.contactRow}>
              <Ionicons
                name="logo-tiktok"
                size={16}
                color="#B8860B"
                style={styles.contactIcon}
              />
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                Tiktok:{' '}
                <Text style={styles.contactValueTiktok}>{displayTiktok}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card: Horario */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Horario</Text>

            <View style={styles.scheduleList}>
              {SCHEDULE.map((item) => (
                <View key={item.day} style={styles.scheduleRow}>
                  <View style={styles.scheduleDayCol}>
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
                      {
                        color: item.isOpen ? colors.textPrimary : colors.textSecondary,
                        fontWeight: item.isOpen ? '500' : '600',
                      },
                    ]}>
                    {item.hours}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card: Profesionales de la Empresa */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.professionalsHeader}>
              <View style={styles.peopleBadge}>
                <Ionicons name="people" size={18} color="#B8860B" />
              </View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                Profesionales de la Empresa
              </Text>
            </View>

            <View style={styles.professionalsRow}>
              {activeProfessionals.length > 0 ? (
                activeProfessionals.map((prof) => (
                  <View
                    key={prof.id}
                    style={[
                      styles.professionalCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F5EEDD',
                      },
                      Shadows.drop,
                    ]}>
                    {/* Círculo con Iniciales */}
                    <View style={styles.initialsCircle}>
                      <Text style={styles.initialsText}>{prof.initials}</Text>
                    </View>

                    <Text
                      style={[styles.professionalName, { color: colors.textPrimary }]}
                      numberOfLines={1}>
                      {prof.name}
                    </Text>
                    <Text
                      style={[styles.professionalSpecialty, { color: colors.textSecondary }]}
                      numberOfLines={1}>
                      {prof.specialty}
                    </Text>

                    {/* Rating con estrella */}
                    <View style={styles.professionalRatingRow}>
                      <Ionicons name="star" size={12} color="#E9A83A" />
                      <Text style={[styles.professionalRatingText, { color: colors.textPrimary }]}>
                        {prof.rating}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ width: '100%', paddingVertical: 14, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    No hay profesionales registrados actualmente en este local.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Card: Resumen de Reseñas de Clientes */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Resumen de Reseñas de Clientes
            </Text>

            <Text style={styles.bigRatingScore}>4.95</Text>

            <View style={styles.starsRow}>
              <Ionicons name="star" size={18} color="#D4AF37" />
              <Ionicons name="star" size={18} color="#D4AF37" />
              <Ionicons name="star" size={18} color="#D4AF37" />
              <Ionicons name="star" size={18} color="#D4AF37" />
              <Ionicons name="star-half" size={18} color="#D4AF37" />
            </View>

            <Text style={[styles.reviewsCountText, { color: colors.textSecondary }]}>
              184 opiniones
            </Text>
          </View>

          {/* Sección Exterior: Comentarios Recientes */}
          <View style={styles.reviewsHeaderBetween}>
            <Text style={[styles.sectionHeadingOutside, { color: colors.textPrimary }]}>
              Comentarios Recientes
            </Text>
            <TouchableOpacity
              onPress={handleLeaveReview}
              activeOpacity={0.7}
              style={styles.writeReviewButton}>
              <Ionicons
                name="create-outline"
                size={14}
                color="#C89C25"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.writeReviewButtonText}>Escribir reseña</Text>
            </TouchableOpacity>
          </View>

          {/* Cards de Comentarios de Clientes */}
          {REVIEWS_LIST.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                styles.commentCard,
                { backgroundColor: colors.card },
                Shadows.drop,
              ]}>
              <View style={styles.commentHeaderRow}>
                <View>
                  <Text style={[styles.commentAuthorName, { color: colors.textPrimary }]}>
                    {item.author}
                  </Text>
                  <Text style={[styles.commentDateSub, { color: colors.textSecondary }]}>
                    {item.service} · {item.date}
                  </Text>
                </View>

                {/* 5 estrellas del comentario */}
                <View style={styles.commentStarsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={14}
                      color={star <= item.rating ? '#D4AF37' : '#D1D1D6'}
                    />
                  ))}
                </View>
              </View>

              <Text style={[styles.commentBodyText, { color: colors.textSecondary }]}>
                {item.comment}
              </Text>
            </View>
          ))}

          {/* Botón Ver todas las opiniones */}
          <TouchableOpacity
            onPress={() =>
              showInfo(
                'Todas las Reseñas',
                'Mostrando 184 opiniones verificadas de clientes de Keny\'s Barbershop.'
              )
            }
            activeOpacity={0.8}
            style={[
              styles.allReviewsButton,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              },
              Shadows.drop,
            ]}>
            <Text style={[styles.allReviewsButtonText, { color: colors.textPrimary }]}>
              Ver todas las opiniones (184)
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
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
  },
  heroWrapper: {
    width: '100%',
    height: 310,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  topActionsRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingRoundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  businessTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  businessOwner: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
  },
  contentBody: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    gap: 14,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButtonWrapper: {
    flex: 1,
  },
  ctaButton: {
    height: 46,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  ctaReserveText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  ctaShareText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  shareIcon: {
    marginRight: 6,
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  statusCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#188E1C',
    marginRight: 8,
  },
  statusOpenText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#188E1C',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '400',
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDECB8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  addressValue: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  contactSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactIcon: {
    width: 24,
  },
  contactLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  contactValueWhatsApp: {
    color: '#188E1C',
    fontWeight: '600',
  },
  contactValueInstagram: {
    color: '#D62976',
    fontWeight: '600',
  },
  contactValueTiktok: {
    color: '#B8860B',
    fontWeight: '600',
  },
  scheduleList: {
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDayCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  scheduleDayName: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleHours: {
    fontSize: 13,
  },
  professionalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  peopleBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDECB8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  professionalCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D9B452',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  professionalName: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  professionalSpecialty: {
    fontSize: 10.5,
    marginTop: 2,
    textAlign: 'center',
  },
  professionalRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  professionalRatingText: {
    fontSize: 12,
    fontWeight: '800',
  },
  bigRatingScore: {
    fontSize: 34,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: -0.5,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  reviewsCountText: {
    fontSize: 12,
    marginTop: 6,
  },
  sectionHeadingOutside: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: -4,
  },
  commentCard: {
    paddingVertical: 14,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '800',
  },
  commentDateSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  commentStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  commentBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  reviewsHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: -4,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  writeReviewButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C89C25',
  },
  allReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    marginTop: 4,
    gap: 6,
  },
  allReviewsButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
