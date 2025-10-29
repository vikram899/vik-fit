import React from "react";
import { TouchableOpacity, Alert, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

/**
 * WorkoutFilterButton Component
 * Filter button with workout-specific options
 */
export default function WorkoutFilterButton({ filterOptions, onFilterChange }) {
  const showFilterDialog = () => {
    const filterButtons = [
      {
        text: filterOptions.difficulty ? "✓ Difficulty" : "Difficulty",
        onPress: () => {
          onFilterChange({
            ...filterOptions,
            difficulty: !filterOptions.difficulty,
          });
        },
      },
      {
        text: filterOptions.duration ? "✓ Duration" : "Duration",
        onPress: () => {
          onFilterChange({
            ...filterOptions,
            duration: !filterOptions.duration,
          });
        },
      },
      {
        text: filterOptions.muscleGroup ? "✓ Muscle Group" : "Muscle Group",
        onPress: () => {
          onFilterChange({
            ...filterOptions,
            muscleGroup: !filterOptions.muscleGroup,
          });
        },
      },
      {
        text: filterOptions.equipment ? "✓ Equipment" : "Equipment",
        onPress: () => {
          onFilterChange({
            ...filterOptions,
            equipment: !filterOptions.equipment,
          });
        },
      },
    ];

    if (Object.values(filterOptions).some((v) => v)) {
      filterButtons.push({
        text: "Clear All",
        onPress: () => {
          onFilterChange({
            difficulty: false,
            duration: false,
            muscleGroup: false,
            equipment: false,
          });
        },
        style: "destructive",
      });
    }

    filterButtons.push({ text: "Done", style: "cancel" });

    Alert.alert("Filter Workouts", "Select filters:", filterButtons);
  };

  const hasActiveFilters = Object.values(filterOptions).some((v) => v);

  return (
    <TouchableOpacity
      style={[
        styles.controlButton,
        hasActiveFilters && { backgroundColor: COLORS.primary },
      ]}
      onPress={showFilterDialog}
    >
      <MaterialCommunityIcons
        name="filter"
        size={18}
        color={hasActiveFilters ? "#fff" : COLORS.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
});
