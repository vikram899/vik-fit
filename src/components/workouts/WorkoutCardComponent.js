import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles';

/**
 * WorkoutCard - Reusable workout card component
 * Used in both AllWorkoutsScreen and LogWorkoutScreen
 */
const WorkoutCard = ({
  workout,
  exerciseCount = 0,
  scheduledDays = [],
  onViewExercises,
  onMenuPress
}) => {
  const getScheduledDaysArray = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (scheduledDays.length === 0) {
      return null;
    }
    return scheduledDays.map(d => dayNames[d]);
  };

  return (
    <View style={styles.workoutCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <View style={styles.daysContainer}>
            {getScheduledDaysArray() ? (
              getScheduledDaysArray().map((day, index) => (
                <View key={index} style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{day}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noDaysBadge}>
                <MaterialCommunityIcons
                  name="calendar-remove"
                  size={14}
                  color="#999"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.noDaysText}>No days assigned</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onMenuPress(workout)}
          style={styles.kebabButton}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Exercise Count - Clickable */}
      <TouchableOpacity
        style={styles.exerciseCountContainer}
        onPress={() => onViewExercises(workout)}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseIconBox}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={18}
            color="#fff"
          />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseCount}>
            {exerciseCount}
          </Text>
          <Text style={styles.exerciseLabel}>
            {exerciseCount === 1 ? 'Exercise' : 'Exercises'}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  dayBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  noDaysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noDaysText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
  },
  kebabButton: {
    padding: 8,
    marginRight: -8,
  },
  exerciseCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#EEF5FF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    justifyContent: 'space-between',
  },
  exerciseIconBox: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseCount: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  exerciseLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default WorkoutCard;
