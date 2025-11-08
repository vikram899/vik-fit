import React from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * OptionItem
 * Reusable option item component for displaying selectable options with icon
 *
 * Props:
 * - icon: Icon name from MaterialCommunityIcons
 * - title: Title text
 * - description: Description text
 * - onPress: Callback when pressed
 */
const OptionItem = ({ icon, title, description, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.option}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={32}
          color={COLORS.textSecondary}
        />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={COLORS.mediumGray}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.sm,
    marginBottom: SPACING.small,
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.secondaryBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.element,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
});

export default OptionItem;
