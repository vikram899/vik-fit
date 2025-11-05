import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";

/**
 * CreateMealHeader
 * Header component for create meal bottom sheet
 *
 * Props:
 * - title: Title text to display
 * - onClose: Callback when close button is pressed
 */
const CreateMealHeader = ({ title = "Add New Meal", onClose }) => {
  return (
    <View
      style={{
        paddingHorizontal: SPACING.element,
        paddingVertical: SPACING.small,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ ...TYPOGRAPHY.sectionTitle, color: COLORS.textPrimary }}>
        {title}
      </Text>
      <TouchableOpacity
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons name="close" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default CreateMealHeader;
