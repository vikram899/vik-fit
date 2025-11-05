import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, TYPOGRAPHY } from "../constants";

/**
 * useTabBarStyles
 * Custom hook for managing tab bar styling and configuration
 * Automatically accounts for iPhone notch/home indicator spacing
 *
 * Returns:
 * - screenOptions: Tab navigator screen options
 * - tabBarStyleConfig: Extracted style configuration
 */
export const useTabBarStyles = () => {
  const insets = useSafeAreaInsets();

  const screenOptions = {
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.textTertiary,
    tabBarLabelStyle: {
      fontSize: TYPOGRAPHY.small.fontSize,
      fontWeight: TYPOGRAPHY.weights.medium,
    },
    headerShown: false,
    tabBarStyle: {
      backgroundColor: COLORS.background,
      borderTopColor: COLORS.lightGray,
      borderTopWidth: 1,
      paddingBottom: SPACING.small + insets.bottom,
      paddingTop: SPACING.xs,
      height: 80 + insets.bottom,
    },
  };

  return {
    screenOptions,
    tabBarStyleConfig: screenOptions.tabBarStyle,
  };
};
