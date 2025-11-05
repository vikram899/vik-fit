/**
 * CENTRALIZED COLOR PALETTE FOR VIKFIT APP
 *
 * This is the single source of truth for all app colors.
 * Consolidated from:
 * - src/constants/colors.js
 * - src/constants/design.js
 * - src/styles/index.js
 *
 * Changes to colors should be made here and will propagate throughout the app.
 */

export const COLORS = {
  // ============================================================================
  // PRIMARY & SECONDARY COLORS
  // ============================================================================
  primary: "#0066FF", // Electric Blue - main brand color
  secondary: "#000000", // Black - secondary brand color

  // ============================================================================
  // STATUS COLORS
  // ============================================================================
  success: "#00C853", // Green - for successful actions
  warning: "#FFC107", // Yellow/Orange - for warnings
  danger: "#FF3B30", // Red - for errors and destructive actions
  error: "#FF3B30", // Red - alias for danger
  info: "#007AFF", // Blue - for informational content

  // ============================================================================
  // BACKGROUND COLORS
  // ============================================================================
  background: "#FFFFFF", // Main background - white
  lightBackground: "#F5F5F5", // Alternative light background
  lightGray: "#f9f9f9", // Light gray for subtle backgrounds
  gray: "#F5F5F5", // Standard gray background
  mediumGray: "#e0e0e0", // Medium gray - borders and dividers

  // ============================================================================
  // TEXT COLORS
  // ============================================================================
  text: "#000000", // Default text
  textPrimary: "#000000", // Primary text - strong contrast
  textSecondary: "#666666", // Secondary text - medium contrast
  textTertiary: "#999999", // Tertiary text - weak contrast
  darkGray: "#999999", // Alias for tertiary text

  // ============================================================================
  // PURE COLORS
  // ============================================================================
  white: "#FFFFFF", // Pure white
  black: "#000000", // Pure black

  // ============================================================================
  // LIGHT VARIANTS (for badges, highlights, backgrounds)
  // ============================================================================
  primaryLight: "#E8F4FF", // Light blue - primary color background
  secondaryLight: "#E8F5E9", // Light green - secondary background
  dangerLight: "#FFEBEE", // Light red - danger background

  // ============================================================================
  // MACRO/NUTRITION COLORS
  // Used for nutrition tracking: calories, protein, carbs, fats
  // ============================================================================
  calories: "#007AFF", // Blue - calorie tracking
  protein: "#FF9800", // Orange - protein tracking
  carbs: "#4CAF50", // Green - carbohydrates tracking
  fats: "#FF6B6B", // Red - fats tracking
};

export default COLORS;
