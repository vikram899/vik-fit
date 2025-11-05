/**
 * REUSABLE BADGE COMPONENT
 *
 * Small tag/label for displaying categories, status, and metadata.
 * Used for meal types, progress status, tags, etc.
 *
 * Features:
 * - Multiple variants (primary, success, warning, danger)
 * - Icon support
 * - Dismissible option
 * - Outlined variant
 *
 * @example
 * <Badge label="Breakfast" variant="primary" />
 *
 * @example with icon
 * <Badge
 *   label="Completed"
 *   icon="check-circle"
 *   variant="success"
 * />
 *
 * @example dismissible
 * <Badge
 *   label="Tag"
 *   onDismiss={() => removeTag()}
 *   dismissible
 * />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

const Badge = ({
  // Content
  label,
  icon,

  // Appearance
  variant = 'primary', // 'primary', 'success', 'warning', 'danger', 'secondary'
  outlined = false,

  // Actions
  onPress,
  onDismiss,
  dismissible = false,
}) => {
  const getBackgroundColor = () => {
    if (outlined) return 'transparent';
    switch (variant) {
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'danger':
        return COLORS.danger;
      case 'secondary':
        return COLORS.secondary;
      case 'primary':
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (outlined) {
      switch (variant) {
        case 'success':
          return COLORS.success;
        case 'warning':
          return COLORS.warning;
        case 'danger':
          return COLORS.danger;
        case 'secondary':
          return COLORS.secondary;
        case 'primary':
        default:
          return COLORS.primary;
      }
    }
    return COLORS.white;
  };

  const getBorderColor = () => {
    if (outlined) {
      return getTextColor();
    }
    return 'transparent';
  };

  const handlePress = () => {
    if (onPress && !dismissible) {
      onPress();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
      onPress={handlePress}
      disabled={!onPress || dismissible}
      activeOpacity={0.7}
    >
      {/* Icon */}
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={14}
          color={getTextColor()}
          style={styles.icon}
        />
      )}

      {/* Label */}
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: getTextColor(),
            },
          ]}
        >
          {label}
        </Text>
      )}

      {/* Dismiss button */}
      {dismissible && (
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
          <MaterialCommunityIcons
            name="close"
            size={14}
            color={getTextColor()}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    borderRadius: SPACING.borderRadiusRound,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },

  icon: {
    marginRight: SPACING.xs,
  },

  label: {
    ...TYPOGRAPHY.small,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  dismissButton: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },
});

export default Badge;
