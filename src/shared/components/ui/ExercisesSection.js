import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../constants";
import { ExerciseCard } from "../../../components/workouts";

/**
 * ExercisesSection
 * Reusable component for displaying and managing exercises
 *
 * Props:
 * - exercises: Array of exercise objects
 * - onAddExercise: Callback when add button is pressed
 * - onDeleteExercise: Callback with exercise id when delete is pressed
 * - loading: Boolean to disable interactions
 * - emptyMessage: Custom empty state message (optional)
 */
const ExercisesSection = ({
  exercises = [],
  onAddExercise,
  onDeleteExercise,
  loading = false,
  emptyMessage = "No exercises yet. Tap + to add one.",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercises</Text>
        <TouchableOpacity onPress={onAddExercise} disabled={loading}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={24}
            color={loading ? COLORS.mediumGray : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {exercises.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : (
        exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onDelete={() => onDeleteExercise(exercise.id)}
            showDeleteButton={true}
            disabled={loading}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.container,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.element,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: SPACING.container,
  },
});

export default ExercisesSection;
