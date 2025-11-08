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
import {
  WorkoutTabNavigation,
  WorkoutEmptyState,
} from '../components/workouts';
import { COLORS, SPACING, TYPOGRAPHY } from '../shared/constants';
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
        <WorkoutTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          todayWorkoutCount={todaysWorkouts.length}
        />

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
              <WorkoutEmptyState type="no-assigned" />
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
                  <WorkoutEmptyState
                    type={workouts.length === 0 ? "no-created" : "no-found"}
                  />
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
    backgroundColor: COLORS.mainBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.container,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
  },
  todaySection: {
    paddingVertical: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  allWorkoutsSection: {
    paddingHorizontal: 0,
  },
});
