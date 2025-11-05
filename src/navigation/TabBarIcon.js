import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * TabBarIcon
 * Reusable icon component for tab navigation
 *
 * Props:
 * - route: Navigation route object
 * - focused: Boolean indicating if tab is focused
 * - color: Color for the icon
 * - size: Size of the icon
 */
const TabBarIcon = ({ route, focused, color, size }) => {
  const getIconName = () => {
    switch (route.name) {
      case "Home":
        return focused ? "home" : "home-outline";
      case "Workouts":
        return "dumbbell";
      case "Meals":
        return "silverware-fork-knife";
      case "Progress":
        return "chart-line";
      case "Add":
        return "plus";
      default:
        return "help-circle";
    }
  };

  return (
    <MaterialCommunityIcons
      name={getIconName()}
      size={size}
      color={color}
    />
  );
};

export default TabBarIcon;
