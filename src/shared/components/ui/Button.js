/**
 * REUSABLE BUTTON COMPONENT
 *
 * Flexible button with multiple variants, sizes, and states.
 * Replaces hard-coded buttons throughout the app.
 *
 * Features:
 * - Multiple variants (primary, secondary, danger, outline)
 * - Multiple sizes (small, medium, large)
 * - Icon support
 * - Loading state with spinner
 * - Disabled state
 * - Full width option
 *
 * @example
 * <Button
 *   label="Log Meal"
 *   onPress={() => navigation.navigate('LogMeals')}
 *   variant="primary"
 *   size="medium"
 * />
 *
 * @example with icon
 * <Button
 *   label="Add"
 *   icon="plus"
 *   iconPosition="left"
 *   onPress={handleAdd}
 * />
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

const Button = ({
  // Content
  label,
  icon,
  iconPosition = 'left', // 'left' or 'right'

  // Actions
  onPress,

  // Appearance
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'cancel'
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = false,

  // States
  isLoading = false,
  isDisabled = false,
}) => {
  const handlePress = () => {
    if (!isDisabled && !isLoading && onPress) {
      onPress();
    }
  };

  const getBackgroundColor = () => {
    if (isDisabled) return COLORS.darkGray;
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.secondary;
      case 'danger':
        return COLORS.danger;
      case 'cancel':
        return COLORS.mediumGray;
      case 'outline':
        return 'transparent';
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'cancel') return COLORS.textPrimary;
    return COLORS.white;
  };

  const getBorderColor = () => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'cancel') return COLORS.mediumGray;
    return 'transparent';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'large':
        return styles.sizeLarge;
      case 'medium':
      default:
        return styles.sizeMedium;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return TYPOGRAPHY.small;
      case 'large':
        return TYPOGRAPHY.button;
      case 'medium':
      default:
        return TYPOGRAPHY.button;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        isDisabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'large'}
          color={getTextColor()}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={size === 'small' ? 16 : 20}
              color={getTextColor()}
              style={styles.iconLeft}
            />
          )}

          {label && (
            <Text
              style={[
                styles.label,
                getTextSize(),
                { color: getTextColor() },
              ]}
            >
              {label}
            </Text>
          )}

          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={size === 'small' ? 16 : 20}
              color={getTextColor()}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SPACING.borderRadiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  sizeSmall: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.element,
    minHeight: 32,
  },

  sizeMedium: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.element,
    minHeight: 44,
  },

  sizeLarge: {
    paddingVertical: SPACING.element,
    paddingHorizontal: SPACING.container,
    minHeight: 52,
  },

  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.6,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.small,
  },

  label: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  iconLeft: {
    marginRight: SPACING.xs,
  },

  iconRight: {
    marginLeft: SPACING.xs,
  },
});

export default Button;
