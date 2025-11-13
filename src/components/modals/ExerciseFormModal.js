import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { BottomSheet, FormInput, Button } from "../../shared/components/ui";
import BodyPartsPicker from "../workouts/BodyPartsPicker";
import { COLORS, SPACING } from "../../shared/constants";

/**
 * ExerciseFormModal
 * Reusable bottom sheet modal for adding/editing exercises
 * Uses shared design system and modular components
 *
 * Props:
 * - visible: boolean - whether modal is visible
 * - title: string - modal title (e.g., "Add Exercise" or "Edit Exercise")
 * - exercise: object - exercise data { name, sets, reps, weight, restTime }
 * - onExerciseChange: function - callback when exercise fields change
 * - onSubmit: function - callback when form is submitted
 * - onCancel: function - callback to close modal
 * - submitButtonText: string - text for submit button (default: "Add")
 * - submitButtonIcon: string - icon name for submit button (default: "plus")
 */
export default function ExerciseFormModal({
  visible,
  title = "Add Exercise",
  exercise,
  onExerciseChange,
  onSubmit,
  onCancel,
  submitButtonText = "Add",
  submitButtonIcon = "plus",
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <BottomSheet
        visible={visible}
        title={title}
        onClose={onCancel}
        heightPercent={0.85}
        hasFixedFooter={true}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Exercise Name */}
          <FormInput
            label="Exercise Name"
            placeholder="e.g., Bench Press"
            value={exercise.name}
            onChangeText={(value) =>
              onExerciseChange({ ...exercise, name: value })
            }
          />

          {/* Sets, Reps, Weight, Rest Time in a row */}
          <View style={styles.rowContainer}>
            <View style={styles.inputWrapper}>
              <FormInput
                label="Sets"
                placeholder="3"
                value={exercise.sets}
                onChangeText={(value) =>
                  onExerciseChange({ ...exercise, sets: value })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputWrapper}>
              <FormInput
                label="Reps"
                placeholder="10"
                value={exercise.reps}
                onChangeText={(value) =>
                  onExerciseChange({ ...exercise, reps: value })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputWrapper}>
              <FormInput
                label="Weight"
                placeholder="0"
                value={exercise.weight}
                onChangeText={(value) =>
                  onExerciseChange({ ...exercise, weight: value })
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <FormInput
                label="Rest Time"
                placeholder="0"
                value={exercise.restTime}
                onChangeText={(value) =>
                  onExerciseChange({ ...exercise, restTime: value })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Target Body Parts */}
          <BodyPartsPicker
            selectedBodyParts={exercise.targetBodyParts || []}
            onSelectionChange={(bodyParts) =>
              onExerciseChange({ ...exercise, targetBodyParts: bodyParts })
            }
          />
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              label={submitButtonText}
              icon={submitButtonIcon}
              iconPosition="left"
              variant="primary"
              size="medium"
              onPress={onSubmit}
              fullWidth
            />
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              label="Cancel"
              variant="cancel"
              size="medium"
              onPress={onCancel}
              fullWidth
            />
          </View>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.element,
    paddingBottom: SPACING.container,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.small,
  },
  inputWrapper: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: SPACING.element,
    paddingBottom: SPACING.container,
    backgroundColor: COLORS.tertiaryBackground,
    gap: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondaryBackground,
  },
  buttonWrapper: {
    flex: 1,
  },
});
