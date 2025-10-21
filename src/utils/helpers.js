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

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Parse number safely
 * @param {string|number} value - Value to parse
 * @param {boolean} allowDecimal - Allow decimal values
 * @returns {number} Parsed number
 */
export const parseNumber = (value, allowDecimal = false) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return 0;
  return allowDecimal ? parsed : Math.floor(parsed);
};

/**
 * Get time of day greeting
 * @returns {string} Greeting text
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};
