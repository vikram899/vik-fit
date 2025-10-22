/**
 * Utility helper functions
 */

/**
 * Format date to display string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string (e.g., "Oct 21, 2025")
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get current date
 * @returns {string} Current date in ISO format
 */
export const getCurrentDate = () => {
  return new Date().toISOString();
};

/**
 * Get meal type based on current hour
 * @returns {string} Meal type: 'breakfast', 'lunch', 'dinner', or 'snack'
 */
export const getMealTypeByTime = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'breakfast';
  } else if (hour < 15) {
    return 'lunch';
  } else if (hour < 21) {
    return 'dinner';
  } else {
    return 'snack';
  }
};

/**
 * Validate if string is not empty
 * @param {string} value - String to validate
 * @returns {boolean}
 */
export const isValidString = (value) => {
  return value && value.trim().length > 0;
};

