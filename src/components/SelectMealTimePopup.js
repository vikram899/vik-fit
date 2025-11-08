import React from "react";
import {
  Alert,
} from "react-native";

const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];

const SelectMealTimePopup = ({
  visible,
  mealName,
  selectedMealType = "Breakfast",
  onMealTypeChange,
  onConfirm,
  onCancel,
}) => {
  React.useEffect(() => {
    if (visible) {
      // Create alert with meal type options
      Alert.alert(
        "Select Meal Time",
        mealName ? `Add ${mealName} to which meal?` : "Choose meal time",
        [
          {
            text: "Breakfast",
            onPress: () => {
              onConfirm?.("Breakfast");
            },
          },
          {
            text: "Lunch",
            onPress: () => {
              onConfirm?.("Lunch");
            },
          },
          {
            text: "Snacks",
            onPress: () => {
              onConfirm?.("Snacks");
            },
          },
          {
            text: "Dinner",
            onPress: () => {
              onConfirm?.("Dinner");
            },
          },
          {
            text: "Cancel",
            onPress: () => {
              onCancel?.();
            },
            style: "destructive",
          },
        ]
      );
    }
  }, [visible, mealName]);

  // Return null since we're using Alert.alert() instead of rendering a component
  return null;
};

export default SelectMealTimePopup;
