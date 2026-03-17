import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutsScreen from '@modules/workouts/screens/WorkoutsScreen';
import WorkoutDetailScreen from '@modules/workouts/screens/WorkoutDetailScreen';
import CreateWorkoutScreen from '@modules/workouts/screens/CreateWorkoutScreen';
import ExecuteWorkoutScreen from '@modules/workouts/screens/ExecuteWorkoutScreen';
import WorkoutSummaryScreen from '@modules/workouts/screens/WorkoutSummaryScreen';

export type WorkoutsStackParamList = {
  Workouts: undefined;
  WorkoutDetail: { workoutTemplateId: number };
  CreateWorkout: undefined;
  ExecuteWorkout: { workoutTemplateId: number };
  WorkoutSummary: { workoutLogId: number };
};

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

export default function WorkoutsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workouts" component={WorkoutsScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} />
      <Stack.Screen name="ExecuteWorkout" component={ExecuteWorkoutScreen} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
    </Stack.Navigator>
  );
}
