import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SummaryCard, WorkoutsSection } from "../components/home";
import { Card, LogButton } from "../shared/components";
import WeightProgressGraph from "../components/WeightProgressGraph";
import StepsCard from "../components/health/StepsCard";
import { useMealData, useWorkoutData, useWeightData } from "../shared/hooks";
import { COLORS } from "../shared/constants";

/**
 * HomeScreen
 * Shows user's daily summary (meals/macros) and today's scheduled workouts
 *
 * REFACTORED: Uses custom hooks to manage data loading
 * - useMealData: Loads daily totals and macro goals
 * - useWorkoutData: Loads today's workouts (scheduled + ad-hoc)
 * - useWeightData: Loads weight tracking data
 *
 * Previous: 287 lines with 6 useState + 2 useEffect
 * Current: ~98 lines with 3 hooks
 * Benefit: Clean separation of data loading from presentation
 */
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Load all required data using custom hooks
  const { dailyTotals, macroGoals } = useMealData();
  const { workouts: todayWorkouts, workoutLogs: todayWorkoutLogs } =
    useWorkoutData();
  const { weightData, targetWeight } = useWeightData();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.mainBackground }}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Today's Summary Card */}
      <SummaryCard
        dailyTotals={dailyTotals}
        macroGoals={macroGoals}
        onLogPress={() => navigation.navigate("LogMeals")}
        onEditMacrosPress={() => navigation.navigate("MacroGoals")}
      />

      {/* Today's Workouts Section */}
      <WorkoutsSection
        workouts={todayWorkouts}
        workoutLogs={todayWorkoutLogs}
        onLogPress={() => navigation.navigate("LogWorkout")}
        onWorkoutPress={() => navigation.navigate("LogWorkout")}
      />

      {/* Daily Steps Card - Synced from Apple Health */}
      <StepsCard />

      {/* Weight Progress Card - Using reusable Card component with LogButton */}
      <Card
        title="Weight Progress"
        actionComponent={
          <LogButton
            onPress={() => navigation.navigate("WeightTracking")}
            size="small"
          />
        }
      >
        <WeightProgressGraph data={weightData} targetWeight={targetWeight} />
      </Card>
    </ScrollView>
  );
}
