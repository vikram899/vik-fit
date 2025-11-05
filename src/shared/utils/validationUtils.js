/**
 * VALIDATION UTILITIES FOR VIKFIT APP
 *
 * Common validation functions used throughout the app.
 * Includes form validation, number validation, and data integrity checks.
 */

/**
 * Check if a string is valid and not empty
 * Replaces: if (!value || value.trim() === '')
 *
 * @param {string} value - String to validate
 * @returns {boolean} True if string is valid and not empty
 *
 * @example
 * const valid = isValidString('hello');
 * // Returns: true
 */
export const isValidString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if a number is valid and positive
 *
 * @param {number} value - Number to validate
 * @param {number} minValue - Minimum allowed value (default: 0)
 * @returns {boolean} True if number is valid and >= minValue
 *
 * @example
 * const valid = isValidNumber(150, 0);
 * // Returns: true
 */
export const isValidNumber = (value, minValue = 0) => {
  return typeof value === 'number' && !isNaN(value) && value >= minValue;
};

/**
 * Check if a value is a valid integer
 *
 * @param {number} value - Value to validate
 * @returns {boolean} True if value is a valid integer
 *
 * @example
 * const valid = isValidInteger(42);
 * // Returns: true
 */
export const isValidInteger = (value) => {
  return Number.isInteger(value) && value >= 0;
};

/**
 * Check if a date string is valid (YYYY-MM-DD format)
 *
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if date string is valid
 *
 * @example
 * const valid = isValidDate('2025-11-05');
 * // Returns: true
 */
export const isValidDate = (dateString) => {
  if (!isValidString(dateString)) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString + 'T00:00:00');
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Check if an email is valid (basic validation)
 *
 * @param {string} email - Email to validate
 * @returns {boolean} True if email appears valid
 *
 * @example
 * const valid = isValidEmail('user@example.com');
 * // Returns: true
 */
export const isValidEmail = (email) => {
  if (!isValidString(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if an object is empty
 *
 * @param {object} obj - Object to check
 * @returns {boolean} True if object has no properties
 *
 * @example
 * const empty = isEmptyObject({});
 * // Returns: true
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Check if an array is empty
 *
 * @param {Array} arr - Array to check
 * @returns {boolean} True if array is empty
 *
 * @example
 * const empty = isEmptyArray([]);
 * // Returns: true
 */
export const isEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length === 0;
};

/**
 * Check if a value exists and is not null/undefined
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if value exists
 *
 * @example
 * const exists = valueExists(42);
 * // Returns: true
 */
export const valueExists = (value) => {
  return value !== null && value !== undefined;
};

/**
 * Validate meal object structure
 *
 * @param {object} meal - Meal object to validate
 * @returns {boolean} True if meal has required properties
 *
 * @example
 * const valid = isValidMeal({ name: 'Rice', calories: 200, protein: 5 });
 * // Returns: true
 */
export const isValidMeal = (meal) => {
  if (!meal || typeof meal !== 'object') return false;
  return (
    isValidString(meal.name) &&
    isValidNumber(meal.calories) &&
    isValidNumber(meal.protein) &&
    isValidNumber(meal.carbs) &&
    isValidNumber(meal.fats)
  );
};

/**
 * Validate workout object structure
 *
 * @param {object} workout - Workout object to validate
 * @returns {boolean} True if workout has required properties
 *
 * @example
 * const valid = isValidWorkout({ name: 'Running', duration: 30 });
 * // Returns: true
 */
export const isValidWorkout = (workout) => {
  if (!workout || typeof workout !== 'object') return false;
  return (
    isValidString(workout.name) &&
    (isValidNumber(workout.duration) || isValidInteger(workout.duration))
  );
};

/**
 * Validate macro goals
 *
 * @param {object} goals - Goals object with calories, protein, carbs, fats
 * @returns {boolean} True if all macros are valid numbers
 *
 * @example
 * const valid = isValidMacroGoals({ calories: 2000, protein: 100, carbs: 250, fats: 65 });
 * // Returns: true
 */
export const isValidMacroGoals = (goals) => {
  if (!goals || typeof goals !== 'object') return false;
  return (
    isValidNumber(goals.calories, 0) &&
    isValidNumber(goals.protein, 0) &&
    isValidNumber(goals.carbs, 0) &&
    isValidNumber(goals.fats, 0)
  );
};

/**
 * Sanitize user input (remove excess whitespace)
 *
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 *
 * @example
 * const clean = sanitizeInput('  hello  world  ');
 * // Returns: 'hello world'
 */
export const sanitizeInput = (input) => {
  if (!isValidString(input)) return '';
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Round number to specific decimal places
 *
 * @param {number} value - Number to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded number
 *
 * @example
 * const rounded = roundNumber(3.14159, 2);
 * // Returns: 3.14
 */
export const roundNumber = (value, decimals = 2) => {
  if (!isValidNumber(value)) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export default {
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
};
