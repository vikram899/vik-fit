import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../shared/constants";

/**
 * TabBarFAB
 * Floating Action Button for tab bar center position
 * Replaces the "Add" tab with a custom centered button
 *
 * Props:
 * - onPress: Callback when button is pressed
 */
const TabBarFAB = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={(e) => {
        e.preventDefault?.();
        onPress?.();
      }}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons
        name="plus-circle"
        size={50}
        color={COLORS.primary}
        style={{
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      />
    </TouchableOpacity>
  );
};

export default TabBarFAB;
