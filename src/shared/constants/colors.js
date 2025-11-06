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
  primary: "#2a90fcff", // Electric Blue - main brand color
  secondary: "#ffffffff", // Black - secondary brand color
  tertiary: "#00C853",
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
  mainBackground: "#030303ff", // Main background - white
  secondaryBackground: "#202021ff", // Light gray for subtle backgrounds
  tertiaryBackground: "#3d3d3dff", // Alternative light background
  workoutBackground: "#fb7832ff",
  mediumGray: "#202021ff", // Medium gray - borders and dividers

  // ============================================================================
  // TEXT COLORS
  // ============================================================================
  text: "#000000", // Default text
  textPrimary: "#FFFFFF", // Primary text - strong contrast
  textSecondary: "#d4d4d4ff", // Secondary text - medium contrast
  textTertiary: "#e04040ff", // Tertiary text - weak contrast

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
  calories: "#00eeffff", // Blue - calorie tracking
  protein: "#FF9800", // Orange - protein tracking
  carbs: "#4CAF50", // Green - carbohydrates tracking
  fats: "#FF6B6B", // Red - fats tracking

  calories60: "#00eeff99",
  protein60: "#ff980099",
  carbs60: "#4caf5099",
  fats60: "#ff6b6b99",

  // ============================================================================
  // MEAL TYPE COLORS (for meal category indicators)
  // ============================================================================
  // VEG meal type
  vegIcon: "#4CAF50", // Green icon for veg meals
  vegBackground: "#E8F5E9", // Light green background for veg badge
  vegBorder: "#81C784", // Green border for veg indicator

  // NON-VEG meal type
  nonVegIcon: "#D32F2F", // Red icon for non-veg meals
  nonVegBackground: "#FFEBEE", // Light red background for non-veg badge
  nonVegBorder: "#EF5350", // Red border for non-veg indicator

  // EGG meal type
  eggIcon: "#FF9800", // Orange icon for egg meals
  eggBackground: "#FFF3E0", // Light orange background for egg badge
  eggBorder: "#FFB74D", // Orange border for egg indicator

  // VEGAN meal type
  veganIcon: "#7CB342", // Light green icon for vegan meals
  veganBackground: "#F1F8E9", // Very light green background for vegan badge
  veganBorder: "#9CCC65", // Light green border for vegan indicator

  // ============================================================================
  // MEAL CATEGORY COLORS (for meal type badges like Breakfast, Lunch, etc.)
  // ============================================================================
  breakfast: "#FF9800", // Orange - breakfast meals
  lunch: "#2196F3", // Blue - lunch meals
  snacks: "#FF5722", // Deep orange - snack meals
  dinner: "#7C4DFF", // Purple - dinner meals

  // ============================================================================
  // MACRO BADGE COLORS (for nutrition stat badges in meal cards)
  // ============================================================================
  caloriesBadge: "#FFE5D9", // Light orange/peach background for calories badge
  proteinBadge: "#D4F4DD", // Light green background for protein badge
  carbsBadge: "#FFE4B5", // Light orange/moccasin background for carbs badge
  fatsBadge: "#E8D4C0", // Light tan/beige background for fats badge

  // ============================================================================
  // FAVORITE/STAR COLORS
  // ============================================================================
  favorite: "#FFD700", // Gold - for favorited items (star icon)
  unfavorite: "#CCCCCC", // Light gray - for unfavorited items (outline star)

  // ============================================================================
  // MACRO ICON COLORS (for nutrition icons)
  // ============================================================================
  caloriesIcon: "#FF6B35", // Orange-red for calories icon (fire)
  proteinIcon: "#00A86B", // Green for protein icon (dumbbell)
  carbsIcon: "#D2691E", // Brown for carbs icon (bread)
  fatsIcon: "#8B4513", // Dark brown for fats icon (water droplet)
};

export default COLORS;
