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
import { COLORS } from '../styles';
import {
  getAllPlans,
  getScheduledDaysForPlan,
  assignPlanToDays,
  deletePlan,
  getPlansForDay,
  getTodayActiveWorkout,
  getTodayWorkoutLogForPlan,
  removePlanFromDays,
} from '../services/database';
import {
  getWeeklyWorkoutCompletions,
  getPlanExerciseCount,
  getSundayOfWeek,
  calculateCompletionPercentage,
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
  const [filterOption, setFilterOption] = useState('all'); // all, assigned, unassigned
  const [sortOption, setSortOption] = useState('name'); // name, assigned, recent
  const [exerciseCounts, setExerciseCounts] = useState({});
  const [completionCounts, setCompletionCounts] = useState({});
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedWorkoutForAssign, setSelectedWorkoutForAssign] = useState(null);
  const [scheduledDays, setScheduledDays] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'all'
  const [todayWorkoutLogs, setTodayWorkoutLogs] = useState({}); // Map of planId -> workoutLog

  const todayDayOfWeek = new Date().getDay();
  const weekStartDate = getSundayOfWeek(new Date().toISOString().split('T')[0]);

  // Load all workouts and today's workouts
  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);

      // Get all plans
      const plans = await getAllPlans();
      setWorkouts(plans);

      // Get today's workouts
      const todayPlans = await getPlansForDay(todayDayOfWeek);
      setTodaysWorkouts(todayPlans);

      // Get scheduled days for each plan
      const daysMap = {};
      for (const plan of plans) {
        const days = await getScheduledDaysForPlan(plan.id);
        daysMap[plan.id] = days;
      }
      setScheduledDays(daysMap);

      // Get exercise counts for each plan
      const exerciseCountsMap = {};
      for (const plan of plans) {
        const count = await getPlanExerciseCount(plan.id);
        exerciseCountsMap[plan.id] = count;
      }
      setExerciseCounts(exerciseCountsMap);

      // Get completion counts for this week
      const completionCountsMap = {};
      for (const plan of plans) {
        const count = await getWeeklyWorkoutCompletions(plan.id, weekStartDate);
        completionCountsMap[plan.id] = count;
      }
      setCompletionCounts(completionCountsMap);

      // Get today's workout logs for each plan
      const workoutLogsMap = {};
      for (const plan of plans) {
        const log = await getTodayWorkoutLogForPlan(plan.id);
        if (log) {
          workoutLogsMap[plan.id] = log;
        }
      }
      setTodayWorkoutLogs(workoutLogsMap);

      // Trigger fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading workouts:', error);
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

    // Apply status filter
    if (filterOption === 'assigned') {
      filtered = filtered.filter(w => (scheduledDays[w.id] || []).length > 0);
    } else if (filterOption === 'unassigned') {
      filtered = filtered.filter(w => (scheduledDays[w.id] || []).length === 0);
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
  }, [workouts, searchText, filterOption, sortOption, scheduledDays]);

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
        await assignPlanToDays(workoutIdOrSelectedDays, daysOverride);
        loadWorkouts();
      } else {
        // Original behavior: called from modal with selected days
        await assignPlanToDays(selectedWorkoutForAssign.id, workoutIdOrSelectedDays);
        setAssignModalVisible(false);
        setSelectedWorkoutForAssign(null);
        loadWorkouts();
        Alert.alert('Success', 'Workout schedule updated!');
      }
    } catch (error) {
      console.error('Error saving plan schedule:', error);
      Alert.alert('Error', 'Failed to save plan schedule');
    }
  };

  const handleViewExercises = (workout) => {
    navigation.navigate('ExecuteWorkout', { planId: workout.id });
  };

  const handleStartWorkout = async (workout) => {
    try {
      // Check if there's already a workout in progress
      const activeWorkout = await getTodayActiveWorkout();

      if (activeWorkout && activeWorkout.planId !== workout.id) {
        // There's a different workout in progress
        Alert.alert(
          'Workout Already Scheduled',
          `There is already a workout scheduled: "${activeWorkout.planName}". Do you still want to start "${workout.name}"?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Yes, Start',
              onPress: () => {
                navigation.navigate('StartWorkout', { planId: workout.id });
              },
            },
          ]
        );
      } else {
        // No conflict, start the workout
        navigation.navigate('StartWorkout', { planId: workout.id });
      }
    } catch (error) {
      console.error('Error checking active workout:', error);
      // If there's an error, just start the workout
      navigation.navigate('StartWorkout', { planId: workout.id });
    }
  };

  const handleRemoveFromToday = (workout) => {
    const todayDayOfWeek = new Date().getDay();

    Alert.alert(
      'Remove from Today',
      `Are you sure you want to remove "${workout.name}" from today's plan? It will still appear next week.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await removePlanFromDays(workout.id, [todayDayOfWeek]);
              loadWorkouts();
            } catch (error) {
              console.error('Error removing workout:', error);
              Alert.alert('Error', 'Failed to remove workout');
            }
          },
          style: 'destructive',
        },
      ]
    );
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
            onPress: () => {
              const todayDayOfWeek = new Date().getDay();
              if (!scheduledDays[workout.id]?.includes(todayDayOfWeek)) {
                handleSaveDays(workout.id, [...(scheduledDays[workout.id] || []), todayDayOfWeek]);
              } else {
                Alert.alert('Already Scheduled', `${workout.name} is already scheduled for today.`);
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

  const getScheduledDaysDisplay = (workoutId) => {
    const days = scheduledDays[workoutId] || [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[d]).join(', ') || 'Unassigned';
  };

  const getCompletionProgress = (workoutId) => {
    const assigned = (scheduledDays[workoutId] || []).length;
    const completed = completionCounts[workoutId] || 0;
    const percentage = calculateCompletionPercentage(completed, assigned);
    return {
      percentage,
      completed,
      assigned,
      color: percentage >= 90 ? '#4CAF50' : percentage >= 70 ? '#FFC107' : percentage >= 50 ? '#FF9800' : '#FF6B6B',
    };
  };

  const WorkoutCard = ({ workout, isToday = false }) => {
    const progress = getCompletionProgress(workout.id);
    const exerciseCount = exerciseCounts[workout.id] || 0;
    const todayWorkoutLog = todayWorkoutLogs[workout.id];
    const isWorkoutCompleted = todayWorkoutLog && todayWorkoutLog.status === 'completed';

    const handleButtonPress = () => {
      if (isWorkoutCompleted) {
        // Show summary for completed workout
        navigation.navigate('WorkoutSummary', { workoutLogId: todayWorkoutLog.id });
      } else {
        // Start or resume workout
        handleStartWorkout(workout);
      }
    };

    return (
      <View key={workout.id} style={[styles.workoutCard, isToday && styles.todayWorkoutCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            {isToday && (
              <View style={styles.todayBadge}>
                <MaterialCommunityIcons name="star" size={12} color="#fff" />
                <Text style={styles.todayBadgeText}>Today</Text>
              </View>
            )}
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.daysDisplay}>
              {getScheduledDaysDisplay(workout.id)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleWorkoutMenu(workout, isToday)}
            style={styles.kebabButton}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Exercise Count */}
        <View style={styles.exerciseCountContainer}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={14}
            color="#666"
          />
          <Text style={styles.exerciseCount}>
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        {/* Weekly Completion Progress */}
        {progress.assigned > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressLabel}>
              <Text style={styles.progressText}>
                This week: {progress.completed}/{progress.assigned}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress.percentage}%`,
                    backgroundColor: progress.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPercentage, { color: progress.color }]}>
              {Math.round(progress.percentage)}%
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handleViewExercises(workout)}
          >
            <Text style={styles.secondaryButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleButtonPress}
          >
            <MaterialCommunityIcons
              name={isWorkoutCompleted ? 'eye' : 'play'}
              size={18}
              color="#fff"
            />
            <Text style={styles.primaryButtonText}>
              {isWorkoutCompleted ? 'Summary' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="calendar-today"
                size={20}
                color="#FF9800"
              />
              <Text style={styles.sectionTitle}>Today's Workouts</Text>
              {todaysWorkouts.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{todaysWorkouts.length}</Text>
                </View>
              )}
            </View>
            {todaysWorkouts.length > 0 ? (
              todaysWorkouts.map(workout => (
                <WorkoutCard key={workout.id} workout={workout} isToday={true} />
              ))
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
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="#999"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search workouts..."
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholderTextColor="#999"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    style={styles.clearButton}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter and Sort Controls */}
              <View style={styles.controlsContainer}>
                {/* Filter Dropdown */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {
                    Alert.alert(
                      'Filter',
                      'Show workouts:',
                      [
                        {
                          text: 'All',
                          onPress: () => setFilterOption('all'),
                        },
                        {
                          text: 'Assigned Only',
                          onPress: () => setFilterOption('assigned'),
                        },
                        {
                          text: 'Unassigned Only',
                          onPress: () => setFilterOption('unassigned'),
                        },
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                      ]
                    );
                  }}
                >
                  <MaterialCommunityIcons name="filter" size={16} color={COLORS.primary} />
                  <Text style={styles.controlButtonText}>
                    {filterOption === 'all' ? 'All' : filterOption === 'assigned' ? 'Assigned' : 'Unassigned'}
                  </Text>
                </TouchableOpacity>

                {/* Sort Dropdown */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {
                    Alert.alert(
                      'Sort',
                      'Sort by:',
                      [
                        {
                          text: 'Name (A-Z)',
                          onPress: () => setSortOption('name'),
                        },
                        {
                          text: 'Most Assigned',
                          onPress: () => setSortOption('assigned'),
                        },
                        {
                          text: 'Recently Created',
                          onPress: () => setSortOption('recent'),
                        },
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                      ]
                    );
                  }}
                >
                  <MaterialCommunityIcons name="sort" size={16} color={COLORS.primary} />
                  <Text style={styles.controlButtonText}>
                    {sortOption === 'name' ? 'Name' : sortOption === 'assigned' ? 'Most' : 'Recent'}
                  </Text>
                </TouchableOpacity>
              </View>

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
                    <WorkoutCard key={workout.id} workout={workout} isToday={false} />
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
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#fff9f0',
    borderRadius: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ffe0cc',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
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
    paddingHorizontal: 16,
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
  workoutCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  daysDisplay: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  kebabButton: {
    padding: 8,
    marginRight: -8,
  },
  exerciseCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  exerciseCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
