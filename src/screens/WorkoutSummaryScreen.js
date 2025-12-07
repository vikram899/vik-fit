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
import { COLORS, SPACING, TYPOGRAPHY } from '../shared/constants';
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
    backgroundColor: COLORS.mainBackground,
  },
  scrollContent: {
    paddingHorizontal: SPACING.element,
    paddingTop: SPACING.element,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.container,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.medium,
  },
  workoutName: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    marginBottom: SPACING.container,
    gap: SPACING.medium,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.medium,
    gap: SPACING.small,
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  statContent: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  detailsSection: {
    marginBottom: SPACING.container,
  },
  detailsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.medium,
  },
  exerciseCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    paddingBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  exerciseName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  exerciseSets: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  setRow: {
    marginBottom: SPACING.small,
  },
  setNumber: {
    marginBottom: SPACING.xs,
  },
  setNumberText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
  setDetails: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  setDetail: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.tertiaryBackground,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.small,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  setLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  setValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  buttonContainer: {
    marginBottom: SPACING.medium,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadiusLarge,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.element,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.small,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
