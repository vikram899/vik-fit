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
import { getWeeklyWorkoutBreakdown, getMondayOfWeek } from '../../services/workoutStats';
import { COLORS, SPACING, TYPOGRAPHY } from '../../shared/constants';

const WorkoutHistoryModal = ({ visible, onClose }) => {
  const [currentMonday, setCurrentSunday] = useState(
    getMondayOfWeek(new Date().toISOString().split('T')[0])
  );
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load workout breakdown
  const loadWorkoutHistory = async () => {
    try {
      setLoading(true);
      const breakdown = await getWeeklyWorkoutBreakdown(currentMonday);
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
  }, [visible, currentMonday]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutHistory();
  };

  const handlePreviousWeek = () => {
    const prevSunday = new Date(currentMonday);
    prevSunday.setDate(prevSunday.getDate() - 7);
    setCurrentSunday(prevSunday.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextSunday = new Date(currentMonday);
    nextSunday.setDate(nextSunday.getDate() + 7);
    setCurrentSunday(nextSunday.toISOString().split('T')[0]);
  };

  const handleTodayWeek = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentSunday(getMondayOfWeek(today));
  };

  // Format week label with month/day
  const formatDateRange = () => {
    const sundayDate = new Date(currentMonday);
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
                color={COLORS.mediumGray}
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
                      color={COLORS.primary}
                    />
                    <Text style={styles.statLabel}>Workouts</Text>
                    <Text style={styles.statValue}>{day.totalWorkoutsCompleted}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={16}
                      color={COLORS.warning}
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
                          color={COLORS.success}
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
                            color={COLORS.mediumGray}
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
    backgroundColor: COLORS.mainBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  closeButton: {
    padding: SPACING.small,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.secondaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  navButton: {
    padding: SPACING.small,
  },
  weekLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabelText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  todayButtonContainer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.element,
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadiusSmall,
  },
  todayButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
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
    paddingVertical: SPACING.container,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.container,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.medium,
  },
  dayCard: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  dayName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  dayDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  dayWorkouts: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusSmall,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  workoutsList: {
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  workoutsLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
    marginBottom: SPACING.small,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.small,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  workoutExercises: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  missedList: {
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  missedLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.error,
    marginBottom: SPACING.small,
  },
  missedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.small,
  },
  missedName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.element,
    borderRadius: SPACING.borderRadiusSmall,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});

export default WorkoutHistoryModal;
