/**
 * WEIGHT HISTORY LIST COMPONENT
 *
 * Displays a list of weight entries for the last 30 days.
 * Shows date, current weight, target weight, and difference from target.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

const WeightHistoryList = ({ weightHistory }) => {
  if (weightHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="scale-bathroom"
          size={48}
          color={COLORS.textTertiary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyText}>
          No weight history yet. Start tracking your weight!
        </Text>
      </View>
    );
  }

  const getDiffColor = (diffFromTarget) => {
    if (diffFromTarget > 0) return COLORS.weightGain; // Red for above target
    if (diffFromTarget < 0) return COLORS.weightLoss; // Green for below target
    return COLORS.textSecondary; // Gray for on target
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight History (Last 30 Days)</Text>

      {weightHistory.map((entry) => {
        const diffFromTarget = entry.currentWeight - entry.targetWeight;

        return (
          <View key={entry.id} style={styles.historyItem}>
            <View style={styles.dateSection}>
              <Text style={styles.dateText}>{entry.weightDate}</Text>
            </View>

            <View style={styles.weightSection}>
              <Text style={styles.weightText}>{entry.currentWeight} kg</Text>
              <Text style={styles.targetText}>Target: {entry.targetWeight} kg</Text>
            </View>

            <View style={styles.diffSection}>
              <Text style={[styles.diffText, { color: getDiffColor(diffFromTarget) }]}>
                {diffFromTarget > 0 ? '+' : ''}{diffFromTarget.toFixed(1)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.container,
    paddingHorizontal: SPACING.element,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mainBackground,
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.small,
    marginBottom: SPACING.xs,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  dateSection: {
    flex: 0.3,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  weightSection: {
    flex: 0.45,
  },
  weightText: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  targetText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  diffSection: {
    flex: 0.25,
    alignItems: 'flex-end',
  },
  diffText: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.container,
    marginHorizontal: SPACING.element,
  },
  emptyIcon: {
    marginBottom: SPACING.small,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});

export default WeightHistoryList;
