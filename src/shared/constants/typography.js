/**
 * CENTRALIZED TYPOGRAPHY CONSTANTS FOR VIKFIT APP
 *
 * All font sizes, weights, and predefined text styles.
 * Consolidated from:
 * - src/constants/design.js
 * - src/styles/index.js
 *
 * Use these values for consistent typography throughout the app.
 */

import { COLORS } from "./colors";

export const TYPOGRAPHY = {
  // ============================================================================
  // FONT SIZES
  // Individual font size values
  // ============================================================================
  sizes: {
    xs: 11, // Extra small - 11px
    sm: 12, // Small - 12px
    md: 14, // Medium - 14px
    lg: 16, // Large - 16px
    xl: 18, // Extra large - 18px
    xxl: 20, // Double extra large - 20px
    xxxl: 24, // Triple extra large - 24px
    jumbo: 28, // Jumbo - 28px
    giant: 32, // Giant - 32px
  },

  // ============================================================================
  // FONT WEIGHTS
  // Text weight/boldness values
  // ============================================================================
  weights: {
    thin: "100",
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "900",
  },

  // ============================================================================
  // PREDEFINED TEXT STYLES
  // Complete text styles with size, weight, color, and line height
  // ============================================================================

  // Large title - used for prominent headings
  largeTitle: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
    color: COLORS.textPrimary,
  },

  // Screen title - main title for full screen
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
    color: COLORS.textPrimary,
  },

  // Page title - subtitle level title
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
    color: COLORS.textPrimary,
  },

  // Section title - subsection heading
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
    color: COLORS.textPrimary,
  },

  // Compact title - smaller section heading
  compactTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
    color: COLORS.textPrimary,
  },

  // Card title - title within cards
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    color: COLORS.textPrimary,
  },

  // Body - standard paragraph text
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: COLORS.textPrimary,
  },

  // Body bold - emphasized body text
  bodyBold: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    color: COLORS.textPrimary,
  },

  // Subtitle - supporting text below titles
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: COLORS.textTertiary,
  },

  // Caption - small descriptive text
  caption: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    color: COLORS.textTertiary,
  },

  // Button text - text within buttons
  button: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    color: COLORS.white,
  },

  // Label - form labels and tags
  label: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    color: COLORS.textPrimary,
  },

  // Small - small supporting text
  small: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: COLORS.textTertiary,
  },

  // Tiny - smallest text
  tiny: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    color: COLORS.textSecondary,
  },
};

export default TYPOGRAPHY;
