/**
 * PROGRESS & CALCULATION UTILITIES FOR VIKFIT APP
 *
 * Common progress tracking, color calculation, and threshold logic.
 * Eliminates duplicated progress calculation logic throughout the app.
 */

import { COLORS } from '../constants/colors';

/**
 * PROGRESS THRESHOLDS
 * Standardized thresholds for progress color coding
 */
const PROGRESS_THRESHOLDS = {
  excellent: 90,  // >= 90%
  good: 70,       // >= 70%
  fair: 50,       // >= 50%
  // Below 50% is poor
};

/**
 * Get the color for a progress percentage
 * Eliminates duplicated logic:
 * - StatCard: >= 90% green, >= 70% yellow, else red
 * - DailyBreakdownCards: >= 90% green, >= 70% yellow, >= 50% orange, else red
 * - StreakCard: 80%+ green, 50-79% yellow, <50% red
 *
 * @param {number} percentage - Percentage value (0-100)
 * @returns {string} Color hex code
 *
 * @example
 * const color = getProgressColor(85);
 * // Returns: '#FFC107' (yellow)
 */
export const getProgressColor = (percentage) => {
  if (percentage >= PROGRESS_THRESHOLDS.excellent) {
    return COLORS.success; // #00C853 - Green
  }
  if (percentage >= PROGRESS_THRESHOLDS.good) {
    return COLORS.warning; // #FFC107 - Yellow/Orange
  }
  if (percentage >= PROGRESS_THRESHOLDS.fair) {
    return COLORS.warning; // #FFC107 - Orange (same as good for now)
  }
  return COLORS.danger; // #FF3B30 - Red
};

/**
 * Get progress status text based on percentage
 *
 * @param {number} percentage - Percentage value (0-100)
 * @returns {string} Status text (e.g., 'Excellent', 'Good', 'Fair', 'Poor')
 *
 * @example
 * const status = getProgressStatus(95);
 * // Returns: 'Excellent'
 */
export const getProgressStatus = (percentage) => {
  if (percentage >= PROGRESS_THRESHOLDS.excellent) {
    return 'Excellent';
  }
  if (percentage >= PROGRESS_THRESHOLDS.good) {
    return 'Good';
  }
  if (percentage >= PROGRESS_THRESHOLDS.fair) {
    return 'Fair';
  }
  return 'Poor';
};

/**
 * Calculate percentage from actual and goal values
 *
 * @param {number} actual - Actual value achieved
 * @param {number} goal - Goal/target value
 * @returns {number} Percentage (0-100+, can exceed 100 if actual > goal)
 *
 * @example
 * const percent = calculatePercentage(150, 100);
 * // Returns: 150
 */
export const calculatePercentage = (actual, goal) => {
  if (goal === 0 || goal === undefined) return 0;
  return (actual / goal) * 100;
};

/**
 * Calculate percentage capped at 100%
 *
 * @param {number} actual - Actual value achieved
 * @param {number} goal - Goal/target value
 * @returns {number} Percentage (0-100, capped)
 *
 * @example
 * const percent = calculatePercentageCapped(150, 100);
 * // Returns: 100
 */
export const calculatePercentageCapped = (actual, goal) => {
  return Math.min(calculatePercentage(actual, goal), 100);
};

/**
 * Calculate macro progress with color
 * Used for nutrition tracking
 *
 * @param {number} actual - Actual macro value (g or cal)
 * @param {number} goal - Goal macro value
 * @returns {object} Object with percentage, color, and status
 *
 * @example
 * const progress = calculateMacroProgress(75, 100);
 * // Returns: { percentage: 75, color: '#FFC107', status: 'Good' }
 */
export const calculateMacroProgress = (actual, goal) => {
  const percentage = calculatePercentageCapped(actual, goal);
  return {
    percentage: Math.round(percentage),
    color: getProgressColor(percentage),
    status: getProgressStatus(percentage),
  };
};

/**
 * Get progress bar width percentage (for animated progress bars)
 * Useful for FlatList or ScrollView progress indicators
 *
 * @param {number} actual - Actual value
 * @param {number} goal - Goal value
 * @param {number} maxWidth - Max width in pixels (optional)
 * @returns {number|string} Width percentage or pixels
 *
 * @example
 * const width = getProgressBarWidth(75, 100, 300);
 * // Returns: 225 (75% of 300px)
 */
export const getProgressBarWidth = (actual, goal, maxWidth = 100) => {
  const percentage = calculatePercentageCapped(actual, goal);
  return maxWidth * (percentage / 100);
};

/**
 * Format progress text (e.g., "75/100 cal")
 *
 * @param {number} actual - Actual value
 * @param {number} goal - Goal value
 * @param {string} unit - Unit label (e.g., 'cal', 'g')
 * @returns {string} Formatted progress text
 *
 * @example
 * const text = formatProgressText(75, 100, 'cal');
 * // Returns: '75/100 cal'
 */
export const formatProgressText = (actual, goal, unit = '') => {
  return `${Math.round(actual)}/${Math.round(goal)}${unit ? ' ' + unit : ''}`;
};

/**
 * Check if a goal has been exceeded
 *
 * @param {number} actual - Actual value
 * @param {number} goal - Goal value
 * @returns {boolean} True if actual >= goal
 *
 * @example
 * const exceeded = isGoalExceeded(105, 100);
 * // Returns: true
 */
export const isGoalExceeded = (actual, goal) => {
  return actual >= goal;
};

/**
 * Check if a goal has been met (within tolerance)
 *
 * @param {number} actual - Actual value
 * @param {number} goal - Goal value
 * @param {number} tolerance - Tolerance percentage (default 10%)
 * @returns {boolean} True if actual is within tolerance of goal
 *
 * @example
 * const met = isGoalMet(95, 100, 10);
 * // Returns: true (within 10% tolerance)
 */
export const isGoalMet = (actual, goal, tolerance = 10) => {
  const minValue = goal * (1 - tolerance / 100);
  const maxValue = goal * (1 + tolerance / 100);
  return actual >= minValue && actual <= maxValue;
};

export default {
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
};
