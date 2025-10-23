import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import WorkoutCard from "./WorkoutCard";
import { appStyles } from "../../styles/app.styles";

export default function WorkoutsSection({
  workouts,
  workoutLogs,
  onLogPress,
  onWorkoutPress,
}) {
  if (!workouts || workouts.length === 0) {
    return null;
  }

  return (
    <View style={appStyles.workoutsSection}>
      <View style={styles.header}>
        <Text style={appStyles.workoutsSectionTitle}>Today's Workouts</Text>
        <TouchableOpacity
          style={styles.logButton}
          onPress={onLogPress}
        >
          <Text style={styles.logButtonText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={appStyles.workoutsScrollView}
        contentContainerStyle={appStyles.workoutsScrollContent}
      >
        {workouts.map((workout) => {
          const isCompleted = workoutLogs?.[workout.id]?.status === "completed";

          return (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              isCompleted={isCompleted}
              onPress={() => onWorkoutPress(workout.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = {
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
    lineHeight: 12,
  },
};
