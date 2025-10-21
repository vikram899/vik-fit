/**
 * Dummy Data Service
 * Local in-memory data store for development without backend
 * Replaces Supabase for testing the UI
 */

console.log('🔧 dummyData.js module loading...');

// In-memory storage
let workoutsData = [
  {
    id: '1',
    exercise_name: 'Bench Press',
    sets: 3,
    reps: 10,
    weight: 100,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    exercise_name: 'Squats',
    sets: 4,
    reps: 8,
    weight: 150,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
];

let mealsData = [
  {
    id: '1',
    meal_name: 'Oatmeal with Berries',
    description: 'Topped with blueberries and honey',
    meal_type: 'breakfast',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  {
    id: '2',
    meal_name: 'Grilled Chicken Salad',
    description: 'With olive oil dressing and vegetables',
    meal_type: 'lunch',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
];

let nextWorkoutId = 3;
let nextMealId = 3;

/**
 * Save a workout to dummy data
 * Accepts both old format (exercise_name, sets, reps, weight)
 * and new format (planName, exercises array, duration, etc)
 */
export const saveWorkout = async (workoutData) => {
  console.log('📝 saveWorkout called with:', workoutData);
  console.log('📝 Current workoutsData before save:', workoutsData);

  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const newWorkout = {
          id: String(nextWorkoutId++),
          ...workoutData,
          // Ensure basic fields exist
          exercise_name: workoutData.exercise_name || workoutData.planName || 'Workout',
          sets: workoutData.sets || 0,
          reps: workoutData.reps || 0,
          weight: workoutData.weight || 0,
        };
        console.log('📝 New workout object created:', newWorkout);

        workoutsData.unshift(newWorkout);
        console.log('✅ Workout saved (dummy):', newWorkout);
        console.log('📝 workoutsData after save:', workoutsData);

        resolve({ data: [newWorkout], error: null });
      } catch (err) {
        console.error('❌ Error in saveWorkout:', err);
        resolve({ data: null, error: err });
      }
    }, 500); // Simulate network delay
  });
};

/**
 * Get all workouts from dummy data
 */
export const fetchWorkouts = async (userId, limit = 50) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = workoutsData.slice(0, limit);
      console.log('✅ Workouts fetched (dummy):', data.length, 'items');
      resolve({ data, error: null });
    }, 300);
  });
};

/**
 * Delete a workout from dummy data
 */
export const deleteWorkout = async (workoutId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      workoutsData = workoutsData.filter((w) => w.id !== workoutId);
      console.log('✅ Workout deleted (dummy):', workoutId);
      resolve({ data: null, error: null });
    }, 300);
  });
};

/**
 * Save a meal to dummy data
 */
export const saveMeal = async (mealData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMeal = {
        id: String(nextMealId++),
        ...mealData,
      };
      mealsData.unshift(newMeal);
      console.log('✅ Meal saved (dummy):', newMeal);
      resolve({ data: [newMeal], error: null });
    }, 500); // Simulate network delay
  });
};

/**
 * Get all meals from dummy data
 */
export const fetchMeals = async (userId, limit = 50) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = mealsData.slice(0, limit);
      console.log('✅ Meals fetched (dummy):', data.length, 'items');
      resolve({ data, error: null });
    }, 300);
  });
};

/**
 * Delete a meal from dummy data
 */
export const deleteMeal = async (mealId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mealsData = mealsData.filter((m) => m.id !== mealId);
      console.log('✅ Meal deleted (dummy):', mealId);
      resolve({ data: null, error: null });
    }, 300);
  });
};

/**
 * Get current user (dummy)
 */
export const getCurrentUser = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ user: { id: 'demo-user-123' }, error: null });
    }, 100);
  });
};

/**
 * Reset all data (useful for testing)
 */
export const resetAllData = () => {
  workoutsData = [];
  mealsData = [];
  nextWorkoutId = 1;
  nextMealId = 1;
  console.log('✅ All dummy data reset');
};

/**
 * Get dummy data stats (for debugging)
 * REMOVED - was causing reduce errors
 */
