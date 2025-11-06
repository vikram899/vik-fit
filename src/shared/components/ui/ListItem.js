/**
 * REUSABLE LIST ITEM COMPONENT
 *
 * Displays a single item in a list with title, subtitle, and actions.
 * Used for meal lists, workout lists, history, etc.
 *
 * Features:
 * - Icon support
 * - Multiple action buttons
 * - Press handler
 * - Loading state
 * - Disabled state
 * - Divider option
 *
 * @example
 * <ListItem
 *   title="Chicken Salad"
 *   subtitle="250 cal • Lunch"
 *   icon="salad"
 *   onPress={() => viewMealDetails()}
 *   actions={[
 *     { icon: 'pencil', onPress: () => editMeal() },
 *     { icon: 'trash', onPress: () => deleteMeal() }
 *   ]}
 * />
 *
 * @example with value
 * <ListItem
 *   title="Bench Press"
 *   value="3 sets × 8 reps"
 *   icon="dumbbell"
 *   onPress={() => viewExercise()}
 * />
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../shared/constants";

const ListItem = ({
  // Content
  title,
  subtitle,
  value,
  icon,

  // Actions
  onPress,
  actions, // Array of { icon, onPress, color }

  // States
  isLoading = false,
  isDisabled = false,

  // Appearance
  showDivider = true,
  highlighted = false,
}) => {
  const handlePress = () => {
    if (!isDisabled && !isLoading && onPress) {
      onPress();
    }
  };

  const handleActionPress = (action) => {
    if (!isDisabled && !isLoading && action.onPress) {
      action.onPress();
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.container,
          highlighted && styles.containerHighlighted,
          isDisabled && styles.containerDisabled,
        ]}
        onPress={handlePress}
        disabled={isDisabled || isLoading}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {/* Icon */}
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={COLORS.primary}
            style={styles.icon}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Value (on the right) */}
        {value && !isLoading && (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        )}

        {/* Loading indicator */}
        {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}

        {/* Action buttons */}
        {!isLoading && actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
                disabled={isDisabled}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={20}
                  color={action.color || COLORS.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chevron indicator */}
        {!actions && onPress && !isLoading && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.textTertiary}
          />
        )}
      </TouchableOpacity>

      {/* Divider */}
      {showDivider && <View style={styles.divider} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.element,
    paddingHorizontal: SPACING.element,
    backgroundColor: COLORS.white,
  },

  containerHighlighted: {
    backgroundColor: COLORS.primaryLight,
  },

  containerDisabled: {
    opacity: 0.5,
  },

  icon: {
    marginRight: SPACING.element,
  },

  content: {
    flex: 1,
  },

  title: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },

  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },

  value: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginHorizontal: SPACING.small,
  },

  actionsContainer: {
    flexDirection: "row",
    gap: SPACING.small,
    marginLeft: SPACING.small,
  },

  actionButton: {
    padding: SPACING.small,
    justifyContent: "center",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.mediumGray,
    marginHorizontal: SPACING.element,
  },
});

export default ListItem;
