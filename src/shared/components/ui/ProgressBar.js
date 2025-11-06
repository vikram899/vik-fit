/**
 * REUSABLE PROGRESS BAR COMPONENT
 *
 * Animated progress indicator used for macro tracking, goals, etc.
 * Features color-coded status (green for good, yellow for okay, red for poor).
 *
 * Features:
 * - Animated fill
 * - Color-coded status
 * - Optional label/percentage display
 * - Multiple sizes
 * - Custom colors
 *
 * @example
 * <ProgressBar
 *   percentage={75}
 *   label="75/100 cal"
 *   showPercentage
 * />
 *
 * @example with custom color
 * <ProgressBar
 *   percentage={95}
 *   fillColor={COLORS.success}
 * />
 */

import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { getProgressColor } from "../../../shared/utils";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../shared/constants";

const ProgressBar = ({
  // Content
  percentage = 0,
  label,
  showPercentage = false,

  // Appearance
  height = 8,
  fillColor,
  backgroundColor = COLORS.mediumGray,
  animated = true,

  // Sizing
  showLabel = false,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Auto-determine fill color based on percentage
  const determinedFillColor = fillColor || getProgressColor(percentage);

  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: clampedPercentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(clampedPercentage);
    }
  }, [clampedPercentage, animated, animatedValue]);

  const widthInterpolation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View>
      {/* Label above progress bar */}
      {showLabel && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.labelText}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentageText}>
              {Math.round(clampedPercentage)}%
            </Text>
          )}
        </View>
      )}

      {/* Progress bar */}
      <View style={[styles.container, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolation,
              backgroundColor: determinedFillColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: COLORS.mediumGray,
    borderRadius: 4,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
  },

  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },

  labelText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  percentageText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default ProgressBar;
