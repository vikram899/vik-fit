import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../../styles/app.styles";
import { COLORS } from "../../shared/constants";

/**
 * ExerciseFormModal
 * Reusable modal for adding/editing exercises
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={appStyles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={appStyles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={appStyles.modalContent}>
                <Text style={appStyles.modalTitle}>{title}</Text>

                {/* Exercise Name */}
                <View style={appStyles.formGroup}>
                  <Text style={appStyles.label}>Exercise Name</Text>
                  <TextInput
                    style={appStyles.input}
                    placeholder="e.g., Bench Press"
                    placeholderTextColor={COLORS.textTertiary}
                    value={exercise.name}
                    onChangeText={(value) =>
                      onExerciseChange({ ...exercise, name: value })
                    }
                  />
                </View>

                {/* Sets, Reps, Weight, Rest Time */}
                <View style={appStyles.rowGroup}>
                  <View style={[appStyles.formGroup, { flex: 1 }]}>
                    <Text style={appStyles.label}>Sets</Text>
                    <TextInput
                      style={appStyles.input}
                      placeholder="3"
                      placeholderTextColor={COLORS.textTertiary}
                      value={exercise.sets}
                      onChangeText={(value) =>
                        onExerciseChange({ ...exercise, sets: value })
                      }
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[appStyles.formGroup, { flex: 1 }]}>
                    <Text style={appStyles.label}>Reps</Text>
                    <TextInput
                      style={appStyles.input}
                      placeholder="10"
                      placeholderTextColor={COLORS.textTertiary}
                      value={exercise.reps}
                      onChangeText={(value) =>
                        onExerciseChange({ ...exercise, reps: value })
                      }
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[appStyles.formGroup, { flex: 1 }]}>
                    <Text style={appStyles.label}>Weight</Text>
                    <TextInput
                      style={appStyles.input}
                      placeholder="0"
                      placeholderTextColor={COLORS.textTertiary}
                      value={exercise.weight}
                      onChangeText={(value) =>
                        onExerciseChange({ ...exercise, weight: value })
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={[appStyles.formGroup, { flex: 1 }]}>
                    <Text style={appStyles.label}>Rest Time</Text>
                    <TextInput
                      style={appStyles.input}
                      placeholder="0"
                      placeholderTextColor={COLORS.textTertiary}
                      value={exercise.restTime}
                      onChangeText={(value) =>
                        onExerciseChange({ ...exercise, restTime: value })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Buttons */}
                <View style={appStyles.modalButtonGroup}>
                  <TouchableOpacity
                    style={[appStyles.button, appStyles.buttonHalf]}
                    onPress={onSubmit}
                  >
                    <MaterialCommunityIcons
                      name={submitButtonIcon}
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={appStyles.buttonText}>{submitButtonText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      appStyles.button,
                      appStyles.buttonHalf,
                      appStyles.cancelButton,
                    ]}
                    onPress={onCancel}
                  >
                    <Text style={appStyles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
