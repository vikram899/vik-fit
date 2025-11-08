import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheet } from "../../shared/components/ui";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * WorkoutOptionsMenu
 * Bottom sheet menu for workout actions (Edit, Delete, etc.)
 * Uses BottomSheet for modern UX and shared design system
 *
 * Props:
 * - visible: boolean - whether menu is visible
 * - onClose: function - callback to close menu
 * - options: array of objects - menu options
 *   - Each option: { label: string, icon: string, color?: string, onPress: function }
 */
const WorkoutOptionsMenu = ({ visible, onClose, options = [] }) => {
  if (!visible) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} heightPercent={0.4}>
      <View style={styles.container}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionItem]}
            onPress={() => {
              onClose();
              option.onPress();
            }}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={24}
              color={option.color || COLORS.primary}
            />
            <Text
              style={[
                styles.optionLabel,
                option.color && { color: option.color },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    gap: SPACING.small,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.element,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    gap: SPACING.medium,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
});

export default WorkoutOptionsMenu;
