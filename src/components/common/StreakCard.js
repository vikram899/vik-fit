import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * StreakCard Component
 * Displays a minimalistic streak indicator with color-coded checkmarks
 * Reusable for both Meals and Workouts
 */
const StreakCard = ({
  daysTracked,
  totalDays = 7,
  trackingMetric = 'Calories',
  weeklyBreakdown = [],
  getStreakColor = () => ({ background: '#e0e0e0', border: '#ccc' }),
}) => {
  return (
    <View style={styles.streakCard}>
      <View style={styles.streakMinimalRow}>
        <View>
          <Text style={styles.streakMinimalText}>
            <Text style={styles.streakBold}>{daysTracked}/{totalDays}</Text> logged
          </Text>
          <Text style={styles.streakMetricLabel}>
            Tracked by {trackingMetric}
          </Text>
        </View>
        <View style={styles.checkmarkRowMinimal}>
          {weeklyBreakdown.map((day) => {
            const color = getStreakColor(day);
            return (
              <View
                key={day.date || day.day}
                style={[
                  styles.checkmarkMinimal,
                  {
                    backgroundColor: color.background,
                    borderColor: color.border,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  streakCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  streakMinimalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakMinimalText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  streakBold: {
    fontWeight: '700',
    color: '#000',
  },
  checkmarkRowMinimal: {
    flexDirection: 'row',
    gap: 4,
  },
  checkmarkMinimal: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
  },
  streakMetricLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default StreakCard;
