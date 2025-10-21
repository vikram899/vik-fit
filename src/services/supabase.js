import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Note: Replace these with your actual Supabase credentials
// Get these from your Supabase project settings: https://app.supabase.com/
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

/**
 * Initialize Supabase client
 * Client is configured to use AsyncStorage for persistence
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Save workout to database
 * @param {Object} workoutData - Workout data { exercise_name, sets, reps, weight, date }
 * @returns {Promise<Object>} { data, error }
 */
export const saveWorkout = async (workoutData) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert([workoutData])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving workout:', error);
    return { data: null, error };
  }
};

/**
 * Fetch workouts for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to fetch
 * @returns {Promise<Object>} { data, error }
 */
export const fetchWorkouts = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return { data: null, error };
  }
};

/**
 * Delete workout from database
 * @param {string} workoutId - Workout ID
 * @returns {Promise<Object>} { data, error }
 */
export const deleteWorkout = async (workoutId) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting workout:', error);
    return { data: null, error };
  }
};

/**
 * Save meal to database
 * @param {Object} mealData - Meal data { meal_name, description, meal_type, photo_url, date }
 * @returns {Promise<Object>} { data, error }
 */
export const saveMeal = async (mealData) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .insert([mealData])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving meal:', error);
    return { data: null, error };
  }
};

/**
 * Fetch meals for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to fetch
 * @returns {Promise<Object>} { data, error }
 */
export const fetchMeals = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching meals:', error);
    return { data: null, error };
  }
};

/**
 * Delete meal from database
 * @param {string} mealId - Meal ID
 * @returns {Promise<Object>} { data, error }
 */
export const deleteMeal = async (mealId) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting meal:', error);
    return { data: null, error };
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} { data: { user }, error }
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data?.user, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
};
