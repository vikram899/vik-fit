import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useHealthData } from "../../services/healthKit";
import { getUserSetting, setSetting } from "../../services/database";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

const DEFAULT_STEP_GOAL = 10000;

/**
 * StepsCard Component
 * Displays today's step count synced from Apple HealthKit
 * Shows progress toward daily step goal
 */
const StepsCard = () => {
  const {
    steps,
    loading,
    error,
    hasPermission,
    refreshSteps,
    requestPermission,
  } = useHealthData();
  const [stepGoal, setStepGoal] = useState(DEFAULT_STEP_GOAL);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(
    !hasPermission && Platform.OS === "ios"
  );

  // Load step goal from database
  useEffect(() => {
    const loadStepGoal = async () => {
      try {
        const savedGoal = await getUserSetting("stepGoal");
        if (savedGoal) {
          setStepGoal(parseInt(savedGoal, 10));
        }
      } catch (err) {
      } finally {
        setLoadingGoal(false);
      }
    };

    loadStepGoal();
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        setShowPermissionPrompt(false);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleRefresh = () => {
    refreshSteps();
  };

  const percentageComplete = Math.min((steps / stepGoal) * 100, 100);

  // Android fallback - HealthKit not available
  if (Platform.OS !== "ios") {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <View style={styles.androidPlaceholder}>
          <MaterialCommunityIcons name="information" size={24} color="#999" />
          <Text style={styles.placeholderText}>Available on iPhone only</Text>
        </View>
      </View>
    );
  }

  // Permission prompt
  if (showPermissionPrompt) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <View style={styles.permissionPrompt}>
          <MaterialCommunityIcons name="lock" size={38} color="#FF6B6B" />
          <Text style={styles.permissionTitle}>Permission Required</Text>
          <Text style={styles.permissionText}>
            Allow access to Apple Health to sync your step count
          </Text>
          {/* <Text style={styles.devClientNote}>
            Note: This feature requires a custom dev client. If you're using
            Expo Go, you'll need to build with EAS.
          </Text> */}
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.permissionButtonText}>Grant Access</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color="#FF9800"
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="refresh"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.retryText}>Retry</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loadingGoal ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginVertical: 20 }}
          />
        ) : (
          <>
            {/* Circular Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.circleBackground}>
                <View
                  style={[
                    styles.circleFill,
                    {
                      width: `${percentageComplete}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.stepsDisplay}>
                <Text style={styles.stepsCount}>{steps.toLocaleString()}</Text>
                <Text style={styles.stepsLabel}>steps</Text>
              </View>
            </View>

            {/* Goal Progress */}
            <View style={styles.goalSection}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Daily Goal</Text>
                <Text style={styles.goalValue}>
                  {stepGoal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Progress</Text>
                <Text
                  style={[
                    styles.goalValue,
                    {
                      color:
                        percentageComplete >= 100
                          ? COLORS.success
                          : COLORS.primary,
                    },
                  ]}
                >
                  {Math.round(percentageComplete)}%
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            {percentageComplete >= 100 ? (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.completedText}>Goal reached!</Text>
              </View>
            ) : (
              <View style={styles.incompleteBadge}>
                <MaterialCommunityIcons name="run" size={16} color="#FF9800" />
                <Text style={styles.incompleteText}>
                  {stepGoal - steps} steps remaining
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.small,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusXL,
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
    borderBottomWidth: 0,
    borderBottomColor: COLORS.workoutBackground,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  refreshButton: {
    padding: SPACING.xs,
  },
  content: {
    marginTop: 0,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: SPACING.container,
    position: "relative",
    height: 140,
    justifyContent: "center",
  },
  circleBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.workoutBackground,
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "absolute",
  },
  circleFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 60,
  },
  stepsDisplay: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 10,
  },
  stepsCount: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  stepsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  goalSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SPACING.small,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    marginBottom: SPACING.small,
  },
  goalInfo: {
    alignItems: "center",
    flex: 1,
  },
  goalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: "500",
  },
  goalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius,
  },
  completedText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.success,
  },
  incompleteBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: "#FFF3E0", // Light warning color - TODO: Add to centralized constants
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius,
  },
  incompleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.warning,
  },
  permissionPrompt: {
    alignItems: "center",
    paddingVertical: SPACING.container,
    paddingHorizontal: SPACING.element,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: SPACING.small,
    marginBottom: SPACING.xs,
  },
  permissionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.small,
    lineHeight: 18,
  },
  devClientNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
    fontStyle: "italic",
    paddingHorizontal: 4,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    minWidth: 150,
    alignItems: "center",
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: SPACING.container,
    paddingHorizontal: SPACING.element,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.small,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.element,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  androidPlaceholder: {
    alignItems: "center",
    paddingVertical: SPACING.container,
    paddingHorizontal: SPACING.element,
  },
  placeholderText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default StepsCard;
