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
import { COLORS } from '../styles';
import {
  getAllPlans,
  getScheduledDaysForPlan,
  assignPlanToDays,
  deletePlan,
} from '../services/database';
import {
  getWeeklyWorkoutCompletions,
  getPlanExerciseCount,
  getSundayOfWeek,
  calculateCompletionPercentage,
} from '../services/workoutStats';

/**
 * AllWorkoutsScreen
 * Shows all available workouts with search, filter, and sort functionality
 */
export default function AllWorkoutsScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
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
  const [completionCounts, setCompletionCounts] = useState({});
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedWorkoutForAssign, setSelectedWorkoutForAssign] = useState(null);
  const [scheduledDays, setScheduledDays] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const weekStartDate = getSundayOfWeek(new Date().toISOString().split('T')[0]);

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);

      const plans = await getAllPlans();
      setWorkouts(plans);

      const daysMap = {};
      for (const plan of plans) {
        const days = await getScheduledDaysForPlan(plan.id);
        daysMap[plan.id] = days;
      }
      setScheduledDays(daysMap);

      const exerciseCountsMap = {};
      for (const plan of plans) {
        const count = await getPlanExerciseCount(plan.id);
        exerciseCountsMap[plan.id] = count;
      }
      setExerciseCounts(exerciseCountsMap);

      const completionCountsMap = {};
      for (const plan of plans) {
        const count = await getWeeklyWorkoutCompletions(plan.id, weekStartDate);
        completionCountsMap[plan.id] = count;
      }
      setCompletionCounts(completionCountsMap);

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

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...workouts];

    if (searchText.trim()) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

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

  React.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleAssignDays = (workout) => {
    setSelectedWorkoutForAssign(workout);
    setAssignModalVisible(true);
  };

  const handleSaveDays = async (selectedDays) => {
    try {
      await assignPlanToDays(selectedWorkoutForAssign.id, selectedDays);
      setAssignModalVisible(false);
      setSelectedWorkoutForAssign(null);
      loadWorkouts();
      Alert.alert('Success', 'Workout schedule updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save plan schedule');
    }
  };

  const handleViewExercises = (workout) => {
    navigation.navigate('ExecuteWorkout', { planId: workout.id });
  };

  const handleDeleteWorkout = (workout) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deletePlan(workout.id);
              loadWorkouts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleWorkoutMenu = (workout) => {
    Alert.alert(
      'Workout Options',
      workout.name,
      [
        {
          text: 'Assign Days',
          onPress: () => handleAssignDays(workout),
        },
        {
          text: 'View Exercises',
          onPress: () => handleViewExercises(workout),
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteWorkout(workout),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const getScheduledDaysArray = (workoutId) => {
    const days = scheduledDays[workoutId] || [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (days.length === 0) {
      return null;
    }
    return days.map(d => dayNames[d]);
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
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

          {/* Workouts List */}
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
              {workouts.length === 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreatePlan')}
                  style={styles.emptyStateButton}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                  <Text style={styles.emptyStateButtonText}>Create Workout</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredWorkouts.map(workout => {
              const progress = getCompletionProgress(workout.id);
              const exerciseCount = exerciseCounts[workout.id] || 0;

              return (
                <View key={workout.id} style={styles.workoutCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <View style={styles.daysContainer}>
                        {getScheduledDaysArray(workout.id) ? (
                          getScheduledDaysArray(workout.id).map((day, index) => (
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
                      onPress={() => handleWorkoutMenu(workout)}
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
                    onPress={() => handleViewExercises(workout)}
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

                </View>
              );
            })
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
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
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  viewButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});
