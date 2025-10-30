import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWeeklyWorkoutBreakdown, getSundayOfWeek } from '../../services/workoutStats';
import { COLORS } from '../../styles';

const WorkoutHistoryModal = ({ visible, onClose }) => {
  const [currentSunday, setCurrentSunday] = useState(
    getSundayOfWeek(new Date().toISOString().split('T')[0])
  );
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load workout breakdown
  const loadWorkoutHistory = async () => {
    try {
      setLoading(true);
      const breakdown = await getWeeklyWorkoutBreakdown(currentSunday);
      setWeeklyBreakdown(breakdown);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadWorkoutHistory();
    }
  }, [visible, currentSunday]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutHistory();
  };

  const handlePreviousWeek = () => {
    const prevSunday = new Date(currentSunday);
    prevSunday.setDate(prevSunday.getDate() - 7);
    setCurrentSunday(prevSunday.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextSunday = new Date(currentSunday);
    nextSunday.setDate(nextSunday.getDate() + 7);
    setCurrentSunday(nextSunday.toISOString().split('T')[0]);
  };

  const handleTodayWeek = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentSunday(getSundayOfWeek(today));
  };

  // Format week label with month/day
  const formatDateRange = () => {
    const sundayDate = new Date(currentSunday);
    const saturdayDate = new Date(sundayDate);
    saturdayDate.setDate(saturdayDate.getDate() + 6);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sundayMonth = monthNames[sundayDate.getMonth()];
    const sundayDay = sundayDate.getDate();
    const saturdayMonth = monthNames[saturdayDate.getMonth()];
    const saturdayDay = saturdayDate.getDate();

    if (sundayMonth === saturdayMonth) {
      return `${sundayMonth} ${sundayDay} - ${saturdayDay}`;
    } else {
      return `${sundayMonth} ${sundayDay} - ${saturdayMonth} ${saturdayDay}`;
    }
  };

  const weekLabel = formatDateRange();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout History</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            onPress={handlePreviousWeek}
            style={styles.navButton}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <View style={styles.weekLabelContainer}>
            <Text style={styles.weekLabelText}>{weekLabel}</Text>
          </View>

          <TouchableOpacity
            onPress={handleNextWeek}
            style={styles.navButton}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Today Button */}
        <View style={styles.todayButtonContainer}>
          <TouchableOpacity
            onPress={handleTodayWeek}
            style={styles.todayButton}
          >
            <MaterialCommunityIcons name="calendar-today" size={14} color="#fff" />
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Breakdown List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : weeklyBreakdown.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={48}
                color="#ccc"
              />
              <Text style={styles.emptyText}>No workouts logged this week</Text>
            </View>
          ) : (
            weeklyBreakdown.map((day) => (
              <View key={day.date} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={styles.dayName}>{day.day}</Text>
                    <Text style={styles.dayDate}>{day.date}</Text>
                  </View>
                  <Text style={styles.dayWorkouts}>
                    {day.totalWorkoutsCompleted}/{day.totalWorkoutsAssigned}
                  </Text>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="dumbbell"
                      size={16}
                      color="#2196F3"
                    />
                    <Text style={styles.statLabel}>Workouts</Text>
                    <Text style={styles.statValue}>{day.totalWorkoutsCompleted}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={16}
                      color="#FF9800"
                    />
                    <Text style={styles.statLabel}>Exercises</Text>
                    <Text style={styles.statValue}>{day.totalExercisesCompleted}</Text>
                  </View>
                </View>

                {/* Completed Workouts List */}
                {day.completedWorkouts.length > 0 && (
                  <View style={styles.workoutsList}>
                    <Text style={styles.workoutsLabel}>Completed:</Text>
                    {day.completedWorkouts.map((workout, idx) => (
                      <View key={idx} style={styles.workoutItem}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={16}
                          color="#4CAF50"
                        />
                        <View style={styles.workoutInfo}>
                          <Text style={styles.workoutName}>{workout.name}</Text>
                          <Text style={styles.workoutExercises}>
                            {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Scheduled but not completed */}
                {day.assignedWorkouts.length > day.completedWorkouts.length && (
                  <View style={styles.missedList}>
                    <Text style={styles.missedLabel}>Scheduled (Not Done):</Text>
                    {day.assignedWorkouts
                      .filter(
                        (assigned) =>
                          !day.completedWorkouts.some((completed) => completed.id === assigned.id)
                      )
                      .map((workout, idx) => (
                        <View key={idx} style={styles.missedItem}>
                          <MaterialCommunityIcons
                            name="circle-outline"
                            size={16}
                            color="#ccc"
                          />
                          <Text style={styles.missedName}>{workout.name}</Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
  },
  weekLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  todayButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  dayCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  dayDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  dayWorkouts: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  workoutsList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  workoutsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  workoutExercises: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  missedList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  missedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  missedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  missedName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  doneButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default WorkoutHistoryModal;
