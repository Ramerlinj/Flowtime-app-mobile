export interface ThemeColors {
  background: string;
  backgroundGradient: readonly [string, string];
  card: string;
  inputBackground: string;
  textPrimary: string;
  textSecondary: string;
  placeholder: string;
  goldText: string;
  successText: string;
  selected: string;
  divider: string;
  toggleBackground: string;
  toggleDot: string;
  toggleText: string;
  border: string;
  white: string;
  black: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#FFFFFF',
    backgroundGradient: ['#F5E8C7', '#FFFFFF'],
    card: '#F4F4F6',
    inputBackground: '#D9D9D9',
    textPrimary: '#1C1C1C',
    textSecondary: '#636363',
    placeholder: '#636366',
    goldText: '#E9A83A',
    successText: '#188E1C',
    selected: '#4B4636',
    divider: 'rgba(0, 0, 0, 0.12)',
    toggleBackground: '#2B251B',
    toggleDot: '#F3DA80',
    toggleText: '#F3DA80',
    border: '#636366',
    white: '#FFFFFF',
    black: '#000000',
  },
  dark: {
    background: '#121214',
    backgroundGradient: ['#221E17', '#121214'],
    card: '#1F1F24',
    inputBackground: '#2C2C2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#9E9E9E',
    placeholder: '#8E8E93',
    goldText: '#F3DA80',
    successText: '#2ECC71',
    selected: '#6E6652',
    divider: 'rgba(255, 255, 255, 0.15)',
    toggleBackground: '#F3DA80',
    toggleDot: '#1C1C1C',
    toggleText: '#1C1C1C',
    border: '#8E8E93',
    white: '#FFFFFF',
    black: '#000000',
  },
};

export const Gradients = {
  // Fondo Principal: Linear Gradient 0% #F5E8C7 ➔ 100% #FFFFFF
  backgroundLight: ['#F5E8C7', '#FFFFFF'] as [string, string],
  backgroundLightLocations: [0, 1] as [number, number],

  // Fondo Oscuro
  backgroundDark: ['#231F18', '#101012'] as [string, string],
  backgroundDarkLocations: [0, 1] as [number, number],

  // Botones/Cuadros Dorados Premium: Linear Gradient 0% #B8860B ➔ 50% #F3DA80 ➔ 100% #D4AF37
  goldPremium: ['#B8860B', '#F3DA80', '#D4AF37'] as [string, string, string],
  goldPremiumLocations: [0, 0.5, 1] as [number, number, number],

  // Botón Iniciar Sesión & Google: Linear Gradient 0% #1D1C19 ➔ 100% #837E6F
  darkButton: ['#1D1C19', '#837E6F'] as [string, string],
  darkButtonLocations: [0, 1] as [number, number],

  // Botón "Soy Cliente": Linear Gradient 0% #FFFFFF ➔ 77% #858586 ➔ 100% #1C1C1E
  clientButton: ['#FFFFFF', '#858586', '#1C1C1E'] as [string, string, string],
  clientButtonLocations: [0, 0.77, 1] as [number, number, number],
} as const;

export const BrandColors = {
  goldFlat: '#F3DA80',
  goldText: '#E9A83A',
  successGreen: '#188E1C',
  selected: '#4B4636',
  cardWhite: '#F4F4F6',
  inputGray: '#D9D9D9',
  workdayBorder: '#636366',
  nonWorkdayOpacity: 0.5,
} as const;

export type ThemeMode = 'light' | 'dark';
