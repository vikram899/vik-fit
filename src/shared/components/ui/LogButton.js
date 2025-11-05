/**
 * LOG BUTTON COMPONENT
 *
 * Specialized button for "log" actions throughout the app.
 * Provides a consistent UI/UX for logging meals, workouts, weight, etc.
 *
 * Features:
 * - Default label: "+ Log"
 * - Default icon: "plus"
 * - Inherits all Button capabilities (variants, sizes, loading, disabled states)
 * - Optimized for navigation actions
 *
 * @example
 * <LogButton
 *   onPress={() => navigation.navigate('LogMeals')}
 * />
 *
 * @example with custom label
 * <LogButton
 *   label="Add Workout"
 *   onPress={() => navigation.navigate('LogWorkout')}
 * />
 *
 * @example with variant and size
 * <LogButton
 *   label="Log Weight"
 *   onPress={() => navigation.navigate('WeightTracking')}
 *   variant="primary"
 *   size="medium"
 * />
 */

import React from "react";
import Button from "./Button";

const LogButton = ({
  // Content - default values optimized for log actions
  label = "Log",
  icon = "plus",
  iconPosition = "left",

  // Actions
  onPress,

  // Appearance - inherit Button defaults
  variant = "primary",
  size = "medium",
  fullWidth = false,

  // States
  isLoading = false,
  isDisabled = false,
}) => {
  return (
    <Button
      label={label}
      icon={icon}
      iconPosition={iconPosition}
      onPress={onPress}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isLoading={isLoading}
      isDisabled={isDisabled}
    />
  );
};

export default LogButton;
