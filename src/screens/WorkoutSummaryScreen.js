import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles';
import { getWorkoutSummary } from '../services/database';

/**
 * WorkoutSummaryScreen
 * Shows detailed summary of completed workout with all exercises, sets, reps, weights, rest times
 */
export default function WorkoutSummaryScreen({ navigation, route }) {
  const { workoutLogId } = route.params;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getWorkoutSummary(workoutLogId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
      Alert.alert('Error', 'Failed to load workout summary');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReturnToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LogWorkout' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Failed to load workout summary</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { workout, exercises, stats } = summary;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="check-circle" size={40} color="#4CAF50" />
          <Text style={styles.headerTitle}>Workout Complete!</Text>
          <Text style={styles.workoutName}>{workout.planName}</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock" size={24} color={COLORS.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Time</Text>
              <Text style={styles.statValue}>{formatTime(stats.totalDuration)}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={COLORS.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Sets Completed</Text>
              <Text style={styles.statValue}>{stats.totalSets}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="timer" size={24} color={COLORS.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Rest Time</Text>
              <Text style={styles.statValue}>{formatTime(stats.totalRestTime)}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="run" size={24} color={COLORS.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Exercise Time</Text>
              <Text style={styles.statValue}>{formatTime(stats.totalExerciseTime)}</Text>
            </View>
          </View>
        </View>

        {/* Exercises Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Exercise Breakdown</Text>

          {exercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseSets}>{exercise.sets.length} sets</Text>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <View style={styles.setNumber}>
                    <Text style={styles.setNumberText}>Set {set.setNumber}</Text>
                  </View>

                  <View style={styles.setDetails}>
                    <View style={styles.setDetail}>
                      <Text style={styles.setLabel}>Reps</Text>
                      <Text style={styles.setValue}>{set.repsCompleted}</Text>
                    </View>

                    <View style={styles.setDetail}>
                      <Text style={styles.setLabel}>Weight</Text>
                      <Text style={styles.setValue}>{set.weightUsed} kg</Text>
                    </View>

                    <View style={styles.setDetail}>
                      <Text style={styles.setLabel}>Duration</Text>
                      <Text style={styles.setValue}>{formatTime(set.durationSeconds)}</Text>
                    </View>

                    <View style={styles.setDetail}>
                      <Text style={styles.setLabel}>Rest</Text>
                      <Text style={styles.setValue}>{formatTime(set.restTimeUsedSeconds)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleReturnToHome}>
            <MaterialCommunityIcons name="home" size={20} color="#fff" />
            <Text style={styles.buttonText}>Back to Workouts</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
  },
  workoutName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 24,
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    width: '48%',
  },
  statContent: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  exerciseSets: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  setRow: {
    marginBottom: 8,
  },
  setNumber: {
    marginBottom: 6,
  },
  setNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  setDetails: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  setDetail: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  setLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  setValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
