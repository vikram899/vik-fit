/**
 * SHARED HOOKS BARREL EXPORT
 *
 * Centralized export of all custom hooks used throughout the app.
 * These hooks manage data loading, state management, and side effects.
 *
 * Imports:
 * - import { useMealData, useWorkoutData, useWeightData } from '@shared/hooks'
 */

// Data loading hooks
export { useMealData } from './useMealData';
export { useMealsData } from './useMealsData';
export { useWorkoutData } from './useWorkoutData';
export { useWeightData } from './useWeightData';

// Helper functions (used by hooks)
export {
  combineScheduledAndAdHocWorkouts,
  getRecentWeightData,
  getTargetWeightFromData,
} from './workoutHelpers';
