import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeeklyWorkoutSummaryCards } from '../components/layouts';
import { WorkoutHistoryModal } from '../components/workouts';
import { StreakCard, GoalSettingsModal, BottomSheet, SectionHeader } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../shared/constants';
import { getEnabledGoalPreferences, getUserSetting } from '../services/database';
import {
  getWeeklyWorkoutStats,
  getWeeklyWorkoutBreakdown,
  getMondayOfWeek,
  getWeeklyScheduledGoals,
} from '../services/workoutStats';

/**
 * WorkoutProgressScreen
 * Dashboard showing weekly workout analytics
 */
export default function WorkoutProgressScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentWeekStats, setCurrentWeekStats] = useState({ workoutsCompleted: 0, exercisesCompleted: 0 });
  const [lastWeekStats, setLastWeekStats] = useState({ workoutsCompleted: 0, exercisesCompleted: 0 });
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [showCalendar, setShowCalendar] = useState(true);
  const [currentMonday, setCurrentMonday] = useState(
    getMondayOfWeek(new Date().toISOString().split('T')[0])
  );
  const [goalSettingsModalVisible, setGoalSettingsModalVisible] = useState(false);
  const [workoutHistoryModalVisible, setWorkoutHistoryModalVisible] = useState(false);
  const [enabledGoalPreferences, setEnabledGoalPreferences] = useState([]);
  const [streakTrackingMetric, setStreakTrackingMetric] = useState('workouts');
  const [helpBottomSheetVisible, setHelpBottomSheetVisible] = useState(false);
  const [selectedStatHelp, setSelectedStatHelp] = useState(null);
  const [scheduledGoals, setScheduledGoals] = useState({
    totalScheduledWorkouts: 0,
    totalScheduledExercises: 0,
    completedWorkouts: 0,
    completedExercises: 0,
  });

  // Stat labels with descriptions for help
  const statLabels = {
    workoutTarget: {
      label: 'Workout Target',
      description: 'Shows completed vs scheduled workouts and tracks your progress toward weekly goals.',
      icon: 'target',
      iconColor: COLORS.primary,
    },
    exercisesCompleted: {
      label: 'Exercises',
      description: 'Shows completed vs scheduled exercises to track exercise variety and volume.',
      icon: 'check-circle',
      iconColor: COLORS.success,
    },
    consistency: {
      label: 'Consistency',
      description: 'Shows how many days you logged workouts to track your workout frequency.',
      icon: 'calendar-check',
      iconColor: COLORS.warning,
    },
    strengthStats: {
      label: 'Strength',
      description: 'Displays strength progress and personal records for key lifts.',
      icon: 'dumbbell',
      iconColor: COLORS.error,
    },
    volumeStats: {
      label: 'Volume',
      description: 'Shows total training volume and reps completed to track workout intensity.',
      icon: 'chart-box',
      iconColor: COLORS.accent,
    },
    restTimeStats: {
      label: 'Rest Time',
      description: 'Shows average rest time between sets to monitor recovery pacing.',
      icon: 'timer',
      iconColor: COLORS.info,
    },
    recoveryStats: {
      label: 'Recovery',
      description: 'Shows recovery status and rest day metrics for optimal performance.',
      icon: 'heart-pulse',
      iconColor: COLORS.danger,
    },
  };

  // Search, Filter, Sort state
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [filterOptions, setFilterOptions] = useState({
    starred: false,
    veg: false,
    "non-veg": false,
    egg: false,
    vegan: false,
  });

  const weekStartDate = currentMonday;

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);

      // Get weekly stats for current week
      const currentStats = await getWeeklyWorkoutStats(weekStartDate);
      setCurrentWeekStats(currentStats);

      // Get weekly stats for last week
      const lastMonday = new Date(weekStartDate);
      lastMonday.setDate(lastMonday.getDate() - 7);
      const lastMondayStr = lastMonday.toISOString().split('T')[0];
      const lastStats = await getWeeklyWorkoutStats(lastMondayStr);
      setLastWeekStats(lastStats);

      // Get daily breakdown for the week
      const breakdown = await getWeeklyWorkoutBreakdown(weekStartDate);
      setWeeklyBreakdown(breakdown);

      // Load enabled goal preferences
      const prefs = await getEnabledGoalPreferences();
      setEnabledGoalPreferences(prefs);

      // Load workout streak tracking metric
      const metric = await getUserSetting('workoutStreakTrackingMetric');
      if (metric) {
        setStreakTrackingMetric(metric);
      }

      // Load scheduled goals for the week
      const goals = await getWeeklyScheduledGoals(weekStartDate);
      setScheduledGoals(goals);

      // Trigger fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [weekStartDate, fadeAnim]);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const handlePreviousWeek = () => {
    const prevMonday = new Date(currentMonday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    setCurrentMonday(prevMonday.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextMonday = new Date(currentMonday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    setCurrentMonday(nextMonday.toISOString().split('T')[0]);
  };

  const handleTodayWeek = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentMonday(getMondayOfWeek(today));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const handleGoalSettings = () => {
    setGoalSettingsModalVisible(true);
  };

  const handleGoalSettingsSaved = async (settings = {}) => {
    try {
      // Update streak tracking metric if provided
      if (settings.workoutStreakTrackingMetric) {
        setStreakTrackingMetric(settings.workoutStreakTrackingMetric);
      }

      // Reload preferences to show any changes
      const prefs = await getEnabledGoalPreferences();
      setEnabledGoalPreferences(prefs);

      // Reload streak metric to ensure it's up to date
      const metric = await getUserSetting('workoutStreakTrackingMetric');
      if (metric) {
        setStreakTrackingMetric(metric);
      }

    } catch (error) {
    }
  };

  const handleWorkoutHistory = () => {
    setWorkoutHistoryModalVisible(true);
  };

  // Format week label
  const formatDateRange = () => {
    const mondayDate = new Date(currentMonday);
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mondayMonth = monthNames[mondayDate.getMonth()];
    const mondayDay = mondayDate.getDate();
    const sundayMonth = monthNames[sundayDate.getMonth()];
    const sundayDay = sundayDate.getDate();

    if (mondayMonth === sundayMonth) {
      return `${mondayMonth} ${mondayDay} - ${sundayDay}`;
    } else {
      return `${mondayMonth} ${mondayDay} - ${sundayMonth} ${sundayDay}`;
    }
  };

  const weekLabel = formatDateRange();

  // Get streak color based on workout completion and selected metric
  const getStreakColor = (day) => {
    // Determine if any activity on this day
    const hasActivity = day.totalWorkoutsCompleted > 0;

    if (!hasActivity) {
      return { background: COLORS.mediumGray, border: COLORS.mediumGray }; // Gray for no workouts
    }

    // Calculate percentage based on selected tracking metric
    let percentage = 0;

    if (streakTrackingMetric === 'exercises') {
      // For exercises: calculate based on exercises completed today vs total scheduled
      // We approximate by counting exercises from completed workouts
      const totalScheduledDailyExercises = day.assignedWorkouts.reduce((sum, w) => {
        // Count exercises for each assigned workout
        return sum + (w.exerciseCount || 0);
      }, 0);
      percentage = totalScheduledDailyExercises > 0
        ? (day.totalExercisesCompleted / totalScheduledDailyExercises) * 100
        : 0;
    } else {
      // For workouts: calculate based on workouts completed today vs assigned
      percentage = day.totalWorkoutsAssigned > 0
        ? (day.totalWorkoutsCompleted / day.totalWorkoutsAssigned) * 100
        : 0;
    }

    if (percentage >= 80) {
      return { background: COLORS.success, border: COLORS.success }; // Green
    } else if (percentage >= 50) {
      return { background: COLORS.warning, border: COLORS.warning }; // Orange
    } else {
      return { background: COLORS.error, border: COLORS.error }; // Red
    }
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Header with week navigation and action buttons */}
          <View style={styles.header}>
            <View style={styles.weekNavigation}>
              <TouchableOpacity
                onPress={handlePreviousWeek}
                style={styles.navButton}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>

              <View style={styles.weekLabel}>
                <Text style={styles.weekLabelText}>{weekLabel}</Text>
              </View>

              <TouchableOpacity
                onPress={handleNextWeek}
                style={styles.navButton}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={handleTodayWeek}
                style={[styles.actionButton, styles.todayButton]}
              >
                <MaterialCommunityIcons name="calendar-today" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGoalSettings}
                style={[styles.actionButton, styles.goalButton]}
              >
                <MaterialCommunityIcons name="target" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>Goals</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleWorkoutHistory}
                style={[styles.actionButton, styles.historyButton]}
              >
                <MaterialCommunityIcons name="history" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>History</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section - Workout Completion Streak */}
          <StreakCard
            daysTracked={weeklyBreakdown.filter(day => day.totalWorkoutsCompleted > 0).length}
            totalDays={7}
            trackingMetric={streakTrackingMetric.charAt(0).toUpperCase() + streakTrackingMetric.slice(1)}
            weeklyBreakdown={weeklyBreakdown}
            getStreakColor={getStreakColor}
          />

          {/* Stats Section - Actionable Insights */}
          {enabledGoalPreferences.length > 0 && (
            <View style={styles.statItem}>
              <SectionHeader
                title="Stats"
                onHelpPress={() => {
                  setSelectedStatHelp('statsOverview');
                  setHelpBottomSheetVisible(true);
                }}
              />
              <View style={styles.statsInsightsContainer}>
                {/* Workout Goal Achievement */}
                {enabledGoalPreferences.some(p => p.statName === 'workoutTarget') && (
                  <View style={styles.statInsight}>
                    <View style={styles.insightRow}>
                      <Text style={styles.insightText}>
                        You completed{' '}
                        <Text style={styles.insightBold}>
                          {scheduledGoals.completedWorkouts}/{scheduledGoals.totalScheduledWorkouts} workouts
                        </Text>
                      </Text>
                      <View style={styles.trendBadge}>
                        <MaterialCommunityIcons
                          name={scheduledGoals.completedWorkouts > lastWeekStats.workoutsCompleted ? 'trending-up' : 'trending-down'}
                          size={14}
                          color={scheduledGoals.completedWorkouts > lastWeekStats.workoutsCompleted ? '#4CAF50' : '#FF6B6B'}
                        />
                        <Text style={[styles.trendBadgeText, { color: scheduledGoals.completedWorkouts > lastWeekStats.workoutsCompleted ? '#4CAF50' : '#FF6B6B' }]}>
                          {scheduledGoals.completedWorkouts > lastWeekStats.workoutsCompleted ? '+' : ''}{scheduledGoals.completedWorkouts - lastWeekStats.workoutsCompleted}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Exercises Completed */}
                {enabledGoalPreferences.some(p => p.statName === 'exercisesCompleted') && (
                  <View style={styles.statInsight}>
                    <View style={styles.insightRow}>
                      <Text style={styles.insightText}>
                        You completed{' '}
                        <Text style={styles.insightBold}>
                          {scheduledGoals.completedExercises}/{scheduledGoals.totalScheduledExercises} exercises
                        </Text>
                      </Text>
                      <View style={styles.trendBadge}>
                        <MaterialCommunityIcons
                          name={scheduledGoals.completedExercises > lastWeekStats.exercisesCompleted ? 'trending-up' : 'trending-down'}
                          size={14}
                          color={scheduledGoals.completedExercises > lastWeekStats.exercisesCompleted ? '#4CAF50' : '#FF6B6B'}
                        />
                        <Text style={[styles.trendBadgeText, { color: scheduledGoals.completedExercises > lastWeekStats.exercisesCompleted ? '#4CAF50' : '#FF6B6B' }]}>
                          {scheduledGoals.completedExercises > lastWeekStats.exercisesCompleted ? '+' : ''}{scheduledGoals.completedExercises - lastWeekStats.exercisesCompleted}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Consistency Insight */}
                {enabledGoalPreferences.some(p => p.statName === 'consistency') && (
                  <View style={styles.statInsight}>
                    <View style={styles.insightRow}>
                      <Text style={styles.insightText}>
                        You logged workouts{' '}
                        <Text style={styles.insightBold}>
                          {weeklyBreakdown.filter(day => day.totalWorkoutsCompleted > 0).length}/7 days
                        </Text>
                        {' '}this week
                      </Text>
                    </View>
                  </View>
                )}

                {/* Strength Stats */}
                {enabledGoalPreferences.some(p => p.statName === 'strengthStats') && (
                  <View style={styles.statInsight}>
                    <View style={styles.insightRow}>
                      <Text style={styles.insightText}>
                        Max strength increased by{' '}
                        <Text style={styles.insightBold}>
                          +12%
                        </Text>
                        {' '}this month
                      </Text>
                    </View>
                  </View>
                )}

                {/* Volume Stats */}
                {enabledGoalPreferences.some(p => p.statName === 'volumeStats') && (
                  <View style={styles.statInsight}>
                    <View style={styles.insightRow}>
                      <Text style={styles.insightText}>
                        Total volume{' '}
                        <Text style={styles.insightBold}>
                          45,200 kg
                        </Text>
                        {' '}this week
                      </Text>
                    </View>
                  </View>
                )}

                {/* Rest Time Stats */}
                {enabledGoalPreferences.some(p => p.statName === 'restTimeStats') && (
                  <View style={styles.statInsight}>
                    <View style={styles.insightRow}>
                      <Text style={styles.insightText}>
                        Average rest time{' '}
                        <Text style={styles.insightBold}>
                          90 seconds
                        </Text>
                        {' '}between sets
                      </Text>
                    </View>
                  </View>
                )}

                {/* Recovery Stats */}
                {enabledGoalPreferences.some(p => p.statName === 'recoveryStats') && (
                  <View style={styles.statInsight}>
                    <View style={styles.insightRow}>
                      <Text style={styles.insightText}>
                        Recovery status:{' '}
                        <Text style={styles.insightBold}>
                          Optimal
                        </Text>
                        {' '}— Well rested
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Empty Stats Message */}
          {enabledGoalPreferences.length === 0 && (
            <View style={styles.statItem}>
              <SectionHeader
                title="Stats"
                onHelpPress={() => {
                  setSelectedStatHelp('statsOverview');
                  setHelpBottomSheetVisible(true);
                }}
              />
              <View style={styles.emptyStatsContainer}>
                <MaterialCommunityIcons
                  name="tune"
                  size={24}
                  color="#ccc"
                />
                <Text style={styles.emptyStatsText}>
                  No stats selected. Configure from Goals button.
                </Text>
              </View>
            </View>
          )}

          {/* Weekly Summary Cards */}
          <WeeklyWorkoutSummaryCards
            currentWeekData={currentWeekStats}
            lastWeekData={lastWeekStats}
            scheduledGoals={scheduledGoals}
          />
        </ScrollView>
      </Animated.View>

      {/* Workout History Modal */}
      <WorkoutHistoryModal
        visible={workoutHistoryModalVisible}
        onClose={() => setWorkoutHistoryModalVisible(false)}
      />

      {/* Workout Goal Settings Modal */}
      <GoalSettingsModal
        visible={goalSettingsModalVisible}
        onClose={() => setGoalSettingsModalVisible(false)}
        onSettingsSaved={handleGoalSettingsSaved}
        type="workouts"
        trackingMetricSettingKey="workoutStreakTrackingMetric"
      />

      {/* Help Bottom Sheets for Stats */}
      <BottomSheet
        visible={helpBottomSheetVisible && selectedStatHelp === 'statsOverview'}
        onClose={() => {
          setHelpBottomSheetVisible(false);
          setSelectedStatHelp(null);
        }}
        title="About Stats"
      >
        <View style={{ gap: SPACING.element }}>
          <Text style={{ fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary, lineHeight: 22 }}>
            Your stats show actionable insights about your workout patterns. Each stat compares your current performance to previous weeks and highlights trends.
          </Text>
          <View style={{ backgroundColor: COLORS.secondaryBackground, borderRadius: SPACING.borderRadiusSmall, padding: SPACING.medium, gap: SPACING.medium }}>
            {enabledGoalPreferences.map(pref => {
              const stat = statLabels[pref.statName];
              if (!stat) return null;
              return (
                <View key={pref.statName} style={{ gap: SPACING.small }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.small }}>
                    <MaterialCommunityIcons
                      name={stat.icon}
                      size={18}
                      color={stat.iconColor}
                    />
                    <Text style={{ fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm }}>
                      {stat.label}
                    </Text>
                  </View>
                  <Text style={{ fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary, marginLeft: 26 }}>
                    {stat.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
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
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    gap: SPACING.medium,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  navButton: {
    padding: SPACING.small,
  },
  weekLabel: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  weekLabelText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.small,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: SPACING.borderRadiusSmall,
  },
  todayButton: {
    backgroundColor: COLORS.primary,
  },
  goalButton: {
    backgroundColor: COLORS.warning,
  },
  logButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.secondaryBackground,
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    alignItems: 'center',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  quickStatValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  quickStatUnit: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.mediumGray,
    marginHorizontal: SPACING.small,
  },
  sectionToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.element,
    marginBottom: SPACING.medium,
    marginTop: SPACING.small,
  },
  sectionToggleLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.mediumGray,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.success,
  },
  toggleSwitchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  toggleSwitchKnobActive: {
    alignSelf: 'flex-end',
  },
  historyButton: {
    backgroundColor: COLORS.accent,
  },
  statItem: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginHorizontal: SPACING.element,
    marginBottom: SPACING.element,
  },
  statsInsightsContainer: {
    gap: SPACING.medium,
  },
  statInsight: {
    paddingVertical: SPACING.small,
    paddingHorizontal: 0,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.small,
  },
  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: 18,
  },
  insightBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.tertiaryBackground,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadiusSmall,
  },
  trendBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
  emptyStatsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.container,
    gap: SPACING.small,
  },
  emptyStatsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
});
