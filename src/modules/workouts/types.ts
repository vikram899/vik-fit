import { ExerciseType } from '@shared/types/common';

export interface ActiveSet {
  setNumber: number;
  reps: string;      // used by weight_reps + reps_only modes
  weight: string;    // used by weight_reps mode
  duration: string;  // seconds, used by duration mode
  completed: boolean;
}

export interface PreviousSet {
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
}

export interface ActiveExercise {
  exerciseLogId: number;
  exerciseTemplateId: number;
  name: string;
  type: ExerciseType;
  orderIndex: number;
  sets: ActiveSet[];
  previousSets: PreviousSet[];
  defaultRestTimeSeconds: number;
}

export interface ActiveWorkoutState {
  workoutLogId: number;
  workoutTemplateId: number | null;
  name: string;
  startedAt: string;
  exercises: ActiveExercise[];
}
