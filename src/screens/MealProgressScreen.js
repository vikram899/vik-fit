import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeeklySummaryCards } from '../components/layouts';
import { MealsHistoryModal } from '../components/modals';
import { GoalSettingsModal, Toast, StreakCard, BottomSheet, SectionHeader } from '../components/common';
import { COLORS, SPACING, TYPOGRAPHY } from '../shared/constants';
import {
  getWeeklyMealData,
  getWeeklyDailyBreakdown,
  getWeeklyGoals,
  getMondayOfWeek,
} from '../services/mealStats';
import { getMacroGoals, getEnabledGoalPreferences, getUserSetting } from '../services/database';

/**
 * MealProgressScreen
 * Weekly meal analytics dashboard showing totals, goals, trends, and insights
 */
export default function MealProgressScreen({ navigation }) {
  const [currentWeekData, setCurrentWeekData] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [lastWeekData, setLastWeekData] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [weeklyGoals, setWeeklyGoals] = useState({
    calorieGoal: 0,
    proteinGoal: 0,
    carbsGoal: 0,
    fatsGoal: 0,
  });
  const [dailyGoals, setDailyGoals] = useState({
    calorieGoal: 0,
    proteinGoal: 0,
    carbsGoal: 0,
    fatsGoal: 0,
  });
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentMonday, setCurrentSunday] = useState(
    getMondayOfWeek(new Date().toISOString().split('T')[0])
  );
  const [goalSettingsModalVisible, setGoalSettingsModalVisible] = useState(false);
  const [mealHistoryModalVisible, setMealHistoryModalVisible] = useState(false);
  const [enabledGoalPreferences, setEnabledGoalPreferences] = useState([]);
  const [streakTrackingMetric, setStreakTrackingMetric] = useState('calories');
  const [helpBottomSheetVisible, setHelpBottomSheetVisible] = useState(false);
  const [selectedStatHelp, setSelectedStatHelp] = useState(null);

  // Stat labels with descriptions for help
  const statLabels = {
    calorieTarget: {
      label: 'Calorie Target',
      description: 'Shows how many days you hit your calorie goal and trending progress.',
      icon: 'fire',
      iconColor: COLORS.error,
    },
    proteinIntake: {
      label: 'Protein Intake',
      description: 'Compares your protein consumption this week versus last week to track changes.',
      icon: 'flash',
      iconColor: COLORS.primary,
    },
    carbsIntake: {
      label: 'Carbs Intake',
      description: 'Compares your carbs consumption this week versus last week to track changes.',
      icon: 'bread-slice',
      iconColor: COLORS.warning,
    },
    fatsIntake: {
      label: 'Fats Intake',
      description: 'Compares your fats consumption this week versus last week to track changes.',
      icon: 'water',
      iconColor: COLORS.accent,
    },
    mealPrepTips: {
      label: 'Meal Prep Tips',
      description: 'Provides actionable meal prep suggestions to help you stay consistent with your nutrition goals.',
      icon: 'lightbulb-on',
      iconColor: COLORS.warning,
    },
  };

  // Load weekly data
  const loadWeeklyData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Get current week data
      const currentWeek = await getWeeklyMealData(currentMonday);
      setCurrentWeekData(currentWeek);

      // Get last week data
      const lastSunday = new Date(currentMonday);
      lastSunday.setDate(lastSunday.getDate() - 7);
      const lastSundayStr = lastSunday.toISOString().split('T')[0];
      const lastWeek = await getWeeklyMealData(lastSundayStr);
      setLastWeekData(lastWeek);

      // Get weekly goals - query with today's date to find the most recent goals
      const today = new Date().toISOString().split('T')[0];
      const goals = await getWeeklyGoals(today);
      setWeeklyGoals(goals);

      // Get daily goals for breakdown cards
      const dailyGoalsData = await getMacroGoals(currentMonday);
      if (dailyGoalsData) {
        setDailyGoals(dailyGoalsData);
      }

      // Get daily breakdown
      const breakdown = await getWeeklyDailyBreakdown(currentMonday);
      setWeeklyBreakdown(breakdown);

      // Get enabled goal preferences
      const prefs = await getEnabledGoalPreferences();
      setEnabledGoalPreferences(prefs);

      // Get streak tracking metric
      const metric = await getUserSetting('streakTrackingMetric');
      if (metric) {
        setStreakTrackingMetric(metric);
      }

      // Trigger fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      setError('Failed to load meal data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentMonday, fadeAnim]);

  // Load data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadWeeklyData();
    }, [loadWeeklyData])
  );

  const handlePreviousWeek = () => {
    const prevSunday = new Date(currentMonday);
    prevSunday.setDate(prevSunday.getDate() - 7);
    setCurrentSunday(prevSunday.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextSunday = new Date(currentMonday);
    nextSunday.setDate(nextSunday.getDate() + 7);
    setCurrentSunday(nextSunday.toISOString().split('T')[0]);
  };

  const handleTodayWeek = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentSunday(getMondayOfWeek(today));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWeeklyData();
  };

  const handleGoalSettings = () => {
    setGoalSettingsModalVisible(true);
  };

  const handleGoalSettingsSaved = async () => {
    // Reload preferences and metric when settings are changed
    try {
      const prefs = await getEnabledGoalPreferences();
      setEnabledGoalPreferences(prefs);

      // Reload streak tracking metric
      const metric = await getUserSetting('streakTrackingMetric');
      if (metric) {
        setStreakTrackingMetric(metric);
      }
    } catch (error) {
    }
  };

  const handleMealHistory = () => {
    setMealHistoryModalVisible(true);
  };

  // Calculate consistency badge (days with logged meals)
  const daysWithMeals = weeklyBreakdown.filter(
    day => day.totalCalories > 0
  ).length;
  const consistencyBadge = daysWithMeals === 7 ? 'Complete' : `${daysWithMeals}/7 days`;

  // Check if week has any data
  const hasData = weeklyBreakdown.some(day => day.totalCalories > 0);

  // Helper function to get streak color based on metric and daily goals
  const getStreakColor = (day) => {
    if (day.totalCalories === 0) {
      return { background: COLORS.secondaryBackground, border: COLORS.mediumGray }; // Gray for no meals
    }

    let percentage = 0;
    let goal = 0;

    if (streakTrackingMetric === 'calories') {
      percentage = (day.totalCalories / dailyGoals.calorieGoal) * 100;
      goal = dailyGoals.calorieGoal;
    } else if (streakTrackingMetric === 'protein') {
      goal = dailyGoals.proteinGoal;
      percentage = goal > 0 ? (day.totalProtein / goal) * 100 : 0;
    } else if (streakTrackingMetric === 'carbs') {
      goal = dailyGoals.carbsGoal;
      percentage = goal > 0 ? (day.totalCarbs / goal) * 100 : 0;
    } else if (streakTrackingMetric === 'fats') {
      goal = dailyGoals.fatsGoal;
      percentage = goal > 0 ? (day.totalFats / goal) * 100 : 0;
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

  // Format week label with month/day
  const formatDateRange = () => {
    const sundayDate = new Date(currentMonday);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Error Toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          duration={3000}
          onDismiss={() => setError(null)}
        />
      )}

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
                <View style={styles.consistencyBadgeContainer}>
                  <MaterialCommunityIcons
                    name={daysWithMeals === 7 ? 'check-circle' : 'circle-outline'}
                    size={12}
                    color={daysWithMeals === 7 ? '#4CAF50' : '#999'}
                  />
                  <Text style={styles.consistencyBadge}>{consistencyBadge}</Text>
                </View>
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
                onPress={handleMealHistory}
                style={[styles.actionButton, styles.historyButton]}
              >
                <MaterialCommunityIcons name="history" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>History</Text>
              </TouchableOpacity>
            </View>
          </View>


          {/* Stats Section - Meal Logging Streak & Calorie Target */}
          <View style={styles.statsSection}>
            {/* Meal Logging Streak - Using StreakCard Component */}
            <StreakCard
              daysTracked={daysWithMeals}
              totalDays={7}
              trackingMetric={streakTrackingMetric.charAt(0).toUpperCase() + streakTrackingMetric.slice(1)}
              weeklyBreakdown={weeklyBreakdown}
              getStreakColor={getStreakColor}
            />

            {/* Stats - Actionable Insights (Dynamic based on preferences) */}
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
                  {/* Calorie Target Achievement */}
                  {enabledGoalPreferences.some(p => p.statName === 'calorieTarget') && (
                    <View style={styles.statInsight}>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightText}>
                          You hit calorie target{' '}
                          <Text style={styles.insightBold}>
                            {weeklyBreakdown.filter(day => day.totalCalories >= dailyGoals.calorieGoal).length} days
                          </Text>
                        </Text>
                        <View style={styles.trendBadge}>
                          <MaterialCommunityIcons
                            name="trending-up"
                            size={14}
                            color="#4CAF50"
                          />
                          <Text style={styles.trendBadgeText}>+1</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Protein Change */}
                  {enabledGoalPreferences.some(p => p.statName === 'proteinIntake') && (
                    <View style={styles.statInsight}>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightText}>
                          Protein intake{' '}
                          <Text style={styles.insightBold}>
                            +{Math.round(((currentWeekData.totalProtein - lastWeekData.totalProtein) / (lastWeekData.totalProtein || 1)) * 100)}%
                          </Text>
                          {' '}vs last week
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Carbs Change */}
                  {enabledGoalPreferences.some(p => p.statName === 'carbsIntake') && (
                    <View style={styles.statInsight}>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightText}>
                          Carbs intake{' '}
                          <Text style={styles.insightBold}>
                            +{Math.round(((currentWeekData.totalCarbs - lastWeekData.totalCarbs) / (lastWeekData.totalCarbs || 1)) * 100)}%
                          </Text>
                          {' '}vs last week
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Fats Change */}
                  {enabledGoalPreferences.some(p => p.statName === 'fatsIntake') && (
                    <View style={styles.statInsight}>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightText}>
                          Fats intake{' '}
                          <Text style={styles.insightBold}>
                            +{Math.round(((currentWeekData.totalFats - lastWeekData.totalFats) / (lastWeekData.totalFats || 1)) * 100)}%
                          </Text>
                          {' '}vs last week
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Smart Insight - Meal Prep Suggestion */}
                  {enabledGoalPreferences.some(p => p.statName === 'mealPrepTips') && (
                    <View style={[styles.statInsight, styles.insightWarning]}>
                      <View style={styles.insightRow}>
                        <MaterialCommunityIcons
                          name="lightbulb-on"
                          size={16}
                          color="#FF9800"
                        />
                        <Text style={[styles.insightText, styles.warningText]}>
                          You skipped <Text style={styles.insightBold}>lunch twice</Text> — consider prepping meals
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
          </View>

          {/* Weekly Summary Cards */}
          <WeeklySummaryCards
            currentWeekData={currentWeekData}
            lastWeekData={lastWeekData}
            weeklyGoals={weeklyGoals}
          />
        </ScrollView>
      </Animated.View>

      {/* Goal Settings Modal */}
      <GoalSettingsModal
        visible={goalSettingsModalVisible}
        onClose={() => setGoalSettingsModalVisible(false)}
        onSettingsSaved={handleGoalSettingsSaved}
        type="meals"
        trackingMetricSettingKey="streakTrackingMetric"
      />

      {/* Meal History Modal */}
      <MealsHistoryModal
        visible={mealHistoryModalVisible}
        onClose={() => setMealHistoryModalVisible(false)}
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
            Your stats show actionable insights about your nutrition patterns. Each stat compares your current performance to previous weeks and highlights trends.
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
  consistencyBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  consistencyBadge: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
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
  historyButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.container,
    paddingHorizontal: SPACING.element,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.element,
    marginBottom: SPACING.small,
  },
  emptyStateSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.container,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.container,
    borderRadius: SPACING.borderRadiusSmall,
  },
  emptyStateButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
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
  statsSection: {
    paddingVertical: SPACING.medium,
    marginBottom: SPACING.container,
    gap: SPACING.element,
  },
  statItem: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginHorizontal: SPACING.element,
    marginBottom: 0,
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
  insightWarning: {
    backgroundColor: COLORS.tertiaryBackground,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
    borderRadius: SPACING.borderRadiusSmall,
    marginTop: SPACING.xs,
  },
  warningText: {
    color: COLORS.warning,
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
