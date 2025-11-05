import React from "react";
import { TouchableOpacity, Alert, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../shared/constants";

/**
 * SortButton Component
 * Reusable sort control button with dynamic options
 * sortOption: current sort option
 * onSortChange: callback to handle sort change
 * sortOptions: optional array of sort options [{value: "name", label: "Name (A-Z)"}, ...]
 * alertTitle: optional title for the alert dialog (default: "Sort")
 */
export default function SortButton({
  sortOption,
  onSortChange,
  sortOptions = null,
  alertTitle = "Sort"
}) {
  // Default meal sort options
  const getDefaultSortOptions = () => [
    { value: "name", label: "Name (A-Z)" },
    { value: "calories", label: "Highest Calories" },
    { value: "recent", label: "Recently Created" },
  ];

  const options = sortOptions || getDefaultSortOptions();

  const handleSortPress = () => {
    const alertButtons = options.map((option) => ({
      text: option.label,
      onPress: () => onSortChange(option.value),
    }));

    alertButtons.push({ text: "Cancel", style: "cancel" });

    Alert.alert(alertTitle, "Sort by:", alertButtons);
  };

  return (
    <TouchableOpacity
      style={styles.controlButton}
      onPress={handleSortPress}
    >
      <MaterialCommunityIcons
        name="sort"
        size={18}
        color={COLORS.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  controlButton: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.small,
    backgroundColor: COLORS.gray,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    alignItems: "center",
    justifyContent: "center",
  },
});
