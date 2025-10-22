import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * WeeklyCalendarView Component
 * Shows each day of the week with meal goal completion percentage
 */
const WeeklyCalendarView = ({ weeklyData, dailyGoal, selectedDate, onDateSelect }) => {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCompletionPercentage = (dailyData) => {
    if (dailyGoal === 0) return 0;
    const total = dailyData.totalCalories + dailyData.totalProtein +
                  dailyData.totalCarbs + dailyData.totalFats;

    // Use calories as the main metric for completion
    return Math.min((dailyData.totalCalories / dailyGoal) * 100, 100);
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 70) return '#FFC107'; // Yellow
    if (percentage >= 50) return '#FF9800'; // Orange
    return '#FF6B6B'; // Red
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Completion</Text>

      <View style={styles.weekGrid}>
        {weeklyData.map((day, index) => {
          const percentage = getCompletionPercentage(day);
          const color = getCompletionColor(percentage);
          const isSelected = selectedDate === day.date;

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
              ]}
              onPress={() => onDateSelect?.(day.date)}
            >
              <Text style={styles.dayName}>{day.day}</Text>

              <View style={styles.circleContainer}>
                <View
                  style={[
                    styles.circle,
                    {
                      borderColor: color,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text style={[styles.percentage, { color }]}>
                    {Math.round(percentage)}%
                  </Text>
                </View>
              </View>

              <View style={styles.caloriesContainer}>
                <MaterialCommunityIcons
                  name="fire"
                  size={12}
                  color="#FF6B6B"
                />
                <Text style={styles.calories}>
                  {Math.round(day.totalCalories)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  },
  dayCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  circleContainer: {
    marginBottom: 8,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  calories: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
});

export default WeeklyCalendarView;
