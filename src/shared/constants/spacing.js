/**
 * CENTRALIZED SPACING & SIZING CONSTANTS FOR VIKFIT APP
 *
 * All spacing, padding, margin, border radius, and touch target sizes.
 * Consolidated from:
 * - src/constants/design.js
 * - src/styles/index.js
 *
 * Use these values throughout the app for consistent spacing and sizing.
 */

export const SPACING = {
  // ============================================================================
  // SPACING SCALE
  // Consistent spacing values used for padding, margin, and gaps
  // ============================================================================
  xs: 4,                           // Extra small - 4px
  tiny: 4,                         // Alias for xs
  sm: 8,                           // Small - 8px
  small: 8,                        // Alias for sm
  md: 12,                          // Medium - 12px
  medium: 12,                      // Alias for md
  element: 16,                     // Standard element spacing - 16px
  lg: 16,                          // Alias for element - 16px
  container: 20,                   // Container padding - 20px
  xl: 20,                          // Alias for container
  xxl: 24,                         // Extra large - 24px
  xxxl: 32,                        // Double extra large - 32px

  // ============================================================================
  // COMPONENT SIZES
  // Predefined sizes for common UI elements
  // ============================================================================
  buttonHeight: 56,                // Standard button height
  inputHeight: 48,                 // Standard input field height
  minTouchTarget: 44,              // Minimum touch target size (iOS HIG)
  iconSize: 24,                    // Standard icon size

  // ============================================================================
  // BORDER RADIUS
  // Border radius values for consistent rounded corners
  // ============================================================================
  borderRadius: 8,                 // Small radius
  borderRadiusSmall: 4,            // Very small radius
  borderRadiusLarge: 10,           // Large radius
  borderRadiusXL: 12,              // Extra large radius
  borderRadiusRound: 20,           // Rounded - for badges, pills
  borderRadiusFull: 999,           // Full circular - for circles

  // ============================================================================
  // LEGACY ALIASES (for backward compatibility during migration)
  // These can be removed after all files are updated
  // ============================================================================
  small: 8,                        // Duplicate of sm
};

export default SPACING;
