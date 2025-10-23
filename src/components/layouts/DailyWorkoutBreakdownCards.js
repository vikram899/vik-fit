import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles';

/**
 * DailyWorkoutBreakdownCards Component
 * Shows which specific workouts were completed each day
 */
const DailyWorkoutBreakdownCards = ({ weeklyData, expandAll = false }) => {
  const [expandedDays, setExpandedDays] = useState(new Set());

  // Update expanded state when expandAll changes
  useEffect(() => {
    if (expandAll) {
      // Expand all days
      setExpandedDays(new Set(weeklyData.map((_, index) => index)));
    } else {
      // Collapse all days
      setExpandedDays(new Set());
    }
  }, [expandAll, weeklyData]);

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDays(newExpanded);
  };

  return (
    <View style={styles.container}>
      {weeklyData.map((day, index) => {
        const isExpanded = expandedDays.has(index);
        const hasWorkouts = day.completedWorkouts && day.completedWorkouts.length > 0;

        return (
          <TouchableOpacity
            key={day.date}
            style={styles.dayCard}
            onPress={() => toggleExpand(index)}
          >
            <View style={styles.dayHeader}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>{day.day}</Text>
                <Text style={styles.dayDate}>{day.date}</Text>
              </View>
              <View style={styles.dayStats}>
                {hasWorkouts && (
                  <View style={styles.workoutCountBadge}>
                    <MaterialCommunityIcons
                      name="dumbbell"
                      size={14}
                      color="#007AFF"
                    />
                    <Text style={styles.workoutCountText}>
                      {day.totalWorkoutsCompleted}
                    </Text>
                  </View>
                )}
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={hasWorkouts ? COLORS.primary : '#999'}
                />
              </View>
            </View>

            {!hasWorkouts && (
              <Text style={styles.noWorkoutsText}>No workouts completed</Text>
            )}

            {isExpanded && hasWorkouts && (
              <View style={styles.dayContent}>
                {day.completedWorkouts.map((workout, idx) => (
                  <View key={idx} style={styles.workoutItem}>
                    <View style={styles.workoutLeft}>
                      <MaterialCommunityIcons
                        name="dumbbell"
                        size={16}
                        color={COLORS.primary}
                      />
                      <View style={styles.workoutInfo}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <Text style={styles.exerciseCount}>
                          {workout.exerciseCount} {workout.exerciseCount === 1 ? 'exercise' : 'exercises'}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color="#4CAF50"
                    />
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  noWorkoutsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  dayContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  workoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exerciseCount: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
});

export default DailyWorkoutBreakdownCards;
