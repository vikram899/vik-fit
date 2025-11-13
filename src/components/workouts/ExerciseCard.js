import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { STRINGS } from "../../constants/strings";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";
import ExerciseDetailCard from "./ExerciseDetailCard";

const ExerciseCard = ({
  exercise,
  onDelete,
  onEdit,
  showDeleteButton = true,
  showEditButton = false,
  disabled = false,
}) => {
  return (
    <View style={styles.exerciseDetailsCard}>
      <View style={styles.exerciseCardHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.headerRight}>
          {(exercise.restTime || 0) > 0 && (
            <Text style={styles.timeDisplay}>
              {exercise.restTime} {STRINGS.exerciseCard.units.seconds}
            </Text>
          )}
          {showEditButton && (
            <TouchableOpacity
              onPress={onEdit}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={COLORS.info}
              />
            </TouchableOpacity>
          )}
          {showDeleteButton && (
            <TouchableOpacity
              onPress={onDelete}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={COLORS.danger}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.exerciseDetails}>
        <ExerciseDetailCard
          label={STRINGS.exerciseCard.detailLabels.sets}
          value={exercise.sets}
        />
        <ExerciseDetailCard
          label={STRINGS.exerciseCard.detailLabels.reps}
          value={exercise.reps}
        />
        <ExerciseDetailCard
          label={STRINGS.exerciseCard.detailLabels.weight}
          value={exercise.weight || "0"}
          unit={STRINGS.exerciseCard.units.kilograms}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseDetailsCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    marginBottom: SPACING.medium,
  },
  exerciseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  exerciseName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: SPACING.element,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.medium,
  },
  timeDisplay: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
    backgroundColor: COLORS.secondaryBackground,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadiusSmall,
  },
});

export default ExerciseCard;
