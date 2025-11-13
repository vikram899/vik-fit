import React, { useState, useCallback, useRef, useEffect } from "react";
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";
import {
  getWorkoutById,
  getExercisesByWorkoutId,
  startWorkoutLog,
  getActiveWorkoutLog,
  logExerciseSet,
  completeWorkoutLog,
} from "../services/database";
import { Button } from "../shared/components";

/**
 * StartWorkoutScreen
 * One exercise card at a time with rest timer on top right
 * Pre-filled values from history or exercise defaults
 */
export default function StartWorkoutScreen({ navigation, route }) {
  const { workoutId } = route.params;

  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workoutLogId, setWorkoutLogId] = useState(null);

  // Current position
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);

  // Form inputs
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  // Rest timer state
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const restTimerRef = useRef(null);

  // Workout timing
  const [workoutStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState("00:00");

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

          const planData = await getWorkoutById(workoutId);
          setPlan(planData);

          const exercisesData = await getExercisesByWorkoutId(workoutId);
          setExercises(exercisesData);

          // Check if active workout exists
          const existingLog = await getActiveWorkoutLog(workoutId);

          if (existingLog) {
            setWorkoutLogId(existingLog.id);
          } else {
            const logId = await startWorkoutLog(workoutId);
            setWorkoutLogId(logId);
          }

          // Initialize first exercise
          if (exercisesData.length > 0) {
            initializeExercise(exercisesData[0]);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load workout");
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [workoutId])
  );

  // Initialize exercise with pre-filled values
  const initializeExercise = (exercise) => {
    // Pre-fill with exercise defaults
    setRepsInput(exercise.reps?.toString() || "");
    setWeightInput(exercise.weight?.toString() || "");
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

      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
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
      const scrollPosition = Math.max(
        0,
        currentExerciseIndex * totalCardWidth - cardWidth / 2
      );

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
        Alert.alert("Error", "Workout not initialized. Please try again.");
        return;
      }

      if (!repsInput.trim()) {
        Alert.alert("Error", "Please enter reps");
        return;
      }

      const reps = parseInt(repsInput);
      const weight = weightInput ? parseFloat(weightInput) : 0;

      if (reps <= 0) {
        Alert.alert("Error", "Reps must be greater than 0");
        return;
      }

      // Calculate set duration
      const setDuration = setStartTime
        ? Math.floor((new Date() - setStartTime) / 1000)
        : 0;

      // Save to database with timing
      await logExerciseSet(
        workoutLogId,
        currentExercise.id,
        currentSetNumber,
        reps,
        weight,
        null,
        "",
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
      Alert.alert("Error", "Failed to log set");
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
      "Complete Exercise",
      `Skip remaining sets for ${currentExercise.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip Exercise",
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
          style: "destructive",
        },
      ]
    );
  };

  const completeWorkout = async () => {
    try {
      const duration = Math.floor((new Date() - workoutStartTime) / 1000);
      await completeWorkoutLog(workoutLogId, duration);

      // Navigate to summary screen instead of showing alert
      navigation.navigate("WorkoutSummary", { workoutLogId });
    } catch (error) {
      Alert.alert("Error", "Failed to complete workout");
    }
  };

  const handleExit = () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    Alert.alert(
      "Exit Workout",
      "Are you sure? Your logged sets will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          onPress: () => navigation.goBack(),
          style: "destructive",
        },
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
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={COLORS.tertiary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{plan?.name}</Text>
          <Text style={styles.headerSubtitle}>
            {currentExerciseIndex + 1} of {exercises.length}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons
            name="clock"
            size={16}
            color={COLORS.tertiary}
          />
          <Text style={styles.timerText}>{elapsedTime}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Exercise Card */}
        <View style={styles.exerciseCard}>
          {/* Card Header with Rest Timer */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.setLabel}>
                Set {currentSetNumber} of {currentExercise.sets}
              </Text>
            </View>
            {isResting && (
              <View style={styles.restTimerBox}>
                <MaterialCommunityIcons
                  name="pause-circle"
                  size={14}
                  color={COLORS.tertiary}
                />
                <Text style={styles.restTimerText}>{restTimeLeft}s</Text>
              </View>
            )}
          </View>

          {/* Target Info */}
          <View style={styles.targetBox}>
            <Text style={styles.targetLabel}>
              Target: {currentExercise.reps} reps{" "}
              {currentExercise.weight ? `@ ${currentExercise.weight}kg` : ""}
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
                    placeholder={currentExercise.reps?.toString() || "0"}
                    keyboardType="number-pad"
                    value={repsInput}
                    onChangeText={setRepsInput}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={currentExercise.weight?.toString() || "0"}
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
                  style={[
                    styles.logButton,
                    (!workoutLogId || isLoggingSet) && styles.logButtonDisabled,
                  ]}
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
                    {!workoutLogId
                      ? "Initializing..."
                      : isLoggingSet
                      ? "Logging..."
                      : "Log Set"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Rest Timer Active */
            <View style={styles.restingContainer}>
              {/* <Text style={styles.restingText}>Rest {restTimeLeft}s</Text> */}
              <View style={styles.restButtonRow}>
                <Button
                  label="+10"
                  variant="cancel"
                  size="medium"
                  onPress={() => setRestTimeLeft(restTimeLeft + 10)}
                  //isDisabled={isLoading}
                  //fullWidth
                />

                {/* <TouchableOpacity
                  style={[styles.restActionButton, styles.addTimeButton]}
                  onPress={() => setRestTimeLeft(restTimeLeft + 10)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                  <Text style={styles.restActionButtonText}>10s</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={[styles.restActionButton, styles.skipButton]}
                  onPress={handleSkipRestAndContinue}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="skip-next"
                    size={18}
                    color="#fff"
                  />
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
                    Set {set.set}: {set.reps} reps{" "}
                    {set.weight > 0 ? `@ ${set.weight}kg` : ""}
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
                    index === currentExerciseIndex &&
                      styles.currentExerciseIndicator,
                    index < currentExerciseIndex &&
                      styles.completedExerciseIndicator,
                  ]}
                >
                  <View style={styles.exerciseIndexBadge}>
                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.upcomingExerciseHeader}>
                    <Text style={styles.upcomingExerciseName}>
                      {exercise.name}
                    </Text>
                  </View>
                  <Text style={styles.upcomingExerciseSets}>
                    {exercise.sets} sets
                  </Text>
                  <Text style={styles.upcomingExerciseTarget}>
                    {exercise.reps} reps{" "}
                    {exercise.weight ? `@ ${exercise.weight}kg` : ""}
                  </Text>
                  {index < currentExerciseIndex && (
                    <View style={styles.completedBadge}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color={COLORS.tertiary}
                      />
                    </View>
                  )}
                  {index === currentExerciseIndex && (
                    <View style={styles.currentBadge}>
                      <MaterialCommunityIcons
                        name="play-circle"
                        size={16}
                        color={COLORS.primary}
                      />
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
    backgroundColor: COLORS.mainBackground,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryBackground,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.secondaryBackground,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SPACING.borderRadius,
  },
  timerText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    fontFamily: "monospace",
  },
  progressBarContainer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.element,
    paddingBottom: SPACING.container,
  },
  exerciseCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.medium,
  },
  exerciseName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  setLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
  restTimerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.tertiaryBackground,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  restTimerText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
  },
  targetBox: {
    backgroundColor: COLORS.tertiaryBackground,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  targetLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  inputRow: {
    flexDirection: "row",
    gap: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.mainBackground,
  },
  logButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadius,
    paddingVertical: SPACING.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  logButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
    opacity: 0.6,
  },
  logButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  loadingIcon: {
    transform: [{ rotate: "0deg" }],
  },
  logButtonWrapper: {
    zIndex: 1000,
  },
  restingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.element,
    marginBottom: SPACING.medium,
  },
  restingText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  restButtonRow: {
    flexDirection: "row",
    gap: SPACING.small,
    width: "100%",
  },
  restActionButton: {
    flex: 1,
    borderRadius: SPACING.borderRadius,
    paddingVertical: SPACING.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  addTimeButton: {
    backgroundColor: COLORS.success,
  },
  skipButton: {
    backgroundColor: COLORS.primary,
  },
  restActionButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  loggedSetsContainer: {
    marginBottom: SPACING.medium,
  },
  loggedSetsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
    textTransform: "uppercase",
  },
  loggedSetRow: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.mainBackground,
    borderRadius: SPACING.borderRadiusSmall,
    marginBottom: SPACING.small,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  loggedSetText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  buttonRow: {
    gap: SPACING.small,
  },
  actionButton: {
    paddingVertical: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  skipExerciseButton: {
    backgroundColor: COLORS.tertiaryBackground,
    borderColor: COLORS.textSecondary,
  },
  skipExerciseText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
  upcomingSection: {
    marginTop: SPACING.container,
    marginBottom: SPACING.medium,
  },
  upcomingSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.element,
  },
  upcomingScrollView: {
    marginHorizontal: -SPACING.element,
    paddingHorizontal: SPACING.element,
  },
  upcomingScrollContent: {
    paddingRight: SPACING.element,
    gap: SPACING.small,
  },
  upcomingExerciseCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.medium,
    minWidth: 140,
    maxWidth: 160,
  },
  currentExerciseIndicator: {
    backgroundColor: COLORS.secondaryBackground,
  },
  completedExerciseIndicator: {
    backgroundColor: COLORS.secondaryBackground,
    opacity: 0.8,
  },
  exerciseIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.tertiaryBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  exerciseIndexText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  upcomingExerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  upcomingExerciseName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  upcomingExerciseSets: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.mainBackground,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadiusSmall,
    marginBottom: SPACING.xs,
  },
  upcomingExerciseTarget: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  completedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  currentBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
