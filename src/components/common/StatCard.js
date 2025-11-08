import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../shared/constants';

/**
 * StatCard Component - Reusable card for displaying statistics
 * Shows current value, goal, progress bar, and trend
 * Used in both Weekly Summary cards (Meals and Workouts)
 */
const StatCard = ({
  label,
  icon,
  currentValue,
  goal = 0,
  previousValue = 0,
  unit = '',
  totalValue = undefined,
  showGoal = true,
}) => {
  // Calculate percentage change from previous period
  const calculateChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  // Get trend icon based on percentage change
  const getTrendIcon = (percentage) => {
    if (percentage > 5) return 'trending-up';
    if (percentage < -5) return 'trending-down';
    return 'minus';
  };

  // Get trend color based on percentage change
  const getTrendColor = (percentage) => {
    if (percentage > 5) return COLORS.success; // Green for increase
    if (percentage < -5) return COLORS.error; // Red for decrease
    return COLORS.textSecondary; // Gray for stable
  };

  // Calculate progress percentage for goal
  const goalPercentage = goal > 0 ? (currentValue / goal) * 100 : 0;

  // Get progress bar color based on completion percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return COLORS.success; // Green
    if (percentage >= 70) return COLORS.warning; // Yellow/Orange
    return COLORS.error; // Red
  };

  const percentageChange = calculateChange(currentValue, previousValue);
  const trendIcon = getTrendIcon(percentageChange);
  const trendColor = getTrendColor(percentageChange);

  return (
    <View style={styles.card}>
      {/* Header with label and trend */}
      <View style={styles.cardHeader}>
        <View style={styles.labelSection}>
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.trendSection}>
          <MaterialCommunityIcons
            name={trendIcon}
            size={18}
            color={trendColor}
          />
          <Text style={[styles.percentageChange, { color: trendColor }]}>
            {percentageChange > 0 ? '+' : ''}
            {percentageChange.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Body with value and progress */}
      <View style={styles.cardBody}>
        {/* Value row - shows current/goal or current/total */}
        <View style={styles.valueRow}>
          <Text style={styles.currentValue}>
            {Math.round(currentValue)}
            {totalValue !== undefined && (
              <Text style={styles.totalValue}>/{Math.round(totalValue)}</Text>
            )}
            {unit}
          </Text>
          {goal > 0 && showGoal && (
            <Text style={styles.goalText}>
              / {Math.round(goal)}
              {unit} goal
            </Text>
          )}
        </View>

        {/* Progress bar - only show if goal exists */}
        {goal > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(goalPercentage, 100)}%`,
                  backgroundColor: getProgressColor(goalPercentage),
                },
              ]}
            />
          </View>
        )}

        {/* Previous value comparison */}
        {previousValue > 0 && (
          <Text style={styles.previousValue}>
            Last week: {Math.round(previousValue)}
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    paddingLeft: SPACING.xs,
    paddingRight: SPACING.xs,
    paddingTop: SPACING.medium,
    paddingBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  labelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  trendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  percentageChange: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardBody: {
    gap: SPACING.small,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  currentValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
  goalText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  previousValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default StatCard;
