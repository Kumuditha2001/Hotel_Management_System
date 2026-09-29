export const theme = {
  colors: {
    // Luxury Palette
    primary: '#0F172A', // Deep Midnight Navy
    primaryLight: '#1E293B',
    primaryLighter: '#334155',
    gold: '#C5A880', // Royal Champagne Gold
    goldLight: '#F7F3EE',
    goldDark: '#9F7E53',
    goldMuted: '#E7DDD3',
    
    // Backgrounds & Surfaces
    background: '#F8FAFC',
    backgroundDark: '#0B1120',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    
    // Text
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textLight: '#FFFFFF',
    textGold: '#C5A880',

    // Statuses
    success: '#10B981',
    successBg: '#ECFDF5',
    successText: '#047857',
    
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    warningText: '#B45309',

    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    dangerText: '#B91C1C',

    info: '#3B82F6',
    infoBg: '#EFF6FF',
    infoText: '#1D4ED8',

    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderGold: '#E7DDD3',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 9999,
  },
  shadows: {
    subtle: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    premium: {
      shadowColor: '#C5A880',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};
