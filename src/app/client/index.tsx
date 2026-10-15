import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Gradients, BrandColors } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

const USER_AVATAR = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80';
const SOTO_BARBER_IMG = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80';
const BEBO_BARBER_IMG = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
const VINTAGE_BARBER_IMG = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80';

const CATEGORIES = ['Todos', 'Corte de pelo', 'Barba', 'Afeitado tradicional'];

export default function ClientHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'activity' | 'profile'>('home');

  const handleOpenBarbershop = (id: string = 'kenys') => {
    router.push(`/client/barbershop/${id}`);
  };

  const handleOpenProfile = () => {
    router.push('/client/profile');
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
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Cabecera Superior: Flowtime Logo y Avatar de Usuario */}
        <View style={styles.topHeader}>
          <Image
            source={require('@/assets/images/flowtime-logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
          <TouchableOpacity onPress={handleOpenProfile} activeOpacity={0.8}>
            <Image source={{ uri: USER_AVATAR }} style={styles.userAvatar} />
          </TouchableOpacity>
        </View>

        {/* Saludo y Título */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>
            Hola, Carlos
          </Text>
          <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
            Encuentra tu estilo
          </Text>
        </View>

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
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>

        {/* Tarjeta de Próxima Cita (Soto y Ochoa) */}
        <View
          style={[
            styles.featuredCard,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.featuredImageContainer}>
            <Image
              source={{ uri: SOTO_BARBER_IMG }}
              style={styles.featuredImage}
              contentFit="cover"
            />
            <View style={styles.badgeProximaCita}>
              <Text style={styles.badgeProximaCitaText}>PRÓXIMA CITA</Text>
            </View>
          </View>

          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, { color: colors.textPrimary }]}>
              Soto y Ochoa Barbería
            </Text>
            <Text style={[styles.featuredService, { color: colors.textSecondary }]}>
              Corte Clásico + Barba
            </Text>
            <Text style={styles.featuredTime}>Hoy, 4:30 PM</Text>

            <View style={styles.featuredButtonsRow}>
              <TouchableOpacity
                onPress={() => handleOpenBarbershop('kenys')}
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
                activeOpacity={0.8}
                style={[styles.locationButton, { backgroundColor: BrandColors.goldFlat }]}>
                <Text style={styles.locationButtonText}>Ubicación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Píldoras de Filtros / Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map((cat) => {
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
          {/* Card 1: Keny's Barbershop (Clickable para ver detalle) */}
          <TouchableOpacity
            onPress={() => handleOpenBarbershop('kenys')}
            activeOpacity={0.88}
            style={[
              styles.barberCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.barberImageContainer}>
              <Image
                source={{ uri: BEBO_BARBER_IMG }}
                style={styles.barberImage}
                contentFit="cover"
              />
              <View style={styles.heartButton}>
                <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.barberCardBody}>
              <Text style={[styles.barberName, { color: colors.textPrimary }]} numberOfLines={1}>
                Keny's Barbershop
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#E5A93B" style={{ marginRight: 3 }} />
                <Text style={[styles.barberRating, { color: colors.textSecondary }]}>
                  4.95 (184 reseñas)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleOpenBarbershop('kenys')}
                activeOpacity={0.85}
                style={[styles.agendarButton, { backgroundColor: BrandColors.goldFlat }]}>
                <Text style={styles.agendarButtonText}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Card 2: Vintage Barber Shop */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={[
              styles.barberCard,
              { backgroundColor: colors.card },
              Shadows.drop,
            ]}>
            <View style={styles.barberImageContainer}>
              <Image
                source={{ uri: VINTAGE_BARBER_IMG }}
                style={styles.barberImage}
                contentFit="cover"
              />
              <View style={styles.heartButton}>
                <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.barberCardBody}>
              <Text style={[styles.barberName, { color: colors.textPrimary }]} numberOfLines={1}>
                Vintage Barber Shop
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#E5A93B" style={{ marginRight: 3 }} />
                <Text style={[styles.barberRating, { color: colors.textSecondary }]}>
                  4.5 (115 reseñas)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleOpenBarbershop('vintage')}
                activeOpacity={0.85}
                style={[styles.agendarButton, { backgroundColor: BrandColors.goldFlat }]}>
                <Text style={styles.agendarButtonText}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
          <Image source={{ uri: USER_AVATAR }} style={styles.navAvatarIcon} />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
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
    gap: 12,
    marginBottom: Spacing.xl,
  },
  barberCard: {
    flex: 1,
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
});
