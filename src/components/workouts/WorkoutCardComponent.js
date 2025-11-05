import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * WorkoutCard - Reusable workout card component
 * Used in both AllWorkoutsScreen and LogWorkoutScreen
 */
const WorkoutCard = ({
  workout,
  exerciseCount = 0,
  scheduledDays = [],
  onViewExercises,
  onMenuPress,
  onStart = null,
  onViewSummary = null,
  showStartButton = false,
  isCompleted = false,
  showDayTags = true,
}) => {
  const getScheduledDaysArray = () => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (scheduledDays.length === 0) {
      return null;
    }
    return scheduledDays.map((d) => dayNames[d]);
  };

  return (
    <View style={styles.workoutCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          {showDayTags && (
            <View style={styles.daysContainer}>
              {getScheduledDaysArray() ? (
                getScheduledDaysArray().map((day, index) => (
                  <View key={index} style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>{day}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.noDaysBadge}>
                  <MaterialCommunityIcons
                    name="calendar-remove"
                    size={14}
                    color={COLORS.textTertiary}
                    style={{ marginRight: SPACING.xs }}
                  />
                  <Text style={styles.noDaysText}>No days assigned</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => onMenuPress(workout)}
          style={styles.kebabButton}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={COLORS.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Exercise Count - Clickable */}
      <TouchableOpacity
        style={styles.exerciseCountContainer}
        onPress={() => onViewExercises(workout)}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseIconBox}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={18}
            color={COLORS.white}
          />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseCount}>{exerciseCount}</Text>
          <Text style={styles.exerciseLabel}>
            {exerciseCount === 1 ? "Exercise" : "Exercises"}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.workoutBackground}
        />
      </TouchableOpacity>

      {/* Start/Summary Button - For Today's Workouts */}
      {showStartButton && (
        <>
          {isCompleted && onViewSummary ? (
            <TouchableOpacity
              style={[styles.startButton, styles.summaryButton]}
              onPress={() => onViewSummary(workout)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={COLORS.white}
                style={{ marginRight: SPACING.xs }}
              />
              <Text style={styles.startButtonText}>View Summary</Text>
            </TouchableOpacity>
          ) : onStart ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStart(workout)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="play"
                size={18}
                color={COLORS.white}
                style={{ marginRight: SPACING.xs }}
              />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  workoutCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusXL,
    padding: SPACING.element,
    marginHorizontal: SPACING.element,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.medium,
  },
  cardInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginTop: SPACING.small,
  },
  dayBadge: {
    backgroundColor: COLORS.workoutBackground,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    borderRadius: SPACING.borderRadiusRound,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dayBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  noDaysBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tertiaryBackground,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    borderRadius: SPACING.borderRadiusRound,
    borderWidth: 1.5,
    borderColor: COLORS.tertiaryBackground,
    borderStyle: "dashed",
  },
  noDaysText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
  },
  kebabButton: {
    padding: SPACING.small,
    marginRight: -SPACING.small,
  },
  exerciseCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.medium,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.tertiaryBackground,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.element,
    borderRadius: SPACING.borderRadiusLarge,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.workoutBackground,
    justifyContent: "space-between",
  },
  exerciseIconBox: {
    backgroundColor: COLORS.workoutBackground,
    width: 44,
    height: 44,
    borderRadius: SPACING.borderRadiusLarge,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: "center",
  },
  exerciseCount: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  exerciseLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.element,
    borderRadius: SPACING.borderRadiusLarge,
    marginTop: SPACING.medium,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  summaryButton: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
});

export default WorkoutCard;
