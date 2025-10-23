import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * WeeklyCalendarView Component
 * Shows each day of the week with meal goal completion percentage in a horizontal scrollable list
 * Current day is highlighted and automatically centered
 */
const WeeklyCalendarView = ({ weeklyData, dailyGoal, selectedDate, onDateSelect }) => {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const scrollRef = useRef(null);

  // Get today's date to highlight current day
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];

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

  // Auto-scroll to today's card on mount
  useEffect(() => {
    if (scrollRef.current) {
      // Find index of today
      const todayIndex = weeklyData.findIndex(day => day.date === todayDate);
      if (todayIndex !== -1) {
        // Scroll to center today's card
        const scrollPosition = Math.max(0, todayIndex * 110 - 100);
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            x: scrollPosition,
            animated: true,
          });
        }, 300);
      }
    }
  }, [todayDate, weeklyData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Completion</Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={true}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {weeklyData.map((day, index) => {
          const percentage = getCompletionPercentage(day);
          const color = getCompletionColor(percentage);
          const isSelected = selectedDate === day.date;
          const isToday = day.date === todayDate;

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
                isToday && styles.todayCard,
              ]}
              onPress={() => onDateSelect?.(day.date)}
            >
              <Text style={[styles.dayName, isToday && styles.todayDayName]}>{day.day}</Text>

              <View style={styles.circleContainer}>
                <View
                  style={[
                    styles.circle,
                    {
                      borderColor: color,
                      borderWidth: 3,
                    },
                    isToday && styles.circleToday,
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
                  size={14}
                  color="#FF6B6B"
                />
                <Text style={styles.calories}>
                  {Math.round(day.totalCalories)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  scrollView: {
    marginBottom: 0,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 10,
  },
  dayCard: {
    width: 110,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  dayCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  todayCard: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    backgroundColor: '#f1f8f5',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  todayDayName: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  todayBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  circleContainer: {
    marginBottom: 8,
  },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  circleToday: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  calories: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
});

export default WeeklyCalendarView;
