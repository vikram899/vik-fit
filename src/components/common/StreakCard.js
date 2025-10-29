import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  showLegend = false,
}) => {
  const [showLegendModal, setShowLegendModal] = useState(false);

  const handleHelpPress = () => {
    Alert.alert(
      'Color Legend',
      '🟢 Green (80%+): Achieved 80% or more of daily goal\n\n🟠 Orange (50-79%): Achieved 50-79% of daily goal\n\n🔴 Red (<50%): Achieved less than 50% of daily goal\n\n⚪ Gray: No data logged for this day',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  return (
    <View style={styles.streakCard}>
      {/* Title Section with Help Icon */}
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Weekly Streak</Text>
        <TouchableOpacity
          onPress={handleHelpPress}
          style={styles.titleHelpButton}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={18}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.contentRow}>
        <View style={styles.streakMinimalRow}>
          <View style={styles.streakLabelContainer}>
            <View style={styles.streakHeaderRow}>
              <View>
                <Text style={styles.streakMinimalText}>
                  <Text style={styles.streakBold}>{daysTracked}/{totalDays}</Text> logged
                </Text>
                <Text style={styles.streakMetricLabel}>
                  Tracked by {trackingMetric}
                </Text>
              </View>
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  streakCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  titleHelpButton: {
    padding: 4,
    marginRight: -4,
  },
  contentRow: {
    paddingTop: 0,
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
  streakLabelContainer: {
    flex: 1,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  helpButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default StreakCard;
