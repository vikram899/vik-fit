/**
 * Meal Statistics and Weekly Summary Functions
 * Calculate weekly totals, trends, and comparisons
 */

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('vikfit.db');

/**
 * Get daily totals for a specific date
 */
export const getDailyMealData = async (date) => {
  try {
    const result = await db.getFirstAsync(
      `SELECT
        COALESCE(SUM(calories), 0) as totalCalories,
        COALESCE(SUM(protein), 0) as totalProtein,
        COALESCE(SUM(carbs), 0) as totalCarbs,
        COALESCE(SUM(fats), 0) as totalFats
       FROM meal_logs
       WHERE mealDate = ?`,
      [date]
    );
    return result || { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
  } catch (error) {
    return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
  }
};

/**
 * Get weekly totals for a specific week (Monday to Sunday)
 * @param {string} startDate - Monday of the week (YYYY-MM-DD)
 */
export const getWeeklyMealData = async (startDate) => {
  try {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + 6); // Saturday
    const endDate = endDateObj.toISOString().split('T')[0];

    const result = await db.getFirstAsync(
      `SELECT
        COALESCE(SUM(calories), 0) as totalCalories,
        COALESCE(SUM(protein), 0) as totalProtein,
        COALESCE(SUM(carbs), 0) as totalCarbs,
        COALESCE(SUM(fats), 0) as totalFats
       FROM meal_logs
       WHERE mealDate >= ? AND mealDate <= ?`,
      [startDate, endDate]
    );
    return result || { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
  } catch (error) {
    return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
  }
};

/**
 * Get daily meal data for entire week
 * @param {string} startDate - Monday of the week (YYYY-MM-DD)
 * Returns array with 7 days of data
 */
export const getWeeklyDailyBreakdown = async (startDate) => {
  try {
    const weekData = [];
    const startDateObj = new Date(startDate);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dailyData = await getDailyMealData(dateStr);

      weekData.push({
        date: dateStr,
        day: dayNames[i],
        dayNumber: i,
        ...dailyData,
      });
    }

    return weekData;
  } catch (error) {
    return [];
  }
};

/**
 * Get average daily goals for a week
 * Assumes goals are the same for all days in the week
 */
export const getWeeklyGoals = async (startDate) => {
  try {
    // Get the most recent macro goals saved on or before startDate
    // Exclude invalid dates like "0000-01-01"
    const result = await db.getFirstAsync(
      `SELECT
        calorieGoal,
        proteinGoal,
        carbsGoal,
        fatsGoal,
        goalDate
       FROM macro_goals
       WHERE goalDate <= ? AND goalDate != "0000-01-01"
       ORDER BY goalDate DESC
       LIMIT 1`,
      [startDate]
    );

    if (result) {
      return {
        calorieGoal: result.calorieGoal * 7, // 7 days
        proteinGoal: result.proteinGoal * 7,
        carbsGoal: result.carbsGoal * 7,
        fatsGoal: result.fatsGoal * 7,
      };
    }
    return { calorieGoal: 0, proteinGoal: 0, carbsGoal: 0, fatsGoal: 0 };
  } catch (error) {
    return { calorieGoal: 0, proteinGoal: 0, carbsGoal: 0, fatsGoal: 0 };
  }
};

/**
 * Calculate percentage change between two weeks
 */
export const calculatePercentageChange = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * Get Monday of the week for a given date
 */
export const getMondayOfWeek = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  // If Sunday (0), go back 6 days. Otherwise, go back (dayOfWeek - 1) days
  const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const difference = dateObj.getDate() - daysBack;
  const monday = new Date(dateObj.setDate(difference));
  return monday.toISOString().split('T')[0];
};

/**
 * Get daily completion percentage for a specific date
 * @param {string} date - The date (YYYY-MM-DD)
 * @param {number} dailyGoal - Daily goal for the macro
 */
export const getDailyCompletionPercentage = async (date, dailyGoal) => {
  if (dailyGoal === 0) return 0;

  const dailyData = await getDailyMealData(date);
  // We'll need to pass the specific macro value, so return the formula
  // Usage: Math.min((actual / goal) * 100, 100)
  return dailyData;
};
