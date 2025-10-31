import { colors, statusColors, colorForStatus } from './colors';

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

// Typography
export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#374151'
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#4b5563'
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: '#9ca3af'
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1f2937'
  }
};

// Border Radius
export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999
};

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5
  }
};

export const theme = {
  colors,
  statusColors,
  colorForStatus,
  spacing,
  typography,
  borderRadius,
  shadows
};
