/**
 * BODY PARTS CONSTANTS
 *
 * Predefined list of body parts that can be targeted by exercises.
 * Users can also add custom body parts when creating exercises.
 */

export const BODY_PARTS = {
  // Upper Body
  CHEST: "Chest",
  BACK: "Back",
  SHOULDERS: "Shoulders",
  BICEPS: "Biceps",
  TRICEPS: "Triceps",
  FOREARMS: "Forearms",

  // Core
  ABS: "Abs",
  OBLIQUES: "Obliques",
  CORE: "Core",

  // Lower Body
  QUADRICEPS: "Quadriceps",
  HAMSTRINGS: "Hamstrings",
  GLUTES: "Glutes",
  CALVES: "Calves",
  LEGS: "Legs",

  // Full Body / Other
  FULL_BODY: "Full Body",
  CARDIO: "Cardio",
  FLEXIBILITY: "Flexibility",
};

/**
 * Ordered list for displaying in UI (dropdown, picker, etc.)
 * Shows most common body parts first
 */
export const BODY_PARTS_LIST = [
  BODY_PARTS.CHEST,
  BODY_PARTS.BACK,
  BODY_PARTS.SHOULDERS,
  BODY_PARTS.BICEPS,
  BODY_PARTS.TRICEPS,
  BODY_PARTS.FOREARMS,
  BODY_PARTS.ABS,
  BODY_PARTS.OBLIQUES,
  BODY_PARTS.CORE,
  BODY_PARTS.QUADRICEPS,
  BODY_PARTS.HAMSTRINGS,
  BODY_PARTS.GLUTES,
  BODY_PARTS.CALVES,
  BODY_PARTS.LEGS,
  BODY_PARTS.FULL_BODY,
  BODY_PARTS.CARDIO,
  BODY_PARTS.FLEXIBILITY,
];
