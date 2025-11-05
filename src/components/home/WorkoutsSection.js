import React from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WorkoutCard from "./WorkoutCard";
import { appStyles } from "../../styles/app.styles";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";
import { LogButton } from "../../shared/components/ui";

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
        <LogButton
          onPress={onLogPress}
          size="small"
          variant="primary"
        />
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
            color={COLORS.warning}
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
    marginBottom: SPACING.small,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.container,
  },
  emptyStateText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    marginTop: SPACING.small,
    fontWeight: "500",
  },
};
