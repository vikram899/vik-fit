/**
 * SHARED CONSTANTS BARREL EXPORT
 *
 * Centralized export of all constants, design tokens, and configuration.
 *
 * This makes imports cleaner throughout the app:
 * Instead of: import { COLORS } from '../../constants/colors'
 * Use: import { COLORS } from '@shared/constants'
 *
 * All color, spacing, typography, and config values are exported here.
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

// Color palette
export { COLORS } from './colors';

// Spacing and sizing
export { SPACING } from './spacing';

// Typography and text styles
export { TYPOGRAPHY } from './typography';

// ============================================================================
// CONFIGURATION
// ============================================================================

// App-wide configuration, feature flags, and settings
export { APP_CONFIG } from './config';

// ============================================================================
// DOMAIN DATA
// ============================================================================

// Body parts for exercise targeting
export { BODY_PARTS, BODY_PARTS_LIST } from './bodyParts';

