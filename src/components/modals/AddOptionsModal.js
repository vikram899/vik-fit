import React from "react";
import {
  ScrollView,
  StyleSheet,
} from "react-native";
import { COLORS, SPACING } from "../../shared/constants";
import { BottomSheet } from "../../shared/components/ui";
import OptionItem from "./OptionItem";

/**
 * AddOptionsModal
 * Bottom sheet modal with options to add workouts or meals
 *
 * Props:
 * - visible: Boolean to show/hide the modal
 * - onLogWorkout: Callback when Log Workout is pressed
 * - onLogMeal: Callback when Log Meal is pressed
 * - onClose: Callback when modal is closed
 * - heightPercent: Optional height as percentage of screen (default 0.5 / 50%)
 */
const AddOptionsModal = ({
  visible,
  onLogWorkout,
  onLogMeal,
  onClose,
  heightPercent = 0.5,
}) => {
  return (
    <BottomSheet
      visible={visible}
      title="What would you like to add?"
      onClose={onClose}
      heightPercent={heightPercent}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionItem
          icon="dumbbell"
          title="Log Workout"
          description="Add a new workout session"
          onPress={() => {
            onLogWorkout();
            onClose();
          }}
        />

        <OptionItem
          icon="silverware-fork-knife"
          title="Log Meal"
          description="Add a new meal entry"
          onPress={() => {
            onLogMeal();
            onClose();
          }}
        />
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.element,
    paddingBottom: SPACING.container,
  },
});

export default AddOptionsModal;
