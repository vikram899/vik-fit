import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * WeeklyWorkoutCalendar Component
 * Shows which days had workouts completed with counts in a horizontal scrollable list
 * Current day is highlighted and automatically centered
 */
const WeeklyWorkoutCalendar = ({ weeklyData }) => {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const scrollRef = useRef(null);

  // Get today's date to highlight current day
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];

  const getCompletionColor = (completedCount, assignedCount) => {
    if (assignedCount === 0) return '#e0e0e0'; // Gray for no assigned workouts
    const percentage = (completedCount / assignedCount) * 100;
    if (percentage >= 100) return '#4CAF50'; // Green
    if (percentage >= 66) return '#FFC107'; // Yellow
    if (percentage >= 33) return '#FF9800'; // Orange
    return '#e0e0e0'; // Gray for low completion
  };

  const getCompletionPercentage = (completedCount, assignedCount) => {
    if (assignedCount === 0) return 0;
    return Math.round((completedCount / assignedCount) * 100);
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
      <Text style={styles.title}>Weekly Completion</Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={true}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {weeklyData.map((day, index) => {
          const color = getCompletionColor(day.totalWorkoutsCompleted, day.totalWorkoutsAssigned);
          const hasWorkouts = day.totalWorkoutsCompleted > 0;
          const isToday = day.date === todayDate;
          const percentage = getCompletionPercentage(day.totalWorkoutsCompleted, day.totalWorkoutsAssigned);

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCard,
                isToday && styles.todayCard,
              ]}
            >
              <Text style={[styles.dayName, isToday && styles.todayDayName]}>
                {DAYS[index]}
              </Text>

              <View style={styles.circleContainer}>
                <View
                  style={[
                    styles.circle,
                    {
                      borderColor: color,
                      borderWidth: 3,
                      backgroundColor: color,
                    },
                    isToday && styles.circleToday,
                  ]}
                >
                  <Text style={[styles.percentage, { color: hasWorkouts ? '#fff' : '#999' }]}>
                    {percentage}%
                  </Text>
                </View>
              </View>

              <View style={styles.workoutCountContainer}>
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={12}
                  color="#666"
                />
                <Text style={styles.workoutCountText}>
                  {day.totalWorkoutsCompleted}/{day.totalWorkoutsAssigned}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>100%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>66-99%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>33-65%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e0e0e0' }]} />
          <Text style={styles.legendText}>0%</Text>
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
  scrollView: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 10,
  },
  dayCard: {
    width: 110,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  dayCardEmpty: {
    backgroundColor: '#f5f5f5',
  },
  todayCard: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    backgroundColor: '#f1f8f5',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  circleToday: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  workoutCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  workoutCountText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 8,
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
