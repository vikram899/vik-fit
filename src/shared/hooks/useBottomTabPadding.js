import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../constants';

/**
 * Hook to calculate proper bottom padding for screens with bottom tab navigation.
 * Ensures content is always visible above the tab bar when scrolling to the bottom.
 *
 * @returns {number} The bottom padding value to apply to ScrollView contentContainerStyle
 */
export const useBottomTabPadding = () => {
  const insets = useSafeAreaInsets();

  // Tab bar height is approximately:
  // - Icon + label height: ~60px
  // - Padding: ~20px
  // - Safe area inset for devices with home indicator
  // - Extra spacing for comfortable viewing: 16px
  const TAB_BAR_HEIGHT = 80;
  const EXTRA_SPACING = SPACING.medium; // 16px

  return TAB_BAR_HEIGHT + insets.bottom + EXTRA_SPACING;
};
