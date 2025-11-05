/**
 * REUSABLE MACRO CARD COMPONENT
 *
 * Displays macro nutrition data (calories, protein, carbs, fats) with progress.
 * Used for daily meal summaries, progress tracking, goal comparison.
 *
 * Features:
 * - Color-coded macros (each has its own color)
 * - Progress bars for goal tracking
 * - Flexible layout (horizontal or grid)
 * - Shows actual vs goal
 * - Status indicators
 *
 * @example
 * <MacroCard
 *   macroType="calories"
 *   actual={1250}
 *   goal={2000}
 *   showGoal
 *   showProgress
 * />
 *
 * @example full daily totals
 * <MacroCard
 *   layout="grid"
 *   macros={{
 *     calories: { actual: 1250, goal: 2000 },
 *     protein: { actual: 75, goal: 150 },
 *     carbs: { actual: 150, goal: 200 },
 *     fats: { actual: 45, goal: 65 }
 *   }}
 * />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';
import { calculatePercentageCapped } from '../../../shared/utils';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

// Macro type configurations
const MACRO_CONFIG = {
  calories: {
    label: 'Calories',
    unit: 'kcal',
    color: COLORS.calories,
    icon: 'flame',
  },
  protein: {
    label: 'Protein',
    unit: 'g',
    color: COLORS.protein,
    icon: 'dumbbell',
  },
  carbs: {
    label: 'Carbs',
    unit: 'g',
    color: COLORS.carbs,
    icon: 'bread-slice',
  },
  fats: {
    label: 'Fats',
    unit: 'g',
    color: COLORS.fats,
    icon: 'water',
  },
};

const MacroCard = ({
  // Single macro display
  macroType, // 'calories', 'protein', 'carbs', 'fats'
  actual,
  goal,

  // Multi macro display
  layout = 'single', // 'single', 'grid'
  macros, // { calories: {...}, protein: {...}, ... }

  // Options
  showGoal = true,
  showProgress = true,
  showValue = true,
}) => {
  // Single macro card
  if (layout === 'single' && macroType) {
    const config = MACRO_CONFIG[macroType];
    const percentage = calculatePercentageCapped(actual, goal);

    return (
      <View style={styles.singleContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>{config.label}</Text>
          {showGoal && goal && (
            <Text style={styles.goalText}>
              {Math.round(goal)} {config.unit}
            </Text>
          )}
        </View>

        {/* Value */}
        {showValue && (
          <Text style={[styles.value, { color: config.color }]}>
            {Math.round(actual)} {config.unit}
          </Text>
        )}

        {/* Progress bar */}
        {showProgress && goal && (
          <ProgressBar
            percentage={percentage}
            fillColor={config.color}
            animated
            height={8}
          />
        )}
      </View>
    );
  }

  // Grid layout with multiple macros
  if (layout === 'grid' && macros) {
    return (
      <View style={styles.gridContainer}>
        {Object.entries(macros).map(([macroType, data]) => {
          const config = MACRO_CONFIG[macroType];
          const percentage = calculatePercentageCapped(data.actual, data.goal);

          return (
            <View key={macroType} style={styles.gridItem}>
              {/* Macro type label */}
              <Text style={styles.gridLabel}>{config.label}</Text>

              {/* Actual value */}
              <Text style={[styles.gridValue, { color: config.color }]}>
                {Math.round(data.actual)}
              </Text>

              {/* Unit and goal */}
              <Text style={styles.gridUnit}>
                {config.unit}
                {showGoal ? ` / ${Math.round(data.goal)}` : ''}
              </Text>

              {/* Progress bar */}
              {showProgress && (
                <View style={styles.gridProgressBar}>
                  <ProgressBar
                    percentage={percentage}
                    fillColor={config.color}
                    animated
                    height={4}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  // Single macro layout
  singleContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginBottom: SPACING.element,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },

  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  goalText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
  },

  value: {
    ...TYPOGRAPHY.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.small,
  },

  // Grid layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.element,
  },

  gridItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },

  gridLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },

  gridValue: {
    ...TYPOGRAPHY.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },

  gridUnit: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },

  gridProgressBar: {
    marginTop: SPACING.xs,
  },
});

export default MacroCard;
