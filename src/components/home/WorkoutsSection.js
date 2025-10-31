import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WorkoutCard from "./WorkoutCard";
import { appStyles } from "../../styles/app.styles";

export default function WorkoutsSection({
  workouts,
  workoutLogs,
  onLogPress,
  onWorkoutPress,
}) {
  const hasWorkouts = workouts && workouts.length > 0;

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

      {hasWorkouts ? (
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
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="calendar-blank"
            size={48}
            color="#FF9800"
          />
          <Text style={styles.emptyStateText}>No Workouts Scheduled for Today</Text>
        </View>
      )}
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
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
    fontWeight: "500",
  },
};
