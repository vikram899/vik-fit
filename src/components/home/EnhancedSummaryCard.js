import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";
import { BottomSheet } from "../common";
import {
  getUserProfile,
  calculateBMR,
  calculateStepCalories,
  getLatestWeightEntry,
  saveManualCaloriesBurned,
  getManualCaloriesBurned,
} from "../../services/database";

/**
 * EnhancedSummaryCard - Energy Balance Dashboard (Option B Layout)
 * Compact grid layout with detailed calorie breakdown
 */
export default function EnhancedSummaryCard({
  selectedDate,
  onDateChange,
  dailyTotals,
  macroGoals,
  caloriesBurned = 0, // calories from workouts
  steps = 0,
  stepGoal = 10000,
  onLogPress,
  onStepsUpdate,
}) {
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showCaloriesOutModal, setShowCaloriesOutModal] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const [caloriesOutInput, setCaloriesOutInput] = useState("");

  // User profile and weight
  const [userProfile, setUserProfile] = useState({ height: 170, age: 30, gender: 'male' });
  const [currentWeight, setCurrentWeight] = useState(70);

  // Calculated calories
  const [bmrCalories, setBmrCalories] = useState(0);
  const [stepCalories, setStepCalories] = useState(0);
  const [workoutCalories, setWorkoutCalories] = useState(0);
  const [manualCaloriesOut, setManualCaloriesOut] = useState(null);

  // Load user profile and weight
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);

        const weightEntry = await getLatestWeightEntry();
        if (weightEntry) {
          setCurrentWeight(weightEntry.currentWeight);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Load manual calories override for selected date
  useEffect(() => {
    const loadManualCalories = async () => {
      try {
        const manual = await getManualCaloriesBurned(selectedDate);
        setManualCaloriesOut(manual);
      } catch (error) {
        console.error('Error loading manual calories:', error);
      }
    };
    loadManualCalories();
  }, [selectedDate]);

  // Calculate calories whenever dependencies change
  useEffect(() => {
    // Calculate BMR
    const bmr = calculateBMR(
      currentWeight,
      userProfile.height,
      userProfile.age,
      userProfile.gender
    );
    setBmrCalories(bmr);

    // Calculate step calories
    const stepCal = calculateStepCalories(steps, currentWeight, userProfile.height);
    setStepCalories(stepCal);

    // Workout calories
    setWorkoutCalories(caloriesBurned);
  }, [currentWeight, userProfile, steps, caloriesBurned]);

  // Calculate totals
  const caloriesIn = Math.round(dailyTotals.totalCalories || 0);
  const calorieGoal = Math.round(macroGoals.calorieGoal || 2500);

  // Use manual override if set, otherwise use calculated
  const totalCaloriesOut = manualCaloriesOut !== null
    ? manualCaloriesOut
    : bmrCalories + stepCalories + workoutCalories;

  const netCalories = caloriesIn - totalCaloriesOut;

  // Calculate progress
  const caloriesInProgress = (caloriesIn / calorieGoal) * 100;
  const stepsProgress = (steps / stepGoal) * 100;
  const proteinProgress = (dailyTotals.totalProtein / macroGoals.proteinGoal) * 100;

  // Format date for display
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleDateChange = (days) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    const newDate = currentDate.toISOString().split("T")[0];
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const goToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    if (onDateChange) {
      onDateChange(today);
    }
    setShowDateSelector(false);
  };

  const handleOpenStepsModal = () => {
    setStepsInput(steps > 0 ? steps.toString() : "");
    setShowStepsModal(true);
  };

  const handleSaveSteps = () => {
    const stepsValue = parseInt(stepsInput, 10);
    if (isNaN(stepsValue) || stepsValue < 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of steps");
      return;
    }
    if (onStepsUpdate) {
      onStepsUpdate(stepsValue);
    }
    setShowStepsModal(false);
  };

  const handleOpenCaloriesOutModal = () => {
    setCaloriesOutInput(
      manualCaloriesOut !== null
        ? manualCaloriesOut.toString()
        : totalCaloriesOut.toString()
    );
    setShowCaloriesOutModal(true);
  };

  const handleSaveCaloriesOut = async () => {
    const caloriesValue = parseInt(caloriesOutInput, 10);
    if (isNaN(caloriesValue) || caloriesValue < 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of calories");
      return;
    }
    try {
      await saveManualCaloriesBurned(selectedDate, caloriesValue);
      setManualCaloriesOut(caloriesValue);
      setShowCaloriesOutModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save calories burned");
    }
  };

  const handleResetCaloriesOut = async () => {
    try {
      await saveManualCaloriesBurned(selectedDate, 0);
      setManualCaloriesOut(null);
      setShowCaloriesOutModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to reset calories burned");
    }
  };

  return (
    <View style={styles.card}>
      {/* Header with Date Selector */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDateSelector(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Compact Grid: Calories In / Out / Net */}
      <View style={styles.compactGrid}>
        {/* Calories In */}
        <TouchableOpacity style={styles.gridItem} onPress={onLogPress} activeOpacity={0.7}>
          <View style={styles.gridIconHeader}>
            <MaterialCommunityIcons name="fire" size={20} color={COLORS.calories} />
            <Text style={styles.gridLabel}>In</Text>
          </View>
          <Text style={styles.gridValue}>{caloriesIn}</Text>
          <Text style={styles.gridSubtext}>calories</Text>
        </TouchableOpacity>

        {/* Calories Out */}
        <TouchableOpacity style={styles.gridItem} onPress={handleOpenCaloriesOutModal} activeOpacity={0.7}>
          <View style={styles.gridIconHeader}>
            <MaterialCommunityIcons name="run" size={20} color={COLORS.tertiary} />
            <Text style={styles.gridLabel}>Out</Text>
          </View>
          <Text style={styles.gridValue}>{totalCaloriesOut}</Text>
          <Text style={styles.gridSubtext}>calories</Text>
        </TouchableOpacity>

        {/* Net Calories */}
        <View style={styles.gridItem}>
          <View style={styles.gridIconHeader}>
            <MaterialCommunityIcons name="scale-balance" size={20} color={COLORS.primary} />
            <Text style={styles.gridLabel}>Net</Text>
          </View>
          <Text
            style={[
              styles.gridValue,
              { color: netCalories > 0 ? COLORS.success : COLORS.error },
            ]}
          >
            {netCalories > 0 ? "+" : ""}
            {netCalories}
          </Text>
          <Text style={styles.gridSubtext}>
            {netCalories > 0 ? "Surplus" : "Deficit"}
          </Text>
        </View>
      </View>

      {/* Calories Out Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>Calories Out Breakdown:</Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <MaterialCommunityIcons name="bed" size={16} color={COLORS.textSecondary} />
            <Text style={styles.breakdownText}>Resting: {bmrCalories}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <MaterialCommunityIcons name="walk" size={16} color={COLORS.textSecondary} />
            <Text style={styles.breakdownText}>Steps: {stepCalories}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <MaterialCommunityIcons name="dumbbell" size={16} color={COLORS.textSecondary} />
            <Text style={styles.breakdownText}>Workouts: {workoutCalories}</Text>
          </View>
        </View>
        {manualCaloriesOut !== null && (
          <View style={styles.manualOverrideBadge}>
            <MaterialCommunityIcons name="information" size={14} color={COLORS.warning} />
            <Text style={styles.manualOverrideText}>Manual override active</Text>
          </View>
        )}
      </View>

      {/* Steps and Protein Row */}
      <View style={styles.bottomRow}>
        {/* Steps */}
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={handleOpenStepsModal}
          activeOpacity={0.7}
        >
          <View style={styles.bottomHeader}>
            <MaterialCommunityIcons name="walk" size={20} color={COLORS.primary} />
            <Text style={styles.bottomLabel}>Steps</Text>
          </View>
          <Text style={styles.bottomValue}>
            {steps.toLocaleString()} / {stepGoal.toLocaleString()}
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(stepsProgress, 100)}%`,
                  backgroundColor: COLORS.primary,
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Protein */}
        <TouchableOpacity style={styles.bottomItem} onPress={onLogPress} activeOpacity={0.7}>
          <View style={styles.bottomHeader}>
            <MaterialCommunityIcons name="flash" size={20} color={COLORS.protein} />
            <Text style={styles.bottomLabel}>Protein</Text>
          </View>
          <Text style={styles.bottomValue}>
            {Math.round(dailyTotals.totalProtein)}g / {Math.round(macroGoals.proteinGoal)}g
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(proteinProgress, 100)}%`,
                  backgroundColor: COLORS.protein,
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Date Selector Bottom Sheet */}
      <BottomSheet
        visible={showDateSelector}
        onClose={() => setShowDateSelector(false)}
        title="Select Date"
      >
        <View style={styles.dateSelectorContent}>
          <View style={styles.dateNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleDateChange(-1)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.navButtonText}>Previous Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.todayButton]}
              onPress={goToToday}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="calendar-today"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleDateChange(1)}
              activeOpacity={0.7}
              disabled={selectedDate >= new Date().toISOString().split("T")[0]}
            >
              <Text style={styles.navButtonText}>Next Day</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={selectedDate >= new Date().toISOString().split("T")[0] ? COLORS.mediumGray : COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.selectedDateDisplay}>
            <Text style={styles.selectedDateLabel}>Selected Date</Text>
            <Text style={styles.selectedDateValue}>
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      </BottomSheet>

      {/* Manual Steps Input Modal */}
      <BottomSheet
        visible={showStepsModal}
        onClose={() => setShowStepsModal(false)}
        title="Add Steps Manually"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Enter your step count for {formatDate(selectedDate)}
          </Text>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="walk" size={24} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="number-pad"
              value={stepsInput}
              onChangeText={setStepsInput}
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.inputLabel}>steps</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowStepsModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveSteps}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

      {/* Manual Calories Out Input Modal */}
      <BottomSheet
        visible={showCaloriesOutModal}
        onClose={() => setShowCaloriesOutModal(false)}
        title="Edit Calories Burned"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Adjust total calories burned for {formatDate(selectedDate)}
          </Text>

          <View style={styles.calculatedBreakdown}>
            <Text style={styles.calculatedTitle}>Auto-calculated:</Text>
            <Text style={styles.calculatedText}>• Resting: {bmrCalories} cal</Text>
            <Text style={styles.calculatedText}>• Steps: {stepCalories} cal</Text>
            <Text style={styles.calculatedText}>• Workouts: {workoutCalories} cal</Text>
            <Text style={styles.calculatedTotal}>
              Total: {bmrCalories + stepCalories + workoutCalories} cal
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="fire" size={24} color={COLORS.tertiary} />
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="number-pad"
              value={caloriesOutInput}
              onChangeText={setCaloriesOutInput}
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.inputLabel}>cal</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCaloriesOutModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {manualCaloriesOut !== null && (
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={handleResetCaloriesOut}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="restore" size={20} color={COLORS.white} />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveCaloriesOut}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  dateButton: {
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
  dateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  compactGrid: {
    flexDirection: "row",
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  gridItem: {
    flex: 1,
    backgroundColor: COLORS.tertiaryBackground,
    padding: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    alignItems: "center",
  },
  gridIconHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  gridLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  gridValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  gridSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: COLORS.mainBackground,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  breakdownSection: {
    backgroundColor: COLORS.tertiaryBackground,
    padding: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  breakdownTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.small,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.small,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  breakdownText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
  },
  manualOverrideBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.small,
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  manualOverrideText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.warning,
    fontStyle: "italic",
  },
  bottomRow: {
    flexDirection: "row",
    gap: SPACING.medium,
  },
  bottomItem: {
    flex: 1,
    backgroundColor: COLORS.tertiaryBackground,
    padding: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  bottomHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    marginBottom: SPACING.small,
  },
  bottomLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  bottomValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  dateSelectorContent: {
    gap: SPACING.container,
  },
  dateNavigation: {
    flexDirection: "row",
    gap: SPACING.small,
    justifyContent: "space-between",
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.secondaryBackground,
    paddingVertical: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  todayButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  todayButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  selectedDateDisplay: {
    backgroundColor: COLORS.tertiaryBackground,
    padding: SPACING.element,
    borderRadius: SPACING.borderRadius,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  selectedDateLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  selectedDateValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  modalContent: {
    gap: SPACING.container,
  },
  modalDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  calculatedBreakdown: {
    backgroundColor: COLORS.tertiaryBackground,
    padding: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  calculatedTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.small,
  },
  calculatedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  calculatedTotal: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.medium,
    backgroundColor: COLORS.tertiaryBackground,
    padding: SPACING.container,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  input: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    minWidth: 100,
    textAlign: "center",
    padding: SPACING.small,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  modalButtons: {
    flexDirection: "row",
    gap: SPACING.medium,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.small,
    paddingVertical: SPACING.medium,
    borderRadius: SPACING.borderRadius,
  },
  cancelButton: {
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  resetButton: {
    backgroundColor: COLORS.warning,
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
});
