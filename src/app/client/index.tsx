import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { businessService } from '@/api/business.service';
import { appointmentService } from '@/api/appointment.service';
import { Business, Category, Appointment } from '@/api/types';
import { Gradients, BrandColors } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ClientSetupCard } from '@/components/client/ClientSetupCard';
import { ClientSetupGuideModal } from '@/components/client/ClientSetupGuideModal';

const SOTO_BARBER_IMG = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80';
const BEBO_BARBER_IMG = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';

const DEFAULT_CATEGORIES = ['Todos', 'Corte de pelo', 'Barba', 'Afeitado tradicional'];

export default function ClientHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();

  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'activity' | 'profile'>('home');
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        const [cats, bizList] = await Promise.all([
          businessService.getCategories(),
          businessService.getBusinesses(),
        ]);
        if (!isMounted) return;
        if (cats && cats.length > 0) {
          setCategories(['Todos', ...cats.map((c: Category) => c.nombre)]);
        }
        setBusinesses(bizList);

        if (user?.id) {
          // Si el perfil está incompleto (falta teléfono o apellido), lanzar la guía automáticamente
          if (!user.phone || !user.lastName) {
            setIsSetupGuideOpen(true);
          }

          const apps = await appointmentService.getClientAppointments(user.id);
          if (!isMounted) return;
          const upcoming = apps.find(
            (a) => a.estado === 'PENDIENTE' || a.estado === 'CONFIRMADA'
          );
          if (upcoming) {
            setUpcomingAppointment(upcoming);
          }
        }
      } catch (e) {
        console.warn('[ClientHomeScreen] Error al inicializar:', e);
      }
    }
    initData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.phone, user?.lastName]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [cats, bizList] = await Promise.all([
        businessService.getCategories(),
        businessService.getBusinesses(),
      ]);
      if (cats && cats.length > 0) {
        setCategories(['Todos', ...cats.map((c: Category) => c.nombre)]);
      }
      setBusinesses(bizList);

      if (user?.id) {
        const apps = await appointmentService.getClientAppointments(user.id);
        const upcoming = apps.find(
          (a) => a.estado === 'PENDIENTE' || a.estado === 'CONFIRMADA'
        );
        if (upcoming) {
          setUpcomingAppointment(upcoming);
        }
      }
    } catch (e) {
      console.warn('[ClientHomeScreen] Error al refrescar:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenBarbershop = (id: string = 'kenys') => {
    router.push(`/client/barbershop/${id}`);
  };

  const handleOpenProfile = () => {
    router.push('/client/profile');
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      b.nombre_comercial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.direccion && b.direccion.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Todos' ||
      (b.categoria && b.categoria.nombre === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const userName = user?.name ? user.name.split(' ')[0] : 'Cliente';

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
            paddingTop: Math.max(insets.top, 16) + 8,
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
        {/* Cabecera Superior: Flowtime Logo y Avatar de Usuario */}
        <View style={styles.topHeader}>
          <Image
            source={require('@/assets/images/flowtime-logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
          <TouchableOpacity onPress={handleOpenProfile} activeOpacity={0.8}>
            <UserAvatar
              size={40}
              avatarUrl={user?.avatarUrl}
              name={user?.name}
              lastName={user?.lastName}
              borderWidth={1.5}
            />
          </TouchableOpacity>
        </View>

        {/* Saludo y Título */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>
            Hola, {userName}
          </Text>
          <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
            Encuentra tu estilo
          </Text>
        </View>

        {/* Guía de Configuración de Perfil de Usuario */}
        <ClientSetupCard
          user={user}
          onPressSetup={() => setIsSetupGuideOpen(true)}
        />

        {/* Buscador */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <Ionicons name="search-outline" size={18} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar barbería, barbero o servicio..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tarjeta de Próxima Cita (Real de Supabase o Destacada) */}
        {upcomingAppointment ? (
          <View
            style={[
              styles.featuredCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.featuredImageContainer}>
              <Image
                source={{
                  uri:
                    upcomingAppointment.business?.foto_portada ||
                    upcomingAppointment.business?.foto_perfil ||
                    SOTO_BARBER_IMG,
                }}
                style={styles.featuredImage}
                contentFit="cover"
              />
              <View style={styles.badgeProximaCita}>
                <Text style={styles.badgeProximaCitaText}>TU PRÓXIMA CITA</Text>
              </View>
            </View>

            <View style={styles.featuredContent}>
              <Text style={[styles.featuredTitle, { color: colors.textPrimary }]}>
                {upcomingAppointment.business?.nombre_comercial || 'Barbería Flowtime'}
              </Text>
              <Text style={[styles.featuredService, { color: colors.textSecondary }]}>
                Con {upcomingAppointment.specialist?.nombre || 'Especialista'}
              </Text>
              <Text style={styles.featuredTime}>
                {upcomingAppointment.fecha} · {upcomingAppointment.hora_inicio.slice(0, 5)}
              </Text>

              <View style={styles.featuredButtonsRow}>
                <TouchableOpacity
                  onPress={() =>
                    handleOpenBarbershop(upcomingAppointment.business_id || 'kenys')
                  }
                  activeOpacity={0.8}
                  style={[
                    styles.detailsButton,
                    { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' },
                  ]}>
                  <Text style={[styles.detailsButtonText, { color: colors.goldText }]}>
                    Ver local
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenProfile}
                  activeOpacity={0.8}
                  style={[styles.locationButton, { backgroundColor: BrandColors.goldFlat }]}>
                  <Text style={styles.locationButtonText}>Mis Reservas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : businesses.length > 0 ? (
          <View
            style={[
              styles.featuredCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.featuredImageContainer}>
              <Image
                source={{
                  uri:
                    businesses[0].foto_portada ||
                    businesses[0].foto_perfil ||
                    SOTO_BARBER_IMG,
                }}
                style={styles.featuredImage}
                contentFit="cover"
              />
              <View style={styles.badgeProximaCita}>
                <Text style={styles.badgeProximaCitaText}>DESTACADO</Text>
              </View>
            </View>

            <View style={styles.featuredContent}>
              <Text style={[styles.featuredTitle, { color: colors.textPrimary }]}>
                {businesses[0].nombre_comercial}
              </Text>
              <Text style={[styles.featuredService, { color: colors.textSecondary }]}>
                {businesses[0].descripcion || 'Barbería y estilo profesional'}
              </Text>
              <Text style={styles.featuredTime}>Disponible para reservas</Text>

              <View style={styles.featuredButtonsRow}>
                <TouchableOpacity
                  onPress={() => handleOpenBarbershop(businesses[0].id)}
                  activeOpacity={0.8}
                  style={[
                    styles.detailsButton,
                    { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' },
                  ]}>
                  <Text style={[styles.detailsButtonText, { color: colors.goldText }]}>
                    Ver detalles
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleOpenBarbershop(businesses[0].id)}
                  activeOpacity={0.8}
                  style={[styles.locationButton, { backgroundColor: BrandColors.goldFlat }]}>
                  <Text style={styles.locationButtonText}>Agendar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Píldoras de Filtros / Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? { backgroundColor: BrandColors.goldFlat }
                    : {
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      },
                  Shadows.drop,
                ]}>
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? '#1C1C1C' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sección de Barberías Destacadas */}
        <View style={styles.barbershopsRow}>
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => handleOpenBarbershop(b.id)}
                activeOpacity={0.88}
                style={[
                  styles.barberCard,
                  { backgroundColor: colors.card },
                  Shadows.drop,
                ]}>
                <View style={styles.barberImageContainer}>
                  <Image
                    source={{ uri: b.foto_portada || b.foto_perfil || BEBO_BARBER_IMG }}
                    style={styles.barberImage}
                    contentFit="cover"
                  />
                  <View style={styles.heartButton}>
                    <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.barberCardBody}>
                  <Text style={[styles.barberName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {b.nombre_comercial}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#E5A93B" style={{ marginRight: 3 }} />
                    <Text style={[styles.barberRating, { color: colors.textSecondary }]}>
                      {b.rating ? b.rating.toFixed(1) : '5.0'} ({b.total_resenas || 0} reseñas)
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleOpenBarbershop(b.id)}
                    activeOpacity={0.85}
                    style={[styles.agendarButton, { backgroundColor: BrandColors.goldFlat }]}>
                    <Text style={styles.agendarButtonText}>Agendar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyBusinessesBox}>
              <Ionicons name="storefront-outline" size={44} color="#D4AF37" />
              <Text style={[styles.emptyBusinessesTitle, { color: colors.textPrimary }]}>
                {searchQuery ? 'No se encontraron resultados' : 'No hay locales disponibles'}
              </Text>
              <Text style={[styles.emptyBusinessesSubtitle, { color: colors.textSecondary }]}>
                {searchQuery
                  ? `No encontramos locales que coincidan con "${searchQuery}".`
                  : 'Pronto habrá barberías y negocios disponibles en tu zona.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Cliente) */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            paddingBottom: Math.max(insets.bottom, 10),
            borderTopColor: colors.divider,
          },
        ]}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.navTab}>
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'home' ? '#C89C25' : colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'home' ? styles.navLabelActive : { color: colors.textSecondary },
            ]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('map')} style={styles.navTab}>
          <Ionicons
            name={activeTab === 'map' ? 'location' : 'location-outline'}
            size={22}
            color={activeTab === 'map' ? '#C89C25' : colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'map' ? styles.navLabelActive : { color: colors.textSecondary },
            ]}>
            Mapa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('activity')} style={styles.navTab}>
          <Ionicons
            name={activeTab === 'activity' ? 'calendar' : 'calendar-outline'}
            size={22}
            color={activeTab === 'activity' ? '#C89C25' : colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'activity' ? styles.navLabelActive : { color: colors.textSecondary },
            ]}>
            Actividad
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpenProfile} style={styles.navTab}>
          <UserAvatar
            size={24}
            avatarUrl={user?.avatarUrl}
            name={user?.name}
            lastName={user?.lastName}
            borderWidth={0}
          />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Guía de Configuración de Perfil de Cliente */}
      <ClientSetupGuideModal
        visible={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        currentUser={user}
        onCompleted={onRefresh}
      />
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
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoImage: {
    width: 150,
    height: 42,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingSection: {
    marginBottom: Spacing.base,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.base,
    height: 46,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  featuredCard: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  featuredImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  badgeProximaCita: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  badgeProximaCitaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredContent: {
    padding: Spacing.base,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  featuredService: {
    fontSize: 13,
    marginTop: 2,
  },
  featuredTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E9A83A',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  featuredButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    height: 38,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  locationButton: {
    flex: 1,
    height: 38,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  categoriesContainer: {
    gap: 8,
    paddingBottom: Spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
  },
  categoryText: {
    fontSize: 13,
  },
  barbershopsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  barberCard: {
    width: '48%',
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
  barberImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  barberImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barberCardBody: {
    padding: 10,
  },
  barberName: {
    fontSize: 14,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  barberRating: {
    fontSize: 11,
  },
  agendarButton: {
    width: '100%',
    height: 34,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendarButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  navAvatarIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#C89C25',
    fontWeight: '700',
  },
  emptyBusinessesBox: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyBusinessesTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyBusinessesSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
