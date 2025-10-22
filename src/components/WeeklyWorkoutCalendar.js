import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * WeeklyWorkoutCalendar Component
 * Shows which days had workouts completed with counts
 */
const WeeklyWorkoutCalendar = ({ weeklyData }) => {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCompletionColor = (completedCount) => {
    if (completedCount >= 3) return '#4CAF50'; // Green
    if (completedCount >= 2) return '#FFC107'; // Yellow
    if (completedCount >= 1) return '#FF9800'; // Orange
    return '#e0e0e0'; // Gray for no workouts
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Completion</Text>

      <View style={styles.weekGrid}>
        {weeklyData.map((day, index) => {
          const color = getCompletionColor(day.totalWorkoutsCompleted);
          const hasWorkouts = day.totalWorkoutsCompleted > 0;

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCard,
                { backgroundColor: color },
                !hasWorkouts && styles.dayCardEmpty,
              ]}
            >
              <Text style={styles.dayName}>{DAYS[index]}</Text>

              <View style={styles.circleContainer}>
                <View
                  style={[
                    styles.circle,
                    {
                      borderColor: hasWorkouts ? '#fff' : '#999',
                    },
                  ]}
                >
                  <Text style={[styles.workoutCount, { color: hasWorkouts ? '#fff' : '#999' }]}>
                    {day.totalWorkoutsCompleted}
                  </Text>
                </View>
              </View>

              {hasWorkouts && (
                <View style={styles.checkmarkContainer}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#fff"
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>3+ workouts</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>2 workouts</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>1 workout</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e0e0e0' }]} />
          <Text style={styles.legendText}>None</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  dayCard: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayCardEmpty: {
    backgroundColor: '#fff',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  circleContainer: {
    marginBottom: 6,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
  },
  workoutCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});

export default WeeklyWorkoutCalendar;
