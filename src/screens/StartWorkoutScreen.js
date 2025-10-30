import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles';
import {
  getPlanById,
  getExercisesByPlanId,
  startWorkoutLog,
  getActiveWorkoutLog,
  logExerciseSet,
  completeWorkoutLog,
} from '../services/database';

/**
 * StartWorkoutScreen
 * One exercise card at a time with rest timer on top right
 * Pre-filled values from history or exercise defaults
 */
export default function StartWorkoutScreen({ navigation, route }) {
  const { planId } = route.params;

  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workoutLogId, setWorkoutLogId] = useState(null);

  // Current position
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);

  // Form inputs
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  // Rest timer state
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const restTimerRef = useRef(null);

  // Workout timing
  const [workoutStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Logged sets for current exercise
  const [currentExerciseSets, setCurrentExerciseSets] = useState([]);

  // Prevent double-clicking/rapid submissions
  const [isLoggingSet, setIsLoggingSet] = useState(false);

  // Timing tracking
  const [setStartTime, setSetStartTime] = useState(null);
  const [restTimeUsed, setRestTimeUsed] = useState(0);

  // Horizontal scroll ref for exercise list
  const upcomingExercisesScrollRef = useRef(null);

  // Load initial data
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setLoading(true);

          const planData = await getPlanById(planId);
          setPlan(planData);

          const exercisesData = await getExercisesByPlanId(planId);
          setExercises(exercisesData);

          // Check if active workout exists
          const existingLog = await getActiveWorkoutLog(planId);

          if (existingLog) {
            setWorkoutLogId(existingLog.id);
          } else {
            const logId = await startWorkoutLog(planId);
            setWorkoutLogId(logId);
          }

          // Initialize first exercise
          if (exercisesData.length > 0) {
            initializeExercise(exercisesData[0]);
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to load workout');
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [planId])
  );

  // Initialize exercise with pre-filled values
  const initializeExercise = (exercise) => {
    // Pre-fill with exercise defaults
    setRepsInput(exercise.reps?.toString() || '');
    setWeightInput(exercise.weight?.toString() || '');
    setCurrentExerciseSets([]);
    setSetStartTime(new Date()); // Start timing for this set
  };

  // Workout elapsed time effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffMs = now - workoutStartTime;
      const totalSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setElapsedTime(formattedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [workoutStartTime]);

  // Rest timer effect
  React.useEffect(() => {
    if (!isResting) return;

    restTimerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restTimerRef.current);
          setIsResting(false);
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(restTimerRef.current);
  }, [isResting]);

  // Auto-advance to next set when rest finishes
  React.useEffect(() => {
    if (!isResting && currentExerciseSets.length > 0 && restTimeLeft === 90) {
      // Rest timer finished, ready for next set
      // User can now log next set
    }
  }, [isResting]);

  // Auto-scroll horizontal exercise list when exercise changes
  useEffect(() => {
    if (upcomingExercisesScrollRef.current && exercises.length > 0) {
      // Calculate scroll position: each card is ~160px wide + 10px gap
      // We want to scroll to center the current exercise in view
      const cardWidth = 160;
      const gap = 10;
      const totalCardWidth = cardWidth + gap;
      const scrollPosition = Math.max(0, currentExerciseIndex * totalCardWidth - (cardWidth / 2));

      setTimeout(() => {
        upcomingExercisesScrollRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [currentExerciseIndex, exercises.length]);

  const currentExercise = exercises[currentExerciseIndex];

  // Calculate progress: account for completed exercises + progress in current exercise
  let progress = 0;
  if (exercises.length > 0 && currentExercise) {
    // Total number of sets across all exercises
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 1), 0);

    // Completed sets = all sets from completed exercises + completed sets in current exercise
    let completedSets = 0;
    for (let i = 0; i < currentExerciseIndex; i++) {
      completedSets += exercises[i].sets || 1;
    }
    completedSets += currentExerciseSets.length; // Add completed sets in current exercise

    progress = (completedSets / totalSets) * 100;
  }

  const handleLogSet = async () => {
    // Prevent rapid/double clicks
    if (isLoggingSet) {
      return;
    }

    setIsLoggingSet(true);

    try {
      // Validate workoutLogId first
      if (!workoutLogId) {
        Alert.alert('Error', 'Workout not initialized. Please try again.');
        return;
      }

      if (!repsInput.trim()) {
        Alert.alert('Error', 'Please enter reps');
        return;
      }

      const reps = parseInt(repsInput);
      const weight = weightInput ? parseFloat(weightInput) : 0;

      if (reps <= 0) {
        Alert.alert('Error', 'Reps must be greater than 0');
        return;
      }

      // Calculate set duration
      const setDuration = setStartTime ? Math.floor((new Date() - setStartTime) / 1000) : 0;

      // Save to database with timing
      await logExerciseSet(
        workoutLogId,
        currentExercise.id,
        currentSetNumber,
        reps,
        weight,
        null,
        '',
        setDuration,
        0 // rest time will be updated when rest completes
      );

      // Add to current exercise sets
      setCurrentExerciseSets([
        ...currentExerciseSets,
        {
          id: Date.now(),
          set: currentSetNumber,
          reps,
          weight,
          duration: setDuration,
        },
      ]);

      // Start rest timer and reset set start time
      setIsResting(true);
      setRestTimeLeft(90);
      setSetStartTime(null); // Reset for next set
      setRestTimeUsed(0);

      // Clear inputs for next set
      setRepsInput(weight.toString());
      setWeightInput(weight.toString());
    } catch (error) {
      Alert.alert('Error', 'Failed to log set');
    } finally {
      // Re-enable the button after operation completes
      setIsLoggingSet(false);
    }
  };

  const handleSkipRestAndContinue = async () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    if (currentSetNumber < currentExercise.sets) {
      // More sets for this exercise
      setCurrentSetNumber(currentSetNumber + 1);
      setIsResting(false);
      setRestTimeLeft(90);
      setSetStartTime(new Date()); // Start timing for next set
    } else if (currentExerciseIndex < exercises.length - 1) {
      // Move to next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetNumber(1);
      setIsResting(false);
      setRestTimeLeft(90);
      setSetStartTime(new Date()); // Start timing for next exercise
      initializeExercise(exercises[currentExerciseIndex + 1]);
    } else {
      // Workout complete
      await completeWorkout();
    }
  };

  const handleCompleteExercise = async () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    Alert.alert(
      'Complete Exercise',
      `Skip remaining sets for ${currentExercise.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip Exercise',
          onPress: async () => {
            if (currentExerciseIndex < exercises.length - 1) {
              setCurrentExerciseIndex(currentExerciseIndex + 1);
              setCurrentSetNumber(1);
              setIsResting(false);
              setRestTimeLeft(90);
              initializeExercise(exercises[currentExerciseIndex + 1]);
            } else {
              await completeWorkout();
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const completeWorkout = async () => {
    try {
      const duration = Math.floor((new Date() - workoutStartTime) / 1000);
      await completeWorkoutLog(workoutLogId, duration);

      // Navigate to summary screen instead of showing alert
      navigation.navigate('WorkoutSummary', { workoutLogId });
    } catch (error) {
      Alert.alert('Error', 'Failed to complete workout');
    }
  };

  const handleExit = () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    Alert.alert(
      'Exit Workout',
      'Are you sure? Your logged sets will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack(), style: 'destructive' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>No exercises found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} activeOpacity={0.7}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{plan?.name}</Text>
          <Text style={styles.headerSubtitle}>
            {currentExerciseIndex + 1} of {exercises.length}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons name="clock" size={16} color={COLORS.primary} />
          <Text style={styles.timerText}>{elapsedTime}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Current Exercise Card */}
        <View style={styles.exerciseCard}>
          {/* Card Header with Rest Timer */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.setLabel}>Set {currentSetNumber} of {currentExercise.sets}</Text>
            </View>
            {isResting && (
              <View style={styles.restTimerBox}>
                <MaterialCommunityIcons name="pause-circle" size={14} color="#FF9800" />
                <Text style={styles.restTimerText}>{restTimeLeft}s</Text>
              </View>
            )}
          </View>

          {/* Target Info */}
          <View style={styles.targetBox}>
            <Text style={styles.targetLabel}>
              Target: {currentExercise.reps} reps {currentExercise.weight ? `@ ${currentExercise.weight}kg` : ''}
            </Text>
          </View>

          {/* Input Row */}
          {!isResting ? (
            <>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={currentExercise.reps?.toString() || '0'}
                    keyboardType="number-pad"
                    value={repsInput}
                    onChangeText={setRepsInput}
                    autoFocus
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={currentExercise.weight?.toString() || '0'}
                    keyboardType="decimal-pad"
                    value={weightInput}
                    onChangeText={setWeightInput}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      setTimeout(() => handleLogSet(), 100);
                    }}
                  />
                </View>
              </View>

              <View
                style={styles.logButtonWrapper}
                onTouchEnd={() => {
                  if (!workoutLogId || isLoggingSet) {
                    return;
                  }
                  Keyboard.dismiss();
                  setTimeout(() => {
                    handleLogSet();
                  }, 50);
                }}
              >
                <TouchableOpacity
                  style={[styles.logButton, (!workoutLogId || isLoggingSet) && styles.logButtonDisabled]}
                  activeOpacity={0.7}
                  delayPressIn={0}
                  delayPressOut={0}
                >
                  <MaterialCommunityIcons
                    name={isLoggingSet ? "loading" : "check"}
                    size={20}
                    color="#fff"
                    style={isLoggingSet ? styles.loadingIcon : {}}
                  />
                  <Text style={styles.logButtonText}>
                    {!workoutLogId ? 'Initializing...' : isLoggingSet ? 'Logging...' : 'Log Set'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Rest Timer Active */
            <View style={styles.restingContainer}>
              <Text style={styles.restingText}>Rest {restTimeLeft}s</Text>
              <View style={styles.restButtonRow}>
                <TouchableOpacity
                  style={[styles.restActionButton, styles.addTimeButton]}
                  onPress={() => setRestTimeLeft(restTimeLeft + 10)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                  <Text style={styles.restActionButtonText}>+10s</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.restActionButton, styles.skipButton]}
                  onPress={handleSkipRestAndContinue}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="skip-next" size={18} color="#fff" />
                  <Text style={styles.restActionButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Logged Sets Summary */}
          {currentExerciseSets.length > 0 && (
            <View style={styles.loggedSetsContainer}>
              <Text style={styles.loggedSetsTitle}>Logged Sets</Text>
              {currentExerciseSets.map((set) => (
                <View key={set.id} style={styles.loggedSetRow}>
                  <Text style={styles.loggedSetText}>
                    Set {set.set}: {set.reps} reps {set.weight > 0 ? `@ ${set.weight}kg` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.skipExerciseButton]}
              onPress={handleCompleteExercise}
              activeOpacity={0.7}
            >
              <Text style={styles.skipExerciseText}>Skip Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Exercises Preview */}
        {currentExerciseIndex < exercises.length - 1 && (
          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingSectionTitle}>All Exercises</Text>
            <ScrollView
              ref={upcomingExercisesScrollRef}
              horizontal
              showsHorizontalScrollIndicator={true}
              scrollEventThrottle={16}
              style={styles.upcomingScrollView}
              contentContainerStyle={styles.upcomingScrollContent}
            >
              {exercises.map((exercise, index) => (
                <View
                  key={exercise.id}
                  style={[
                    styles.upcomingExerciseCard,
                    index === currentExerciseIndex && styles.currentExerciseIndicator,
                    index < currentExerciseIndex && styles.completedExerciseIndicator,
                  ]}
                >
                  <View style={styles.exerciseIndexBadge}>
                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.upcomingExerciseHeader}>
                    <Text style={styles.upcomingExerciseName}>{exercise.name}</Text>
                  </View>
                  <Text style={styles.upcomingExerciseSets}>{exercise.sets} sets</Text>
                  <Text style={styles.upcomingExerciseTarget}>
                    {exercise.reps} reps {exercise.weight ? `@ ${exercise.weight}kg` : ''}
                  </Text>
                  {index < currentExerciseIndex && (
                    <View style={styles.completedBadge}>
                      <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                    </View>
                  )}
                  {index === currentExerciseIndex && (
                    <View style={styles.currentBadge}>
                      <MaterialCommunityIcons name="play-circle" size={16} color={COLORS.primary} />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  setLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  restTimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  restTimerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9800',
  },
  targetBox: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  targetLabel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  logButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingIcon: {
    transform: [{ rotate: '0deg' }],
  },
  logButtonWrapper: {
    zIndex: 1000,
  },
  restingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  restingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 16,
  },
  restButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  restActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addTimeButton: {
    backgroundColor: '#4CAF50',
  },
  skipButton: {
    backgroundColor: '#FF9800',
  },
  restActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loggedSetsContainer: {
    marginBottom: 16,
  },
  loggedSetsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  loggedSetRow: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  loggedSetText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  buttonRow: {
    gap: 10,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipExerciseButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  skipExerciseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },
  upcomingSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  upcomingSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
  },
  upcomingScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  upcomingScrollContent: {
    paddingRight: 16,
    gap: 10,
  },
  upcomingExerciseCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#999',
    minWidth: 140,
    maxWidth: 160,
  },
  currentExerciseIndicator: {
    backgroundColor: '#E3F2FD',
    borderLeftColor: COLORS.primary,
    borderWidth: 1.5,
    borderLeftWidth: 3,
  },
  completedExerciseIndicator: {
    backgroundColor: '#F1F8E9',
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },
  exerciseIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  upcomingExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  upcomingExerciseName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  upcomingExerciseSets: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 6,
  },
  upcomingExerciseTarget: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
