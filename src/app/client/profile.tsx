import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ClientSetupCard } from '@/components/client/ClientSetupCard';
import { ClientSetupGuideModal } from '@/components/client/ClientSetupGuideModal';

export default function ClientProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { user, logout, updateProfile, refreshProfile } = useAuth();
  const { showConfirm, showSuccess, showError } = useAlert();

  // Estados para modal de edición de perfil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [formName, setFormName] = useState(user?.name || '');
  const [formLastName, setFormLastName] = useState(user?.lastName || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formAvatarUrl, setFormAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = () => {
    setFormName(user?.name || '');
    setFormLastName(user?.lastName || '');
    setFormPhone(user?.phone || '');
    setFormAvatarUrl(user?.avatarUrl || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!formName.trim()) {
      showError('Nombre requerido', 'Por favor ingresa tu nombre.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: formName.trim(),
        lastName: formLastName.trim(),
        phone: formPhone.trim() || null,
        avatarUrl: formAvatarUrl.trim() || null,
      });
      setIsEditModalOpen(false);
      showSuccess('Perfil Guardado', 'Tus datos han sido actualizados con éxito.');
    } catch (err: any) {
      showError('Error al guardar', err.message || 'No fue posible guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    showConfirm(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
      {
        confirmText: 'Cerrar sesión',
        cancelText: 'Cancelar',
        isDestructive: true,
      }
    );
  };

  const displayName = `${user?.name || 'Usuario'} ${user?.lastName || ''}`.trim();
  const displayEmail = user?.email || 'Sin correo registrado';

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
            paddingTop: Math.max(insets.top, 16) + 12,
            paddingBottom: insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Cabecera con Botón de Regreso */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Perfil</Text>
        </View>

        {/* Guía de Configuración de Perfil */}
        <ClientSetupCard
          user={user}
          onPressSetup={() => setIsSetupGuideOpen(true)}
        />

        {/* Card 1: Mi Perfil */}
        <TouchableOpacity
          onPress={handleOpenEdit}
          activeOpacity={0.88}
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeaderSmall, { color: colors.textPrimary }]}>Mi perfil</Text>
            <Text style={styles.editBadge}>Editar</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <UserAvatar
              size={64}
              avatarUrl={user?.avatarUrl}
              name={user?.name}
              lastName={user?.lastName}
              borderWidth={2}
            />
            <View style={styles.profileTextCol}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{displayName}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{displayEmail}</Text>
              {user?.phone ? (
                <Text style={[styles.userPhone, { color: colors.goldText }]}>{user.phone}</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {/* Card 2: Modo Oscuro */}
        <View
          style={[
            styles.card,
            styles.rowBetween,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>Modo oscuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#2C2C2E', true: '#C89C25' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#2C2C2E"
          />
        </View>

        {/* Card 3: Menú de Navegación del Usuario */}
        <View
          style={[
            styles.card,
            styles.groupedCard,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <TouchableOpacity
            onPress={() => router.push('/client')}
            style={styles.menuRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Mis reservas</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Ionicons name="heart-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Favoritos</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Mensajes</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenEdit}
            style={styles.menuRow}>
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Card 4: Soporte y Términos */}
        <View
          style={[
            styles.card,
            styles.groupedCard,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <TouchableOpacity style={styles.menuRow}>
            <Feather name="arrow-up-right" size={18} color={colors.textPrimary} style={styles.legalIcon} />
            <Text style={[styles.legalLabel, { color: colors.textPrimary }]}>Términos y Condiciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Feather name="arrow-up-right" size={18} color={colors.textPrimary} style={styles.legalIcon} />
            <Text style={[styles.legalLabel, { color: colors.textPrimary }]}>Políticas de Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Feather name="arrow-up-right" size={18} color={colors.textPrimary} style={styles.legalIcon} />
            <Text style={[styles.legalLabel, { color: colors.textPrimary }]}>Soporte</Text>
          </TouchableOpacity>
        </View>

        {/* Card 5: Cerrar Sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={[
            styles.logoutCard,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para Editar Datos de Perfil */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
              Shadows.drop,
            ]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Editar Perfil
              </Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Selector de Avatar */}
            <View style={styles.avatarPickerBox}>
              <UserAvatar
                size={54}
                avatarUrl={formAvatarUrl || null}
                name={formName}
                lastName={formLastName}
                borderWidth={2}
              />
              <View style={styles.presetsRow}>
                {[
                  { id: 'initials', url: '' },
                  { id: 'av1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
                  { id: 'av2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
                  { id: 'av3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
                  { id: 'av4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
                ].map((av) => {
                  const isSel = formAvatarUrl === av.url;
                  return (
                    <TouchableOpacity
                      key={av.id}
                      onPress={() => setFormAvatarUrl(av.url)}
                      style={[
                        styles.presetThumbBtn,
                        isSel && styles.presetThumbBtnActive,
                      ]}>
                      <UserAvatar
                        size={30}
                        avatarUrl={av.url || null}
                        name={formName}
                        lastName={formLastName}
                        borderWidth={0}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary,
                  borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Apellido</Text>
            <TextInput
              value={formLastName}
              onChangeText={setFormLastName}
              placeholder="Tu apellido"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary,
                  borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Teléfono</Text>
            <TextInput
              value={formPhone}
              onChangeText={setFormPhone}
              placeholder="809-000-0000"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary,
                  borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={isSaving}
              activeOpacity={0.88}
              style={styles.modalSaveButtonWrapper}>
              <LinearGradient
                colors={Gradients.goldPremium}
                locations={Gradients.goldPremiumLocations}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.modalSaveButton, Shadows.goldButtonDrop]}>
                {isSaving ? (
                  <ActivityIndicator color="#121214" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Guardar Cambios</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
        <TouchableOpacity onPress={() => router.replace('/client')} style={styles.navTab}>
          <Ionicons name="home-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/client')} style={styles.navTab}>
          <Ionicons name="location-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/client')} style={styles.navTab}>
          <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Actividad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab}>
          <View style={styles.activeTabIndicator} />
          <UserAvatar
            size={24}
            avatarUrl={user?.avatarUrl}
            name={user?.name}
            lastName={user?.lastName}
            borderWidth={1.5}
            borderColor="#C89C25"
          />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Guía de Configuración de Perfil de Cliente */}
      <ClientSetupGuideModal
        visible={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        currentUser={user}
        onCompleted={refreshProfile}
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
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: 8,
  },
  backButton: {
    paddingRight: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardHeaderSmall: {
    fontSize: 15,
    fontWeight: '800',
  },
  editBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  profileTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  groupedCard: {
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    width: 28,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  legalIcon: {
    width: 28,
  },
  legalLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
    paddingVertical: 16,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  avatarPickerBox: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetThumbBtn: {
    padding: 3,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetThumbBtnActive: {
    borderColor: '#BA8609',
    backgroundColor: 'rgba(186, 134, 9, 0.15)',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: Spacing.xs,
  },
  modalInput: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.base,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  modalSaveButtonWrapper: {
    marginTop: Spacing.md,
    height: 48,
  },
  modalSaveButton: {
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#121214',
    fontSize: 16,
    fontWeight: '700',
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
    position: 'relative',
  },
  activeTabIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#C89C25',
  },
  navAvatarIconActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C89C25',
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

