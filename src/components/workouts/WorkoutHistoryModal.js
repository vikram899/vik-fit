import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWeeklyWorkoutBreakdown, getSundayOfWeek } from '../../services/workoutStats';
import { modalStyles, COLORS } from '../../styles';

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
      console.error('Error loading workout history:', error);
    } finally {
      setLoading(false);
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
    setRefreshing(false);
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

  const handleToday = () => {
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
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={modalStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={modalStyles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[modalStyles.content, { maxHeight: '90%' }]}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={modalStyles.title}>Workout History</Text>
                </View>

                {/* Week Navigation */}
                <View style={styles.weekNavigation}>
                  <TouchableOpacity onPress={handlePreviousWeek} style={styles.navButton}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.primary} />
                  </TouchableOpacity>

                  <View style={styles.weekLabel}>
                    <Text style={styles.weekLabelText}>{weekLabel}</Text>
                  </View>

                  <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                {/* Today Button */}
                <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
                  <MaterialCommunityIcons name="calendar-today" size={16} color="#fff" />
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>

                {/* Daily Breakdown */}
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
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
                      <Text style={styles.emptyText}>No data available</Text>
                    </View>
                  ) : (
                    weeklyBreakdown.map((day) => (
                      <View key={day.date} style={styles.dayCard}>
                        <View style={styles.dayHeader}>
                          <Text style={styles.dayTitle}>
                            {day.day} - {day.date}
                          </Text>
                        </View>

                        <View style={styles.dayDetails}>
                          <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>Workouts</Text>
                              <Text style={styles.detailValue}>
                                {day.totalWorkoutsCompleted}/{day.totalWorkoutsAssigned}
                              </Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={styles.detailLabel}>Exercises</Text>
                              <Text style={styles.detailValue}>
                                {day.completedWorkouts.reduce((sum, w) => sum + (w.exerciseCount || 0), 0)}
                              </Text>
                            </View>
                          </View>

                          {/* Workouts List */}
                          {day.completedWorkouts.length > 0 && (
                            <View style={styles.workoutsList}>
                              <Text style={styles.workoutsLabel}>Completed Workouts:</Text>
                              {day.completedWorkouts.map((workout, idx) => (
                                <View key={idx} style={styles.workoutItem}>
                                  <MaterialCommunityIcons
                                    name="check-circle"
                                    size={16}
                                    color={COLORS.success}
                                    style={styles.workoutIcon}
                                  />
                                  <View style={styles.workoutInfo}>
                                    <Text style={styles.workoutName}>{workout.name}</Text>
                                    <Text style={styles.workoutExercises}>
                                      {workout.exerciseCount || 0} exercises
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Assigned but not completed */}
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
                                      style={styles.missedIcon}
                                    />
                                    <View style={styles.missedInfo}>
                                      <Text style={styles.missedName}>{workout.name}</Text>
                                    </View>
                                  </View>
                                ))}
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* Close Button */}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  <Text style={styles.closeButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
  },
  weekLabel: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    marginBottom: 12,
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  dayCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  dayHeader: {
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  dayDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  workoutsList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  workoutsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 6,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  workoutIcon: {
    width: 20,
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
    borderTopColor: '#ddd',
  },
  missedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 6,
  },
  missedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  missedIcon: {
    width: 20,
  },
  missedInfo: {
    flex: 1,
  },
  missedName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default WorkoutHistoryModal;
