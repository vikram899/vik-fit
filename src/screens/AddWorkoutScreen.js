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
import AssignDaysModal from '../components/AssignDaysModal';
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
 * AddWorkoutScreen
 * Shows all available workouts with search, filter, and sort functionality
 */
export default function AddWorkoutScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('name');
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
      console.error('Error loading workouts:', error);
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

    if (filterOption === 'assigned') {
      filtered = filtered.filter(w => (scheduledDays[w.id] || []).length > 0);
    } else if (filterOption === 'unassigned') {
      filtered = filtered.filter(w => (scheduledDays[w.id] || []).length === 0);
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
  }, [workouts, searchText, filterOption, sortOption, scheduledDays]);

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
      console.error('Error saving plan schedule:', error);
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
              Alert.alert('Success', 'Workout deleted!');
            } catch (error) {
              console.error('Error deleting workout:', error);
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
                      <Text style={styles.daysDisplay}>
                        {getScheduledDaysDisplay(workout.id)}
                      </Text>
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

                  {/* Action Button */}
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewExercises(workout)}
                  >
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.viewButtonText}>View Exercises</Text>
                  </TouchableOpacity>
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
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
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
