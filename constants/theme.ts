// Mantra Counter - Design Tokens

export const Colors = {
  // Base palette
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceWarm: '#FDF5E8',
  border: '#EDE8DF',

  // Brand
  primary: '#B8860B',       // warm gold
  primaryLight: '#F5E6B3',
  primaryDark: '#8B6508',
  accent: '#9B7FA0',        // soft violet

  // Text
  text: '#2C2416',
  textSecondary: '#7A6A50',
  textMuted: '#B0A090',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#4A7C59',
  warning: '#C97B2A',
  error: '#B85450',

  // Special
  counting: '#B8860B',
  countingBg: '#FEF9EC',
  warning3: '#E8A87C',
  overlay: 'rgba(44, 36, 22, 0.4)',
};

export const Typography = {
  // Families
  sans: undefined, // system default

  // Sizes
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 32,
  display: 64,
  hero: 96,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
};
