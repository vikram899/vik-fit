import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SummaryCard, WorkoutsSection } from "../components/home";
import { appStyles } from "../styles/app.styles";
import {
  getDailyTotals,
  getMacroGoals,
  getPlansForDay,
  getTodayWorkoutLogForPlan,
} from "../services/database";

/**
 * HomeScreen
 * Shows user's daily summary (meals/macros) and today's scheduled workouts
 */
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().split("T")[0];

  const [dailyTotals, setDailyTotals] = React.useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [macroGoals, setMacroGoalsState] = React.useState({
    calorieGoal: 2500,
    proteinGoal: 120,
    carbsGoal: 300,
    fatsGoal: 80,
  });
  const [todayWorkouts, setTodayWorkouts] = React.useState([]);
  const [todayWorkoutLogs, setTodayWorkoutLogs] = React.useState({});

  // Load today's meal and workout data
  React.useEffect(() => {
    const loadTodayData = async () => {
      try {
        const totals = await getDailyTotals(today);
        setDailyTotals(totals);

        const goals = await getMacroGoals(today);
        setMacroGoalsState(goals);

        // Load today's workouts
        const todayDayOfWeek = new Date().getDay();
        const workouts = await getPlansForDay(todayDayOfWeek);
        setTodayWorkouts(workouts || []);

        // Load today's workout logs to check completion status
        const workoutLogsMap = {};
        if (workouts) {
          for (const workout of workouts) {
            const log = await getTodayWorkoutLogForPlan(workout.id);
            if (log) {
              workoutLogsMap[workout.id] = log;
            }
          }
        }
        setTodayWorkoutLogs(workoutLogsMap);
      } catch (error) {
        console.error("Error loading today's data:", error);
      }
    };

    loadTodayData();
  }, []);

  // Reload data when screen is focused
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const totals = await getDailyTotals(today);
        setDailyTotals(totals);

        const goals = await getMacroGoals(today);
        setMacroGoalsState(goals);

        // Reload today's workouts
        const todayDayOfWeek = new Date().getDay();
        const workouts = await getPlansForDay(todayDayOfWeek);
        setTodayWorkouts(workouts || []);

        // Reload today's workout logs to check completion status
        const workoutLogsMap = {};
        if (workouts) {
          for (const workout of workouts) {
            const log = await getTodayWorkoutLogForPlan(workout.id);
            if (log) {
              workoutLogsMap[workout.id] = log;
            }
          }
        }
        setTodayWorkoutLogs(workoutLogsMap);
      } catch (error) {
        console.error("Error loading today's data:", error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View
      style={[
        appStyles.screenContainer,
        { justifyContent: "flex-start", paddingTop: 0 },
      ]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Summary Card */}
        <View>
          <SummaryCard
            dailyTotals={dailyTotals}
            macroGoals={macroGoals}
            onLogPress={() => navigation.navigate("LogMeals")}
          />
        </View>

        {/* Today's Workouts Section */}
        <WorkoutsSection
          workouts={todayWorkouts}
          workoutLogs={todayWorkoutLogs}
          onLogPress={() => navigation.navigate("LogWorkout")}
          onWorkoutPress={() => navigation.navigate("LogWorkout")}
        />
      </ScrollView>
    </View>
  );
}
