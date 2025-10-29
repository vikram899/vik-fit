import React from "react";
import { TouchableOpacity, Alert, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

/**
 * FilterButton Component
 * Reusable filter control button with dynamic options
 * filterOptions: object with boolean values
 * filterLabels: optional object mapping keys to display labels (e.g., { difficulty: "Difficulty", duration: "Duration" })
 * alertTitle: optional title for the alert dialog (default: "Filter Meals")
 */
export default function FilterButton({
  filterOptions,
  onFilterChange,
  filterLabels = null,
  alertTitle = "Filter Meals"
}) {
  // Generate filter labels dynamically if not provided
  const getFilterLabels = () => {
    if (filterLabels) return filterLabels;

    // Default meal labels
    return {
      starred: "Starred",
      veg: "Veg",
      "non-veg": "Non-Veg",
      egg: "Egg",
      vegan: "Vegan",
    };
  };

  const labels = getFilterLabels();

  const showFilterDialog = () => {
    // Dynamically create filter buttons based on filterOptions keys
    const filterButtons = Object.keys(filterOptions).map((key) => ({
      text: filterOptions[key] ? `✓ ${labels[key]}` : labels[key],
      onPress: () => {
        onFilterChange({
          ...filterOptions,
          [key]: !filterOptions[key],
        });
      },
    }));

    if (Object.values(filterOptions).some((v) => v)) {
      // Create clear all object dynamically
      const clearAllObject = {};
      Object.keys(filterOptions).forEach((key) => {
        clearAllObject[key] = false;
      });

      filterButtons.push({
        text: "Clear All",
        onPress: () => {
          onFilterChange(clearAllObject);
        },
        style: "destructive",
      });
    }

    filterButtons.push({ text: "Done", style: "cancel" });

    Alert.alert(alertTitle, "Select filters:", filterButtons);
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
