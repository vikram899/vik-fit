import { Platform } from 'react-native';

// Matches Figma's GlassCard: box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37)
const shadowBase = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
  default: {},
});

const shadowMedium = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
  },
  android: { elevation: 8 },
  default: {},
});

const shadowLarge = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 32,
  },
  android: { elevation: 12 },
  default: {},
});

export const Shadows = {
  none: {},
  sm:   shadowBase,
  md:   shadowMedium,
  lg:   shadowLarge,
} as const;
