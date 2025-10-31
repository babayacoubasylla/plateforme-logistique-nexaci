import { colors } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#1a1a1a'
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#333'
    },
    body: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      color: '#333'
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      color: '#6b7280'
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#333'
    }
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
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
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5
    }
  }
};

export type Theme = typeof theme;
