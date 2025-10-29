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
import { WorkoutHistoryModal, WorkoutGoalSettingsModal } from '../components/workouts';
import { StreakCard } from '../components/common';
import { COLORS } from '../styles';
import { getEnabledGoalPreferences, getUserSetting } from '../services/database';
import {
  getWeeklyWorkoutStats,
  getWeeklyWorkoutBreakdown,
  getSundayOfWeek,
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
  const [currentSunday, setCurrentSunday] = useState(
    getSundayOfWeek(new Date().toISOString().split('T')[0])
  );
  const [goalSettingsModalVisible, setGoalSettingsModalVisible] = useState(false);
  const [workoutHistoryModalVisible, setWorkoutHistoryModalVisible] = useState(false);
  const [enabledGoalPreferences, setEnabledGoalPreferences] = useState([]);
  const [streakTrackingMetric, setStreakTrackingMetric] = useState('workouts');
  const [scheduledGoals, setScheduledGoals] = useState({
    totalScheduledWorkouts: 0,
    totalScheduledExercises: 0,
    completedWorkouts: 0,
    completedExercises: 0,
  });

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

  const weekStartDate = currentSunday;

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);

      // Get weekly stats for current week
      const currentStats = await getWeeklyWorkoutStats(weekStartDate);
      setCurrentWeekStats(currentStats);

      // Get weekly stats for last week
      const lastSunday = new Date(weekStartDate);
      lastSunday.setDate(lastSunday.getDate() - 7);
      const lastSundayStr = lastSunday.toISOString().split('T')[0];
      const lastStats = await getWeeklyWorkoutStats(lastSundayStr);
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
      console.error('Error loading workouts:', error);
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
    const prevSunday = new Date(currentSunday);
    prevSunday.setDate(prevSunday.getDate() - 7);
    setCurrentSunday(prevSunday.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextSunday = new Date(currentSunday);
    nextSunday.setDate(nextSunday.getDate() + 7);
    setCurrentSunday(nextSunday.toISOString().split('T')[0]);
  };

  const handleTodayWeek = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentSunday(getSundayOfWeek(today));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const handleGoalSettings = () => {
    setGoalSettingsModalVisible(true);
  };

  const handleGoalSettingsSaved = async (settings) => {
    try {
      // Update streak tracking metric
      if (settings.streakTrackingMetric) {
        setStreakTrackingMetric(settings.streakTrackingMetric);
      }

      // Reload preferences to show any changes
      const prefs = await getEnabledGoalPreferences();
      setEnabledGoalPreferences(prefs);

      // Reload streak metric to ensure it's up to date
      const metric = await getUserSetting('workoutStreakTrackingMetric');
      if (metric) {
        setStreakTrackingMetric(metric);
      }

      console.log('Workout goals saved:', settings);
    } catch (error) {
      console.error('Error saving goal settings:', error);
    }
  };

  const handleWorkoutHistory = () => {
    setWorkoutHistoryModalVisible(true);
  };

  // Format week label
  const formatDateRange = () => {
    const sundayDate = new Date(currentSunday);
    const saturdayDate = new Date(sundayDate);
    saturdayDate.setDate(saturdayDate.getDate() + 6);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sundayMonth = monthNames[sundayDate.getMonth()];
    const sundayDay = sundayDate.getDate();
    const saturdayMonth = monthNames[saturdayDate.getMonth()];
    const saturdayDay = saturdayDate.getDate();

    if (sundayMonth === saturdayMonth) {
      return `${sundayMonth} ${sundayDay} - ${saturdayDay}`;
    } else {
      return `${sundayMonth} ${sundayDay} - ${saturdayMonth} ${saturdayDay}`;
    }
  };

  const weekLabel = formatDateRange();

  // Get streak color based on workout completion and selected metric
  const getStreakColor = (day) => {
    // Determine if any activity on this day
    const hasActivity = day.totalWorkoutsCompleted > 0;

    if (!hasActivity) {
      return { background: '#e0e0e0', border: '#ccc' }; // Gray for no workouts
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
      return { background: '#4CAF50', border: '#4CAF50' }; // Green
    } else if (percentage >= 50) {
      return { background: '#FF9800', border: '#FF9800' }; // Orange
    } else {
      return { background: '#FF6B6B', border: '#FF6B6B' }; // Red
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
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Stats</Text>
              </View>
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
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Stats</Text>
              </View>
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
      <WorkoutGoalSettingsModal
        visible={goalSettingsModalVisible}
        onClose={() => setGoalSettingsModalVisible(false)}
        onSave={handleGoalSettingsSaved}
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
  },
  weekLabel: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  todayButton: {
    backgroundColor: '#2196F3',
  },
  goalButton: {
    backgroundColor: '#FF9800',
  },
  logButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  quickStatUnit: {
    fontSize: 9,
    fontWeight: '500',
    color: '#999',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  sectionToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#4CAF50',
  },
  toggleSwitchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleSwitchKnobActive: {
    alignSelf: 'flex-end',
  },
  historyButton: {
    backgroundColor: '#9C27B0',
  },
  statItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statHeader: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  statsInsightsContainer: {
    gap: 12,
  },
  statInsight: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    lineHeight: 18,
  },
  insightBold: {
    fontWeight: '700',
    color: '#000',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyStatsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyStatsText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
  },
});
