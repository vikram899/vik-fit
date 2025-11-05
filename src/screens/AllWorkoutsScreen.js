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
import { AllWorkoutsEmptyState } from '../components/workouts';
import { COLORS, SPACING, TYPOGRAPHY } from '../shared/constants';
import {
  getAllWorkouts,
  getScheduledDaysForWorkout,
  assignWorkoutToDays,
  deleteWorkout,
} from '../services/database';
import {
  getPlanExerciseCount,
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
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedWorkoutForAssign, setSelectedWorkoutForAssign] = useState(null);
  const [scheduledDays, setScheduledDays] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);

      const plans = await getAllWorkouts();
      setWorkouts(plans);

      const daysMap = {};
      for (const plan of plans) {
        const days = await getScheduledDaysForWorkout(plan.id);
        daysMap[plan.id] = days;
      }
      setScheduledDays(daysMap);

      const exerciseCountsMap = {};
      for (const plan of plans) {
        const count = await getPlanExerciseCount(plan.id);
        exerciseCountsMap[plan.id] = count;
      }
      setExerciseCounts(exerciseCountsMap);

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
  }, [fadeAnim]);

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
      await assignWorkoutToDays(selectedWorkoutForAssign.id, selectedDays);
      setAssignModalVisible(false);
      setSelectedWorkoutForAssign(null);
      loadWorkouts();
      Alert.alert('Success', 'Workout schedule updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save plan schedule');
    }
  };

  const handleViewExercises = (workout) => {
    navigation.navigate('ExecuteWorkout', { workoutId: workout.id });
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
              await deleteWorkout(workout.id);
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
            <AllWorkoutsEmptyState
              hasAnyWorkouts={workouts.length > 0}
              onCreatePress={() => navigation.navigate('CreatePlan')}
            />
          ) : (
            filteredWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                exerciseCount={exerciseCounts[workout.id] || 0}
                scheduledDays={scheduledDays[workout.id] || []}
                onViewExercises={handleViewExercises}
                onMenuPress={handleWorkoutMenu}
              />
            ))
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
    backgroundColor: COLORS.background,
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
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
  },
});
