/**
 * DATE UTILITIES FOR VIKFIT APP
 *
 * Common date manipulation and formatting functions.
 * Eliminates repeated date logic throughout the app.
 */

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * Replaces: new Date().toISOString().split('T')[0]
 *
 * @returns {string} Today's date in format 'YYYY-MM-DD'
 *
 * @example
 * const today = getCurrentDate();
 * // Returns: '2025-11-05'
 */
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get a specific date in ISO format (YYYY-MM-DD)
 *
 * @param {Date} date - The date to format
 * @returns {string} Date in format 'YYYY-MM-DD'
 *
 * @example
 * const date = getFormattedDate(new Date('2025-11-05'));
 * // Returns: '2025-11-05'
 */
export const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Format a date string for display (e.g., "Nov 5, 2025")
 *
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string (e.g., 'Nov 5, 2025')
 *
 * @example
 * const formatted = formatDateForDisplay('2025-11-05');
 * // Returns: 'Nov 5, 2025'
 */
export const formatDateForDisplay = (dateInput) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get the day names array
 * Replaces duplicated: const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 *
 * @returns {string[]} Array of day names starting with Sunday
 *
 * @example
 * const days = getDayNames();
 * // Returns: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
 */
export const getDayNames = () => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
};

/**
 * Get a short day name (Sun, Mon, etc.) for a given date
 *
 * @param {string|Date} dateInput - Date string (YYYY-MM-DD) or Date object
 * @returns {string} Short day name (e.g., 'Mon')
 *
 * @example
 * const dayName = getDayNameForDate('2025-11-05');
 * // Returns: 'Wed'
 */
export const getDayNameForDate = (dateInput) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  return getDayNames()[date.getDay()];
};

/**
 * Get the Monday of the week for a given date
 *
 * @param {string|Date} dateInput - Date string (YYYY-MM-DD) or Date object
 * @returns {string} Monday's date in format 'YYYY-MM-DD'
 *
 * @example
 * const monday = getMondayOfWeek('2025-11-05'); // Wednesday
 * // Returns: '2025-11-03' (Monday of that week)
 */
export const getMondayOfWeek = (dateInput) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
};

/**
 * Get the Sunday of the week for a given date
 *
 * @param {string|Date} dateInput - Date string (YYYY-MM-DD) or Date object
 * @returns {string} Sunday's date in format 'YYYY-MM-DD'
 *
 * @example
 * const sunday = getSundayOfWeek('2025-11-05'); // Wednesday
 * // Returns: '2025-11-02' (Sunday of that week)
 */
export const getSundayOfWeek = (dateInput) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  return sunday.toISOString().split('T')[0];
};

/**
 * Get all dates of a week (Monday to Sunday)
 *
 * @param {string|Date} dateInput - Any date in the week
 * @returns {string[]} Array of dates in format 'YYYY-MM-DD'
 *
 * @example
 * const weekDates = getWeekDates('2025-11-05');
 * // Returns: ['2025-11-03', '2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07', '2025-11-08', '2025-11-09']
 */
export const getWeekDates = (dateInput) => {
  const monday = new Date(getMondayOfWeek(dateInput) + 'T00:00:00');
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

/**
 * Check if a date is today
 *
 * @param {string|Date} dateInput - Date to check
 * @returns {boolean} True if date is today
 *
 * @example
 * const isToday = isDateToday('2025-11-05');
 */
export const isDateToday = (dateInput) => {
  return getCurrentDate() === (typeof dateInput === 'string' ? dateInput : getFormattedDate(dateInput));
};

/**
 * Get the number of days between two dates
 *
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Number of days between dates
 *
 * @example
 * const days = daysBetween('2025-11-01', '2025-11-05');
 * // Returns: 4
 */
export const daysBetween = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? new Date(date1 + 'T00:00:00') : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2 + 'T00:00:00') : date2;
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default {
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
};
