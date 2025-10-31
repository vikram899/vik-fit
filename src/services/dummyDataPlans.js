/**
 * Dummy Data - Workout Plans
 * Manages workout plans with exercises
 */

// In-memory storage for plans
let workoutPlans = [
    {
      id: '1',
      name: 'Chest & Triceps',
      description: 'Upper body pushing exercises',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      exercises: [
        {
          id: 'ex1',
          name: 'Bench Press',
          sets: 4,
          reps: 8,
          weight: 100,
        },
        {
          id: 'ex2',
          name: 'Incline Dumbbell Press',
          sets: 3,
          reps: 10,
          weight: 35,
        },
        {
          id: 'ex3',
          name: 'Tricep Dips',
          sets: 3,
          reps: 12,
          weight: 0,
        },
      ],
    },
    {
      id: '2',
      name: 'Back & Biceps',
      description: 'Upper body pulling exercises',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      exercises: [
        {
          id: 'ex4',
          name: 'Barbell Rows',
          sets: 4,
          reps: 6,
          weight: 120,
        },
        {
          id: 'ex5',
          name: 'Pull-ups',
          sets: 3,
          reps: 10,
          weight: 0,
        },
        {
          id: 'ex6',
          name: 'Barbell Curls',
          sets: 3,
          reps: 8,
          weight: 60,
        },
      ],
    },
    {
      id: '3',
      name: 'Legs',
      description: 'Lower body exercises',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      exercises: [
        {
          id: 'ex7',
          name: 'Squats',
          sets: 4,
          reps: 6,
          weight: 150,
        },
        {
          id: 'ex8',
          name: 'Romanian Deadlifts',
          sets: 3,
          reps: 8,
          weight: 140,
        },
        {
          id: 'ex9',
          name: 'Leg Press',
          sets: 3,
          reps: 10,
          weight: 200,
        },
      ],
    },
];

let nextPlanId = 4;
let nextExerciseId = 10;

/**
 * Get all workout plans
 */
export const getAllWorkouts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: workoutPlans, error: null });
    }, 300);
  });
};

/**
 * Get a specific plan by ID
 */
export const getWorkoutById = async (workoutId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plan = workoutPlans.find((p) => p.id === workoutId);
      if (plan) {
        resolve({ data: plan, error: null });
      } else {
        resolve({ data: null, error: 'Plan not found' });
      }
    }, 300);
  });
};

/**
 * Create a new workout plan
 */
export const createWorkout = async (planData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPlan = {
        id: String(nextPlanId++),
        ...planData,
        createdAt: new Date().toISOString(),
        exercises: [],
      };
      workoutPlans.unshift(newPlan);
      resolve({ data: newPlan, error: null });
    }, 500);
  });
};

/**
 * Update an existing plan
 */
export const updateWorkout = async (workoutId, planData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const planIndex = workoutPlans.findIndex((p) => p.id === workoutId);
      if (planIndex !== -1) {
        workoutPlans[planIndex] = {
          ...workoutPlans[planIndex],
          ...planData,
        };
        resolve({ data: workoutPlans[planIndex], error: null });
      } else {
        resolve({ data: null, error: 'Plan not found' });
      }
    }, 300);
  });
};

/**
 * Delete a plan
 */
export const deleteWorkout = async (workoutId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      workoutPlans = workoutPlans.filter((p) => p.id !== workoutId);
      resolve({ data: null, error: null });
    }, 300);
  });
};

/**
 * Add exercise to plan
 */
export const addExerciseToWorkout = async (workoutId, exerciseData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plan = workoutPlans.find((p) => p.id === workoutId);
      if (plan) {
        const newExercise = {
          id: String(nextExerciseId++),
          ...exerciseData,
        };
        plan.exercises.push(newExercise);
        resolve({ data: newExercise, error: null });
      } else {
        resolve({ data: null, error: 'Plan not found' });
      }
    }, 300);
  });
};

/**
 * Remove exercise from plan
 */
export const removeExerciseFromWorkout = async (workoutId, exerciseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plan = workoutPlans.find((p) => p.id === workoutId);
      if (plan) {
        plan.exercises = plan.exercises.filter((e) => e.id !== exerciseId);
        resolve({ data: null, error: null });
      } else {
        resolve({ data: null, error: 'Plan not found' });
      }
    }, 300);
  });
};

/**
 * Update exercise in plan
 */
export const updateExerciseInWorkout = async (workoutId, exerciseId, exerciseData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plan = workoutPlans.find((p) => p.id === workoutId);
      if (plan) {
        const exerciseIndex = plan.exercises.findIndex((e) => e.id === exerciseId);
        if (exerciseIndex !== -1) {
          plan.exercises[exerciseIndex] = {
            ...plan.exercises[exerciseIndex],
            ...exerciseData,
          };
          resolve({ data: plan.exercises[exerciseIndex], error: null });
        } else {
          resolve({ data: null, error: 'Exercise not found' });
        }
      } else {
        resolve({ data: null, error: 'Plan not found' });
      }
    }, 300);
  });
};

/**
 * Reset all plans (for testing)
 */
export const resetAllPlans = () => {
  workoutPlans = [];
  nextPlanId = 1;
  nextExerciseId = 1;
};

/**
 * Get plans stats
 * REMOVED - was causing reduce errors
 */
