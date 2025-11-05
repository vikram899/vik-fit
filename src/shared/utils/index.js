/**
 * SHARED UTILITIES BARREL EXPORT
 *
 * Centralized export of all utility functions.
 * This makes imports cleaner: import { getCurrentDate, getProgressColor } from '@shared/utils';
 */

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
} from './dateUtils';

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
} from './progressUtils';

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
} from './mealUtils';

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
} from './validationUtils';
