import React from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SummaryCard, WorkoutsSection } from "../components/home";
import { appStyles } from "../styles/app.styles";
import { COLORS } from "../styles";
import WeightProgressGraph from "../components/WeightProgressGraph";
import {
  getDailyTotals,
  getMacroGoals,
  getPlansForDay,
  getTodayWorkoutLogForPlan,
  getAllWeightEntries,
  getLatestWeightEntry,
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
  const [weightData, setWeightData] = React.useState([]);
  const [targetWeight, setTargetWeight] = React.useState(70);

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

        // Load weight data (last 60 days for 2-month view)
        const allWeightEntries = await getAllWeightEntries();
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const startDate = sixtyDaysAgo.toISOString().split("T")[0];
        const recentWeightData = allWeightEntries.filter(
          (entry) => entry.weightDate >= startDate
        );
        console.log('Initial useEffect - setting weight data:', recentWeightData.length, 'entries');
        setWeightData(recentWeightData);

        // Set target weight from latest entry if available
        if (recentWeightData.length > 0) {
          setTargetWeight(recentWeightData[0].targetWeight);
        }
      } catch (error) {
        console.error("Error loading today's data:", error);
      }
    };

    loadTodayData();
  }, []);

  // Reload data when screen is focused (ensures fresh macro data)
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const loadTodayData = async () => {
        try {
          const todayDate = new Date().toISOString().split("T")[0];

          const totals = await getDailyTotals(todayDate);
          if (isMounted) {
            setDailyTotals(totals);
          }

          // Always reload macro goals to ensure they're up-to-date
          const goals = await getMacroGoals(todayDate);
          if (isMounted) {
            setMacroGoalsState(goals);
          }

          // Reload today's workouts
          const todayDayOfWeek = new Date().getDay();
          const workouts = await getPlansForDay(todayDayOfWeek);
          if (isMounted) setTodayWorkouts(workouts || []);

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
          if (isMounted) setTodayWorkoutLogs(workoutLogsMap);

          // Reload weight data (last 60 days for 2-month view)
          const allWeightEntries = await getAllWeightEntries();
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          const startDate = sixtyDaysAgo.toISOString().split("T")[0];
          const recentWeightData = allWeightEntries.filter(
            (entry) => entry.weightDate >= startDate
          );
          if (isMounted) {
            console.log('useFocusEffect - setting weight data:', recentWeightData.length, 'entries');
            setWeightData(recentWeightData);
            // Set target weight from latest entry if available
            if (recentWeightData.length > 0) {
              setTargetWeight(recentWeightData[0].targetWeight);
            }
          }
        } catch (error) {
          console.error("Error loading today's data:", error);
        }
      };

      loadTodayData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

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
            onEditMacrosPress={() => navigation.navigate("MacroGoals")}
          />
        </View>

        {/* Today's Workouts Section */}
        <WorkoutsSection
          workouts={todayWorkouts}
          workoutLogs={todayWorkoutLogs}
          onLogPress={() => navigation.navigate("LogWorkout")}
          onWorkoutPress={() => navigation.navigate("LogWorkout")}
        />

        {/* Weight Progress Card */}
        <View style={styles.weightCard}>
          <View style={styles.weightCardHeader}>
            <Text style={styles.weightCardTitle}>Weight Progress</Text>
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => navigation.navigate("WeightTracking")}
            >
              <Text style={styles.logButtonText}>+ Log</Text>
            </TouchableOpacity>
          </View>
          <WeightProgressGraph data={weightData} targetWeight={targetWeight} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  weightCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  weightCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weightCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  logButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },
  logButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
});
