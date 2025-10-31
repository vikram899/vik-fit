import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AssignDaysModal } from '../components/modals';
import { SearchFilterSort } from '../components/meals';
import WorkoutCard from '../components/workouts/WorkoutCardComponent';
import { COLORS } from '../styles';
import {
  getAllWorkouts,
  getScheduledDaysForWorkout,
  assignWorkoutToDays,
  deleteWorkout,
  getWorkoutsForDay,
  getTodayActiveWorkout,
  getTodayWorkoutLogForWorkout,
  removeWorkoutFromDays,
  startWorkoutLog,
  deleteWorkoutLog,
} from '../services/database';
import {
  getPlanExerciseCount,
  getMondayOfWeek,
} from '../services/workoutStats';

/**
 * LogWorkoutScreen
 * Shows today's scheduled workouts + all workouts library with search/filter
 */
export default function LogWorkoutScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [filterOptions, setFilterOptions] = useState({
    difficulty: false,
    duration: false,
    muscleGroup: false,
    equipment: false,
  });
  const [exerciseCounts, setExerciseCounts] = useState({});
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedWorkoutForAssign, setSelectedWorkoutForAssign] = useState(null);
  const [scheduledDays, setScheduledDays] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'all'
  const [todayWorkoutLogs, setTodayWorkoutLogs] = useState({}); // Map of planId -> workoutLog

  const todayDayOfWeek = new Date().getDay();
  const weekStartDate = getMondayOfWeek(new Date().toISOString().split('T')[0]);

  // Load all workouts and today's workouts
  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);

      // Get all workouts
      const workouts = await getAllWorkouts();
      setWorkouts(workouts);

      // Get today's workouts - combine scheduled workouts + workouts with logs for today
      const currentDayOfWeek = new Date().getDay();
      const scheduledWorkouts = await getWorkoutsForDay(currentDayOfWeek);

      // Get all workouts and find ones with logs for today
      const today = new Date().toISOString().split('T')[0];
      const todayLogsMap = {};
      for (const workout of workouts) {
        const log = await getTodayWorkoutLogForWorkout(workout.id);
        if (log) {
          todayLogsMap[workout.id] = true;
        }
      }

      // Combine scheduled workouts with workouts that have logs for today
      const combinedTodayWorkouts = [];
      const addedIds = new Set();

      // Add scheduled workouts
      for (const workout of scheduledWorkouts) {
        combinedTodayWorkouts.push(workout);
        addedIds.add(workout.id);
      }

      // Add workouts with logs that aren't already scheduled
      for (const workout of workouts) {
        if (todayLogsMap[workout.id] && !addedIds.has(workout.id)) {
          combinedTodayWorkouts.push(workout);
          addedIds.add(workout.id);
        }
      }

      // Get today's workout logs to check completion status
      const logsMapForSorting = {};
      for (const workout of combinedTodayWorkouts) {
        const log = await getTodayWorkoutLogForWorkout(workout.id);
        if (log) {
          logsMapForSorting[workout.id] = log;
        }
      }

      // Sort: incomplete workouts first, completed ones at the end
      combinedTodayWorkouts.sort((a, b) => {
        const aCompleted = logsMapForSorting[a.id]?.status === 'completed' ? 1 : 0;
        const bCompleted = logsMapForSorting[b.id]?.status === 'completed' ? 1 : 0;
        return aCompleted - bCompleted;
      });

      setTodaysWorkouts(combinedTodayWorkouts);

      // Get scheduled days for each workout
      const daysMap = {};
      for (const workout of workouts) {
        const days = await getScheduledDaysForWorkout(workout.id);
        daysMap[workout.id] = days;
      }
      setScheduledDays(daysMap);

      // Get exercise counts for each workout
      const exerciseCountsMap = {};
      for (const workout of workouts) {
        const count = await getPlanExerciseCount(workout.id);
        exerciseCountsMap[workout.id] = count;
      }
      setExerciseCounts(exerciseCountsMap);

      // Get today's workout logs for all workouts (use already-loaded logs for today's workouts)
      const workoutLogsMap = { ...logsMapForSorting };
      // Get logs for the remaining workouts that aren't in today's list
      for (const workout of workouts) {
        if (!workoutLogsMap[workout.id]) {
          const log = await getTodayWorkoutLogForWorkout(workout.id);
          if (log) {
            workoutLogsMap[workout.id] = log;
          }
        }
      }
      // Always set the logs map, even if empty (to clear old logs)
      setTodayWorkoutLogs(workoutLogsMap);

      // Trigger fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, [weekStartDate, fadeAnim]);

  // Load workouts when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  // Search and filter workouts
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...workouts];

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    if (sortOption === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'assigned') {
      filtered.sort((a, b) => {
        const aDays = (scheduledDays[a.id] || []).length;
        const bDays = (scheduledDays[b.id] || []).length;
        return bDays - aDays;
      });
    } else if (sortOption === 'recent') {
      filtered.reverse();
    }

    setFilteredWorkouts(filtered);
  }, [workouts, searchText, sortOption, scheduledDays]);

  // Trigger filter/sort when dependencies change
  React.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleAssignDays = (workout) => {
    setSelectedWorkoutForAssign(workout);
    setAssignModalVisible(true);
  };

  const handleSaveDays = async (workoutIdOrSelectedDays, daysOverride = null) => {
    try {
      // If called with (workoutId, days), use those directly
      if (typeof workoutIdOrSelectedDays === 'number' && daysOverride !== null) {
        await assignWorkoutToDays(workoutIdOrSelectedDays, daysOverride);
        loadWorkouts();
      } else {
        // Original behavior: called from modal with selected days
        await assignWorkoutToDays(selectedWorkoutForAssign.id, workoutIdOrSelectedDays);
        setAssignModalVisible(false);
        setSelectedWorkoutForAssign(null);
        await loadWorkouts();
        Alert.alert('Success', 'Workout schedule updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout schedule');
    }
  };

  const handleViewExercises = (workout) => {
    navigation.navigate('ExecuteWorkout', { workoutId: workout.id, workoutName: workout.name });
  };

  const handleStartWorkout = async (workout) => {
    try {
      // Check if there's already a workout in progress
      const activeWorkout = await getTodayActiveWorkout();

      if (activeWorkout && activeWorkout.workoutId !== workout.id) {
        // There's a different workout in progress
        Alert.alert(
          'Workout Already Scheduled',
          `There is already a workout scheduled: "${activeWorkout.workoutName}". Do you still want to start "${workout.name}"?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Yes, Start',
              onPress: () => {
                navigation.navigate('StartWorkout', { workoutId: workout.id });
              },
            },
          ]
        );
      } else {
        // No conflict, start the workout
        navigation.navigate('StartWorkout', { workoutId: workout.id });
      }
    } catch (error) {
      // If there's an error, just start the workout
      navigation.navigate('StartWorkout', { workoutId: workout.id });
    }
  };

  const handleViewWorkoutSummary = async (workout) => {
    try {
      const log = todayWorkoutLogs[workout.id];
      if (log && log.id) {
        navigation.navigate('WorkoutSummary', { workoutLogId: log.id });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to view workout summary');
    }
  };

  const handleRemoveFromToday = async (workout) => {
    const todayDayOfWeek = new Date().getDay();
    const isScheduled = scheduledDays[workout.id]?.includes(todayDayOfWeek);
    const hasLog = todayWorkoutLogs[workout.id] !== undefined;

    let alertMessage = '';
    let onRemove = async () => {};

    // If it has a log but is NOT scheduled for today, it's ad-hoc
    if (hasLog && !isScheduled) {
      // Ad-hoc workout (only has a log, not in weekly schedule)
      alertMessage = `Are you sure you want to remove "${workout.name}" from today's schedule?`;
      onRemove = async () => {
        try {
          await deleteWorkoutLog(workout.id);
          await loadWorkouts();
        } catch (error) {
          Alert.alert('Error', 'Failed to remove workout');
        }
      };
    } else {
      // Scheduled workout (part of weekly schedule)
      alertMessage = `Are you sure you want to remove "${workout.name}" from today's workout schedule? It will still appear next week.`;
      onRemove = async () => {
        try {
          await removeWorkoutFromDays(workout.id, [todayDayOfWeek]);
          await loadWorkouts();
        } catch (error) {
          Alert.alert('Error', 'Failed to remove workout');
        }
      };
    }

    Alert.alert('Remove from Today', alertMessage, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        onPress: onRemove,
        style: 'destructive',
      },
    ]);
  };

  const handleWorkoutMenu = (workout, isToday = false) => {
    if (isToday) {
      // For today's workouts, show: Remove, View Exercises, Cancel
      Alert.alert(
        'Workout Options',
        workout.name,
        [
          {
            text: 'Remove',
            onPress: () => handleRemoveFromToday(workout),
            style: 'destructive',
          },
          {
            text: 'View Exercises',
            onPress: () => handleViewExercises(workout),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      // For all workouts, show: View Exercises, Add to Today's Schedule, Cancel
      Alert.alert(
        'Workout Options',
        workout.name,
        [
          {
            text: 'View Exercises',
            onPress: () => handleViewExercises(workout),
          },
          {
            text: 'Add to Today\'s Schedule',
            onPress: async () => {
              try {
                // Check if there's already a workout log for today
                const todayLog = await getTodayWorkoutLogForWorkout(workout.id);
                if (todayLog) {
                  Alert.alert('Already Scheduled', `${workout.name} is already scheduled for today.`);
                  return;
                }

                // Create a new workout log for today (not modifying the weekly schedule)
                await startWorkoutLog(workout.id);
                await loadWorkouts();
                Alert.alert('Success', `${workout.name} added to today's schedule!`);
              } catch (error) {
                Alert.alert('Error', 'Failed to add workout to today\'s schedule');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleViewExercisesFromCard = (workout) => {
    navigation.navigate('ExecuteWorkout', { workoutId: workout.id, workoutName: workout.name });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'today' && styles.tabActive]}
            onPress={() => setActiveTab('today')}
          >
            <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>
              Today
            </Text>
            {todaysWorkouts.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{todaysWorkouts.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All Workouts
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {activeTab === 'today' ? (
            // Today's Workouts Tab
            <>
              {/* Today's Workouts Section */}
              <View style={styles.todaySection}>
            {todaysWorkouts.length > 0 ? (
              todaysWorkouts.map(workout => {
                const isCompleted = todayWorkoutLogs[workout.id]?.status === 'completed';
                return (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    exerciseCount={exerciseCounts[workout.id] || 0}
                    scheduledDays={scheduledDays[workout.id] || []}
                    onViewExercises={handleViewExercisesFromCard}
                    onMenuPress={(w) => handleWorkoutMenu(w, true)}
                    onStart={handleStartWorkout}
                    onViewSummary={handleViewWorkoutSummary}
                    showStartButton={true}
                    isCompleted={isCompleted}
                    showDayTags={false}
                  />
                );
              })
            ) : (
              <View style={styles.noWorkoutAssignedContainer}>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={48}
                  color="#FF9800"
                />
                <Text style={styles.noWorkoutAssignedText}>No Workouts Assigned for Today</Text>
              </View>
            )}
          </View>

            </>
          ) : (
            // All Workouts Tab
            <>
              {/* Search, Filter, Sort */}
              <SearchFilterSort
                searchText={searchText}
                onSearchChange={setSearchText}
                sortOption={sortOption}
                onSortChange={setSortOption}
                filterOptions={filterOptions}
                onFilterChange={setFilterOptions}
                searchPlaceholder="Search workouts..."
                filterLabels={{
                  difficulty: "Difficulty",
                  duration: "Duration",
                  muscleGroup: "Muscle Group",
                  equipment: "Equipment",
                }}
                filterAlertTitle="Filter Workouts"
                sortOptions={[
                  { value: "name", label: "Name (A-Z)" },
                  { value: "assigned", label: "Most Assigned" },
                  { value: "recent", label: "Recently Created" },
                ]}
                sortAlertTitle="Sort Workouts"
              />

              {/* All Workouts Section */}
              <View style={styles.allWorkoutsSection}>
                {filteredWorkouts.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <MaterialCommunityIcons
                      name="dumbbell"
                      size={64}
                      color="#ccc"
                    />
                    <Text style={styles.emptyStateTitle}>
                      {workouts.length === 0 ? 'No Workouts Created' : 'No Workouts Found'}
                    </Text>
                    <Text style={styles.emptyStateSubtitle}>
                      {workouts.length === 0
                        ? 'Create your first workout routine'
                        : 'Try adjusting your search or filters'}
                    </Text>
                  </View>
                ) : (
                  filteredWorkouts.map(workout => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      exerciseCount={exerciseCounts[workout.id] || 0}
                      scheduledDays={scheduledDays[workout.id] || []}
                      onViewExercises={handleViewExercisesFromCard}
                      onMenuPress={(w) => handleWorkoutMenu(w, false)}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>

      {/* Assign Days Modal */}
      <AssignDaysModal
        visible={assignModalVisible}
        planName={selectedWorkoutForAssign?.name || ''}
        selectedDays={scheduledDays[selectedWorkoutForAssign?.id] || []}
        onSave={handleSaveDays}
        onClose={() => {
          setAssignModalVisible(false);
          setSelectedWorkoutForAssign(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    gap: 6,
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  optionButton: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  optionButtonSubtitle: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  todaySection: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  noWorkoutAssignedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    gap: 12,
  },
  noWorkoutAssignedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  todayWorkoutCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 8,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  allWorkoutsSection: {
    paddingHorizontal: 0,
  },
  allWorkoutsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
