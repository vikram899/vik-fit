/**
 * MEAL UTILITIES FOR VIKFIT APP
 *
 * Common meal-related functions and constants.
 * Eliminates duplicated meal logic throughout the app.
 */

/**
 * MEAL TYPES CONSTANT
 * Replaces duplicated arrays in 6+ files:
 * const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
 */
export const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  SNACK: 'Snacks',
  DINNER: 'Dinner',
};

/**
 * Array of meal types for iteration
 */
export const MEAL_TYPES_ARRAY = [
  MEAL_TYPES.BREAKFAST,
  MEAL_TYPES.LUNCH,
  MEAL_TYPES.SNACK,
  MEAL_TYPES.DINNER,
];

/**
 * MEAL TIME CONFIGURATION
 * Define which hours belong to which meal type
 */
const MEAL_TIME_CONFIG = {
  [MEAL_TYPES.BREAKFAST]: { start: 5, end: 10 },   // 5 AM - 10 AM
  [MEAL_TYPES.LUNCH]: { start: 11, end: 14 },      // 11 AM - 2 PM
  [MEAL_TYPES.SNACK]: { start: 14, end: 17 },      // 2 PM - 5 PM
  [MEAL_TYPES.DINNER]: { start: 17, end: 23 },     // 5 PM - 11 PM
};

/**
 * Get meal type based on current time
 * Replaces duplicated logic determining meal type by hour
 *
 * @param {Date} date - Date to check (defaults to now)
 * @returns {string} Meal type (Breakfast, Lunch, Snacks, or Dinner)
 *
 * @example
 * const mealType = getMealTypeByTime(new Date());
 * // If current time is 12:30, returns: 'Lunch'
 */
export const getMealTypeByTime = (date = new Date()) => {
  const hour = date.getHours();

  for (const [mealType, timeRange] of Object.entries(MEAL_TIME_CONFIG)) {
    if (hour >= timeRange.start && hour < timeRange.end) {
      return mealType;
    }
  }

  // Default to breakfast if outside all ranges (midnight - 5 AM)
  return MEAL_TYPES.BREAKFAST;
};

/**
 * Get meal type icon name
 * Useful for MaterialCommunityIcons
 *
 * @param {string} mealType - Meal type (Breakfast, Lunch, Snacks, Dinner)
 * @returns {string} Icon name
 *
 * @example
 * const icon = getMealTypeIcon(MEAL_TYPES.BREAKFAST);
 * // Returns: 'coffee'
 */
export const getMealTypeIcon = (mealType) => {
  const iconMap = {
    [MEAL_TYPES.BREAKFAST]: 'coffee',
    [MEAL_TYPES.LUNCH]: 'food',
    [MEAL_TYPES.SNACK]: 'cookie',
    [MEAL_TYPES.DINNER]: 'silverware-fork-knife',
  };
  return iconMap[mealType] || 'food';
};

/**
 * Get meal type emoji
 *
 * @param {string} mealType - Meal type (Breakfast, Lunch, Snacks, Dinner)
 * @returns {string} Emoji
 *
 * @example
 * const emoji = getMealTypeEmoji(MEAL_TYPES.BREAKFAST);
 * // Returns: '🍳'
 */
export const getMealTypeEmoji = (mealType) => {
  const emojiMap = {
    [MEAL_TYPES.BREAKFAST]: '🍳',
    [MEAL_TYPES.LUNCH]: '🍽️',
    [MEAL_TYPES.SNACK]: '🍪',
    [MEAL_TYPES.DINNER]: '🍴',
  };
  return emojiMap[mealType] || '🍽️';
};

/**
 * Get suggested time for a meal type
 * Returns time in HH:MM format
 *
 * @param {string} mealType - Meal type
 * @returns {string} Suggested time (e.g., '09:00')
 *
 * @example
 * const time = getMealTypeSuggestedTime(MEAL_TYPES.BREAKFAST);
 * // Returns: '08:00'
 */
export const getMealTypeSuggestedTime = (mealType) => {
  const timeMap = {
    [MEAL_TYPES.BREAKFAST]: '08:00',
    [MEAL_TYPES.LUNCH]: '12:30',
    [MEAL_TYPES.SNACK]: '15:00',
    [MEAL_TYPES.DINNER]: '19:00',
  };
  return timeMap[mealType] || '12:00';
};

/**
 * Check if a meal type is valid
 *
 * @param {string} mealType - Value to check
 * @returns {boolean} True if mealType is valid
 *
 * @example
 * const valid = isValidMealType('Breakfast');
 * // Returns: true
 */
export const isValidMealType = (mealType) => {
  return MEAL_TYPES_ARRAY.includes(mealType);
};

/**
 * Get next meal type after a given meal
 *
 * @param {string} currentMealType - Current meal type
 * @returns {string} Next meal type in sequence
 *
 * @example
 * const next = getNextMealType(MEAL_TYPES.BREAKFAST);
 * // Returns: 'Lunch'
 */
export const getNextMealType = (currentMealType) => {
  const index = MEAL_TYPES_ARRAY.indexOf(currentMealType);
  if (index === -1 || index === MEAL_TYPES_ARRAY.length - 1) {
    return MEAL_TYPES.BREAKFAST;
  }
  return MEAL_TYPES_ARRAY[index + 1];
};

/**
 * Get previous meal type before a given meal
 *
 * @param {string} currentMealType - Current meal type
 * @returns {string} Previous meal type in sequence
 *
 * @example
 * const prev = getPreviousMealType(MEAL_TYPES.LUNCH);
 * // Returns: 'Breakfast'
 */
export const getPreviousMealType = (currentMealType) => {
  const index = MEAL_TYPES_ARRAY.indexOf(currentMealType);
  if (index <= 0) {
    return MEAL_TYPES.DINNER;
  }
  return MEAL_TYPES_ARRAY[index - 1];
};

/**
 * Calculate total macros from multiple meals
 *
 * @param {Array} meals - Array of meal objects with calories, protein, carbs, fats
 * @returns {object} Object with totaled macros
 *
 * @example
 * const totals = calculateMealMacroTotals([
 *   { calories: 500, protein: 20, carbs: 60, fats: 15 },
 *   { calories: 600, protein: 25, carbs: 70, fats: 20 }
 * ]);
 * // Returns: { calories: 1100, protein: 45, carbs: 130, fats: 35 }
 */
export const calculateMealMacroTotals = (meals = []) => {
  return meals.reduce(
    (totals, meal) => ({
      calories: (totals.calories || 0) + (meal.calories || 0),
      protein: (totals.protein || 0) + (meal.protein || 0),
      carbs: (totals.carbs || 0) + (meal.carbs || 0),
      fats: (totals.fats || 0) + (meal.fats || 0),
    }),
    {}
  );
};

/**
 * Format macro values for display
 *
 * @param {object} macros - Object with macro values (calories, protein, carbs, fats)
 * @returns {object} Formatted macros with proper decimal places
 *
 * @example
 * const formatted = formatMacroValues({ calories: 1234.5, protein: 45.67 });
 * // Returns: { calories: 1234, protein: 46 }
 */
export const formatMacroValues = (macros) => {
  return {
    calories: Math.round(macros.calories || 0),
    protein: Math.round(macros.protein || 0),
    carbs: Math.round(macros.carbs || 0),
    fats: Math.round(macros.fats || 0),
  };
};

export default {
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
};
