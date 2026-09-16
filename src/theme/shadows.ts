import { Platform, ViewStyle } from 'react-native';

export const Shadows = {
  // Efecto Global: Drop Shadow activado en todos los cuadros
  drop: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
    } as any,
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 4,
    },
  }) as ViewStyle,

  // Sombra dorada para botones premium
  goldButtonDrop: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#7A5E0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    web: {
      boxShadow: '0 5px 14px rgba(122, 94, 11, 0.35)',
    } as any,
    default: {
      shadowColor: '#7A5E0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
  }) as ViewStyle,

  // Sombra para botón oscuro / Google
  darkButtonDrop: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    android: {
      elevation: 5,
    },
    web: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    } as any,
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
  }) as ViewStyle,

  // Sin sombra (ej. para selector de Día y Hora del calendario)
  none: Platform.select<ViewStyle>({
    ios: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: {
      elevation: 0,
    },
    web: {
      boxShadow: 'none',
    } as any,
    default: {
      elevation: 0,
    },
  }) as ViewStyle,
};
