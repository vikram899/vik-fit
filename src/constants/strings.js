/**
 * CENTRALIZED STRINGS/LOCALIZATION
 * All user-facing text strings are defined here
 * This makes it easy to:
 * 1. Edit all strings from a single source
 * 2. Implement multi-language support in the future
 * 3. Maintain consistency across the app
 */

export const STRINGS = {
  // ============================================================================
  // ADD MEAL MODAL
  // ============================================================================
  addMealModal: {
    title: "Add New Meal",
    labels: {
      mealName: "Meal Name *",
      calories: "Calories *",
      protein: "Protein (g) *",
      carbs: "Carbs (g)",
      fats: "Fats (g)",
    },
    placeholders: {
      mealName: "e.g., Chicken Curry",
      calories: "e.g., 350",
      protein: "e.g., 35",
      carbs: "e.g., 25",
      fats: "e.g., 12",
    },
    buttons: {
      add: "Add",
      cancel: "Cancel",
    },
    alerts: {
      errorMealName: {
        title: "Error",
        message: "Please enter meal name",
      },
      errorCalories: {
        title: "Error",
        message: "Calories is mandatory",
      },
      errorProtein: {
        title: "Error",
        message: "Protein is mandatory",
      },
      success: {
        title: "Success",
        message: (mealName) => `${mealName} added successfully!`,
      },
      error: {
        title: "Error",
        message: "Failed to add meal",
      },
    },
  },

  // ============================================================================
  // EDIT MEAL MODAL
  // ============================================================================
  editMealModal: {
    title: "Edit Meal",
    labels: {
      calories: "Calories",
      protein: "Protein (g)",
      carbs: "Carbs (g)",
      fats: "Fats (g)",
    },
    buttons: {
      save: "Save",
      cancel: "Cancel",
    },
    alerts: {
      success: {
        title: "Success",
        message: "Meal updated!",
      },
      error: {
        title: "Error",
        message: "Failed to update meal",
      },
    },
  },

  // ============================================================================
  // EXISTING MEALS MODAL
  // ============================================================================
  existingMealsModal: {
    title: "Add Existing Meal",
    emptyState: "No existing meals found",
    labels: {
      mealName: "Meal Name",
      calories: "Calories",
      protein: "Protein (g)",
      carbs: "Carbs (g)",
      fats: "Fats (g)",
    },
    buttons: {
      save: "Save",
      cancel: "Cancel",
      close: "Close",
    },
    alerts: {
      addSuccess: {
        title: "Success",
        message: (mealName) => `${mealName} added to today's meals!`,
      },
      addError: {
        title: "Error",
        message: "Failed to add meal",
      },
      updateSuccess: {
        title: "Success",
        message: "Meal updated!",
      },
      updateError: {
        title: "Error",
        message: "Failed to update meal",
      },
      deleteConfirmDialog: {
        title: "Delete Meal",
        message: "Are you sure you want to delete this meal?",
      },
      deleteSuccess: {
        title: "Success",
        message: "Meal deleted!",
      },
      deleteError: {
        title: "Error",
        message: "Failed to delete meal",
      },
      deleteCancel: "Cancel",
      deleteConfirmButton: "Delete",
    },
  },

  // ============================================================================
  // TODAYS MEALS LIST
  // ============================================================================
  todaysMealsList: {
    title: "Today's Meals",
    emptyState: "No meals logged yet",
  },

  // ============================================================================
  // MEAL CARD
  // ============================================================================
  mealCard: {
    defaultCategory: "General",
    nutritionLabels: {
      calories: "Calories",
      protein: "Protein",
      carbs: "Carbs",
      fats: "Fats",
    },
  },

  // ============================================================================
  // EXERCISE CARD
  // ============================================================================
  exerciseCard: {
    detailLabels: {
      sets: "Sets",
      reps: "Reps",
      weight: "Weight",
      restTime: "Rest Time",
    },
    units: {
      seconds: "s",
      kilograms: "kg",
    },
  },

  // ============================================================================
  // MEAL MACRO CARDS
  // ============================================================================
  mealMacroCards: {
    labels: {
      calories: "Calories",
      protein: "Protein",
      carbs: "Carbs",
      fats: "Fats",
    },
    units: {
      calories: "",
      protein: "g",
      carbs: "g",
      fats: "g",
    },
  },

  // ============================================================================
  // PROGRESS BADGES
  // ============================================================================
  progressBadges: {
    title: "Daily Progress",
    emptyState: "Set macro goals to see progress",
    labels: {
      calories: "Calories",
      protein: "Protein",
      carbs: "Carbs",
      fats: "Fats",
    },
    units: {
      protein: "g",
      carbs: "g",
      fats: "g",
    },
  },

  // ============================================================================
  // LOG MEALS SCREEN
  // =================The ==========================================================
  logMealsScreen: {
    buttons: {
      addNewMeal: "Add New",
      addExistingMeal: "Add Existing",
    },
    alerts: {
      errorLoadingMeals: {
        title: "Error",
        message: "Failed to load existing meals",
      },
      deleteConfirmDialog: {
        title: "Delete Meal",
        message: "Are you sure you want to delete this meal from today?",
      },
      deleteError: {
        title: "Error",
        message: "Failed to delete meal",
      },
      mealOptions: (mealName) => ({
        title: "Meal Options",
        message: mealName,
      }),
      deleteCancel: "Cancel",
      deleteConfirmButton: "Delete",
      edit: "Edit",
    },
  },

  // ============================================================================
  // WORKOUTS SCREEN
  // ============================================================================
  workoutsScreen: {
    title: "Log Workout",
    countPrefix: "Workouts: ",
    buttons: {
      logWorkout: "Log Workout",
    },
    accessibilityLabels: {
      logWorkout: "Log a new workout",
    },
    alerts: {
      success: (count) => ({
        title: "Success",
        message: `Workout logged! Count: ${count + 1}`,
      }),
    },
  },

  // ============================================================================
  // PROFILE SCREEN
  // ============================================================================
  profileScreen: {
    title: "Coming Soon",
    subtitle:
      "Profile features including user stats, settings, and data export will be available soon!",
    features: {
      stats: {
        title: "Stats",
        text: "View your fitness journey",
      },
      settings: {
        title: "Settings",
        text: "Customize your experience",
      },
      export: {
        title: "Export",
        text: "Download your fitness data",
      },
    },
    version: {
      appVersion: "1.0.0",
      tagline: "Built for simplicity and speed",
    },
  },

  // ============================================================================
  // UNITS & COMMON
  // ============================================================================
  units: {
    grams: "g",
    kilograms: "kg",
    seconds: "s",
    calories: "cal",
  },

  // ============================================================================
  // WORKOUT PLANS (Dummy Data)
  // ============================================================================
  workoutPlans: {
    chestTriceps: {
      name: "Chest & Triceps",
      description: "Upper body pushing exercises",
      exercises: {
        benchPress: "Bench Press",
        inclineDumbbellPress: "Incline Dumbbell Press",
        tricepDips: "Tricep Dips",
      },
    },
    backBiceps: {
      name: "Back & Biceps",
      description: "Upper body pulling exercises",
      exercises: {
        barbellRows: "Barbell Rows",
        pullUps: "Pull-ups",
        barbellCurls: "Barbell Curls",
      },
    },
    legs: {
      name: "Legs",
      description: "Lower body exercises",
      exercises: {
        squats: "Squats",
        romanianDeadlifts: "Romanian Deadlifts",
        legPress: "Leg Press",
      },
    },
  },

  // ============================================================================
  // DUMMY MEALS DATA
  // ============================================================================
  dummyMeals: {
    oatmeal: {
      name: "Oatmeal with Berries",
      description: "Topped with blueberries and honey",
      type: "breakfast",
    },
    chickenSalad: {
      name: "Grilled Chicken Salad",
      description: "With olive oil dressing and vegetables",
      type: "lunch",
    },
  },

  // ============================================================================
  // DUMMY WORKOUTS DATA
  // ============================================================================
  dummyWorkouts: {
    benchPress: "Bench Press",
    squats: "Squats",
  },
};
