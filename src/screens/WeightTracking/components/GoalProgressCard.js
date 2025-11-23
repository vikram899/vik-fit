/**
 * GOAL PROGRESS CARD COMPONENT
 *
 * Displays progress towards weight goal with continuous progress bar.
 * Shows current weight at start and target weight at end of the bar.
 * Displays completion percentage.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';
import { Card } from '../../../shared/components/ui';

const GoalProgressCard = ({ currentWeight, targetWeight, initialWeight, onAdjustGoal }) => {
  // Handle missing data
  if (!currentWeight || !targetWeight) {
    return (
      <Card title="Goal Progress">
        <Text style={styles.noTargetText}>No target set</Text>
      </Card>
    );
  }

  const current = parseFloat(currentWeight);
  const target = parseFloat(targetWeight);
  const initial = initialWeight ? parseFloat(initialWeight) : current;

  // Calculate progress percentage
  // Progress = (Initial - Current) / (Initial - Target) × 100
  let progressPercent = 0;
  let isGoalReached = false;

  if (initial !== target) {
    progressPercent = Math.max(0, Math.min(100, ((initial - current) / (initial - target)) * 100));
    isGoalReached = current === target;
  }

  // Calculate remaining weight
  const remainingWeight = Math.abs(target - current);
  const isWeightLoss = current > target;

  return (
    <Card title="Goal Progress">
      {/* Remaining Weight */}
      <View style={styles.remainingContainer}>
        <Text style={[styles.remainingText, { color: isWeightLoss ? COLORS.weightLoss : COLORS.weightGain }]}>
          {isWeightLoss ? 'Reduce' : 'Gain'} {remainingWeight.toFixed(1)} kg
        </Text>
      </View>

      {/* Progress Bar with Percentage Inside */}
      <View style={styles.barWrapper}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? COLORS.success : COLORS.primary,
              },
            ]}
          />
          {/* Percentage Text Overlay */}
          <View style={styles.percentageOverlay}>
            <Text style={styles.percentageText}>{progressPercent.toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      {/* Weight Labels - Start and End */}
      <View style={styles.weightLabelsRow}>
        <View style={styles.weightLabel}>
          <Text style={styles.labelText}>Current</Text>
          <Text style={styles.weightValue}>{current.toFixed(1)} kg</Text>
        </View>
        <View style={styles.weightLabel}>
          <Text style={styles.labelText}>Target</Text>
          <Text style={[styles.weightValue, { color: COLORS.primary }]}>
            {target.toFixed(1)} kg
          </Text>
        </View>
      </View>

      {/* Adjust Goal Button */}
      <TouchableOpacity style={styles.adjustButton} onPress={onAdjustGoal}>
        <MaterialCommunityIcons
          name="pencil"
          size={16}
          color={COLORS.primary}
          style={{ marginRight: SPACING.small }}
        />
        <Text style={styles.adjustButtonText}>Adjust Goal</Text>
      </TouchableOpacity>

      {/* Status Message */}
      {isGoalReached && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>🎉 Goal reached!</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  remainingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.element,
  },
  remainingText: {
    ...TYPOGRAPHY.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 16,
  },
  barWrapper: {
    marginBottom: SPACING.element,
  },
  progressBar: {
    height: 24,
    backgroundColor: COLORS.mediumGray,
    borderRadius: SPACING.borderRadiusLarge,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadiusLarge,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  percentageOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  percentageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 12,
  },
  weightLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.element,
  },
  weightLabel: {
    alignItems: 'center',
  },
  labelText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  weightValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  noTargetText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.element,
    fontStyle: 'italic',
  },
  successMessage: {
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.element,
    borderRadius: SPACING.borderRadius,
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  successText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.element,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SPACING.borderRadius,
    backgroundColor: 'transparent',
  },
  adjustButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default GoalProgressCard;
