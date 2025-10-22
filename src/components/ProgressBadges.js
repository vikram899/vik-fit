import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBadges = ({ dailyTotals, macroGoals }) => {
  /**
   * Calculate progress percentage
   */
  const getProgress = (actual, goal) => {
    if (!goal || goal === 0) return 0;
    const progress = (actual / goal) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  /**
   * Get color based on progress (green if close, yellow if moderate, red if low)
   */
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 75) return '#FFC107'; // Yellow
    return '#FF5722'; // Red
  };

  /**
   * Render a single progress badge
   */
  const ProgressBadge = ({ label, actual, goal, unit = '' }) => {
    const percentage = getProgress(actual, goal);
    const color = getProgressColor(percentage);

    return (
      <View style={styles.badgeContainer}>
        <View style={styles.badgeContent}>
          <Text style={styles.badgeLabel}>{label}</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${percentage}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.badgeValue}>
            {Math.round(actual)}{unit} / {Math.round(goal)}{unit}
          </Text>
          <Text style={[styles.progressPercentage, { color }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
    );
  };

  if (!macroGoals) {
    return (
      <View style={styles.noBadgesContainer}>
        <Text style={styles.noBadgesText}>Set macro goals to see progress</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Progress</Text>
      <View style={styles.badgesGrid}>
        <ProgressBadge
          label="Calories"
          actual={dailyTotals.totalCalories}
          goal={macroGoals.calorieGoal}
        />
        <ProgressBadge
          label="Protein"
          actual={dailyTotals.totalProtein}
          goal={macroGoals.proteinGoal}
          unit="g"
        />
        <ProgressBadge
          label="Carbs"
          actual={dailyTotals.totalCarbs}
          goal={macroGoals.carbsGoal}
          unit="g"
        />
        <ProgressBadge
          label="Fats"
          actual={dailyTotals.totalFats}
          goal={macroGoals.fatsGoal}
          unit="g"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeContainer: {
    flex: 1,
    minWidth: '48%',
  },
  badgeContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  badgeValue: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  noBadgesContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  noBadgesText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});

export default ProgressBadges;
