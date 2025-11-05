/**
 * SHARED MODULE BARREL EXPORT
 *
 * Central export point for all shared utilities, constants, components, and hooks.
 *
 * This makes it very easy to import from shared throughout the app:
 * - import { COLORS, SPACING, TYPOGRAPHY } from '@shared/constants'
 * - import { getCurrentDate, getProgressColor } from '@shared/utils'
 * - import { Card, Button, Badge, Section } from '@shared/components'
 * - import { useMealData, useWorkoutData } from '@shared/hooks'
 *
 * Benefits:
 * - Cleaner imports in all files
 * - Easier to track what's public vs private
 * - Single point of control for shared API
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  APP_CONFIG,
} from './constants';

// ============================================================================
// UTILITIES
// ============================================================================

// Date utilities
export {
  getCurrentDate,
  getFormattedDate,
  formatDateForDisplay,
  getDayNames,
  getDayNameForDate,
  getMondayOfWeek,
  getSundayOfWeek,
  getWeekDates,
  isDateToday,
  daysBetween,
} from './utils/dateUtils';

// Progress utilities
export {
  PROGRESS_THRESHOLDS,
  getProgressColor,
  getProgressStatus,
  calculatePercentage,
  calculatePercentageCapped,
  calculateMacroProgress,
  getProgressBarWidth,
  formatProgressText,
  isGoalExceeded,
  isGoalMet,
} from './utils/progressUtils';

// Meal utilities
export {
  MEAL_TYPES,
  MEAL_TYPES_ARRAY,
  getMealTypeByTime,
  getMealTypeIcon,
  getMealTypeEmoji,
  getMealTypeSuggestedTime,
  isValidMealType,
  getNextMealType,
  getPreviousMealType,
  calculateMealMacroTotals,
  formatMacroValues,
} from './utils/mealUtils';

// Validation utilities
export {
  isValidString,
  isValidNumber,
  isValidInteger,
  isValidDate,
  isValidEmail,
  isEmptyObject,
  isEmptyArray,
  valueExists,
  isValidMeal,
  isValidWorkout,
  isValidMacroGoals,
  sanitizeInput,
  roundNumber,
} from './utils/validationUtils';

// ============================================================================
// COMPONENTS
// ============================================================================

// UI Components (Card, Button, Section, Badge, etc.)
export {
  Card,
  Button,
  Section,
  Badge,
  ProgressBar,
  StatCard,
  MacroCard,
  ListItem,
} from './components/ui';

// ============================================================================
// HOOKS
// ============================================================================

export {
  useMealData,
  useWorkoutData,
  useWeightData,
} from './hooks';
