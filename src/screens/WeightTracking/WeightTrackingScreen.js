/**
 * WEIGHT TRACKING SCREEN
 *
 * Main screen for tracking weight entries and progress.
 * Uses modular components for better maintainability.
 */

import React, { useState } from "react";
import { View, ScrollView, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";
import { Button, BottomSheet } from "../../shared/components/ui";
import {
  addWeightEntry,
  getWeightEntryForDate,
  getAllWeightEntries,
} from "../../services/database";

// Components
import CurrentWeightInput from "./components/CurrentWeightInput";
import CurrentWeightCard from "./components/CurrentWeightCard";
import GoalWeightCard from "./components/GoalWeightCard";
import GoalProgressCard from "./components/GoalProgressCard";
import WeightHistoryList from "./components/WeightHistoryList";

export default function WeightTrackingScreen({ navigation, route }) {
  const today = new Date().toISOString().split("T")[0];

  // State
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [initialWeight, setInitialWeight] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [weightChange, setWeightChange] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isAdjustGoalSheetVisible, setIsAdjustGoalSheetVisible] = useState(false);

  // Load data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadWeightData();
      // Handle opening bottom sheet from header button
      if (route?.params?.openBottomSheet) {
        setIsBottomSheetVisible(true);
        navigation.setParams({ openBottomSheet: false });
      }
    }, [route?.params?.openBottomSheet, navigation])
  );

  /**
   * Load today's weight entry and 30-day history
   */
  const loadWeightData = async () => {
    try {
      // Load today's entry
      const todayData = await getWeightEntryForDate(today);
      if (todayData) {
        setTodayEntry(todayData);
        setCurrentWeight(todayData.currentWeight.toString());
        setTargetWeight(todayData.targetWeight.toString());
      } else {
        setTodayEntry(null);
        setCurrentWeight("");
        setTargetWeight("");
      }

      // Load weight history (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split("T")[0];

      const allEntries = await getAllWeightEntries();
      const recentEntries = allEntries.filter(
        (entry) => entry.weightDate >= startDate
      );
      setWeightHistory(recentEntries);

      // Calculate weight change from first to latest entry
      if (recentEntries.length > 0) {
        const firstWeight =
          recentEntries[recentEntries.length - 1].currentWeight;
        setInitialWeight(firstWeight);

        if (recentEntries.length > 1) {
          const latestWeight = recentEntries[0].currentWeight;
          const change = latestWeight - firstWeight;
          setWeightChange(change);
        } else {
          setWeightChange(null);
        }
      } else {
        setInitialWeight(null);
        setWeightChange(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load weight data");
    }
  };

  /**
   * Adjust goal weight by a given amount
   */
  const handleAdjustGoalWeight = (adjustment) => {
    const currentValue = parseFloat(targetWeight) || 0;
    const newValue = currentValue + adjustment;
    // Ensure value stays within reasonable bounds
    if (newValue > 0) {
      setTargetWeight(newValue.toString());
    }
  };

  /**
   * Save adjusted goal weight
   */
  const handleSaveGoal = async () => {
    if (!targetWeight) {
      Alert.alert("Missing Data", "Please enter a target weight");
      return;
    }

    const target = parseFloat(targetWeight);
    if (target <= 0) {
      Alert.alert("Invalid Input", "Target weight must be greater than 0");
      return;
    }

    // Close the sheet
    setIsAdjustGoalSheetVisible(false);
    Alert.alert("Success", "Goal weight updated successfully");
  };

  /**
   * Save weight entry for today
   */
  const handleSaveWeight = async () => {
    // Validation
    if (!currentWeight || !targetWeight) {
      Alert.alert(
        "Missing Data",
        "Please enter both current and target weight"
      );
      return;
    }

    const current = parseFloat(currentWeight);
    const target = parseFloat(targetWeight);

    if (current <= 0 || target <= 0) {
      Alert.alert("Invalid Input", "Weight values must be greater than 0");
      return;
    }

    setIsSaving(true);

    try {
      await addWeightEntry(today, current, target);
      Alert.alert("Success", "Weight entry saved successfully");

      // Reload the data
      await loadWeightData();

      // Close the bottom sheet
      setIsBottomSheetVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save weight entry");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Weight Card - Shows current weight and 30-day change */}
        <CurrentWeightCard
          currentWeight={currentWeight}
          weightChange={weightChange}
        />

        {/* Goal Progress Card */}
        <GoalProgressCard
          currentWeight={currentWeight}
          targetWeight={targetWeight}
          initialWeight={initialWeight}
          onAdjustGoal={() => setIsAdjustGoalSheetVisible(true)}
        />

        {/* Weight History List */}
        <WeightHistoryList weightHistory={weightHistory} />
      </ScrollView>

      {/* Bottom Sheet for Logging Weight */}
      <BottomSheet
        visible={isBottomSheetVisible}
        title="Log Weight"
        onClose={() => setIsBottomSheetVisible(false)}
        heightPercent={0.5}
        hasFixedFooter={true}
      >
        {/* Current Weight Input */}
        <View style={styles.bottomSheetContent}>
          <CurrentWeightInput
            value={currentWeight}
            onValueChange={setCurrentWeight}
            title="Today's Weight"
          />
        </View>

        {/* Save Button - Fixed Footer */}
        <View style={styles.buttonWrapper}>
          <Button
            label="Log Today's Weight"
            icon="content-save"
            onPress={handleSaveWeight}
            isLoading={isSaving}
            fullWidth
          />
        </View>
      </BottomSheet>

      {/* Bottom Sheet for Adjusting Goal Weight */}
      <BottomSheet
        visible={isAdjustGoalSheetVisible}
        title="Adjust Goal Weight"
        onClose={() => setIsAdjustGoalSheetVisible(false)}
        heightPercent={0.6}
        hasFixedFooter={true}
      >
        {/* Goal Weight Input */}
        <View style={styles.bottomSheetContent}>
          <GoalWeightCard value={targetWeight} onChangeText={setTargetWeight} />

          {/* Adjustment Buttons */}
          <View style={styles.adjustmentButtonsContainer}>
            <TouchableOpacity
              style={[styles.adjustmentButton, styles.negativeButton]}
              onPress={() => handleAdjustGoalWeight(-1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.negativeText]}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustmentButton, styles.negativeButton]}
              onPress={() => handleAdjustGoalWeight(-0.5)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.negativeText]}>-0.5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustmentButton, styles.positiveButton]}
              onPress={() => handleAdjustGoalWeight(0.5)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.positiveText]}>+0.5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustmentButton, styles.positiveButton]}
              onPress={() => handleAdjustGoalWeight(1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.positiveText]}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button - Fixed Footer */}
        <View style={styles.buttonWrapper}>
          <Button
            label="Save Goal Weight"
            icon="content-save"
            onPress={handleSaveGoal}
            fullWidth
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
    paddingVertical: SPACING.small,
  },
  bottomSheetContent: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
  },
  buttonWrapper: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
  },
  adjustmentButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.small,
    marginTop: SPACING.element,
  },
  adjustmentButton: {
    flex: 1,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.xs,
    borderRadius: SPACING.borderRadius,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  negativeButton: {
    backgroundColor: COLORS.mainBackground,
    borderColor: COLORS.weightGain,
  },
  positiveButton: {
    backgroundColor: COLORS.mainBackground,
    borderColor: COLORS.weightLoss,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  negativeText: {
    color: COLORS.weightGain,
  },
  positiveText: {
    color: COLORS.weightLoss,
  },
});
