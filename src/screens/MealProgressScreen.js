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
import { MealsHistoryModal } from '../components/meals';
import { GoalSettingsModal } from '../components/common';
import { Toast, StreakCard } from '../components/common';
import { COLORS } from '../styles';
import {
  getWeeklyMealData,
  getWeeklyDailyBreakdown,
  getWeeklyGoals,
  getSundayOfWeek,
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
  const [currentSunday, setCurrentSunday] = useState(
    getSundayOfWeek(new Date().toISOString().split('T')[0])
  );
  const [goalSettingsModalVisible, setGoalSettingsModalVisible] = useState(false);
  const [mealHistoryModalVisible, setMealHistoryModalVisible] = useState(false);
  const [enabledGoalPreferences, setEnabledGoalPreferences] = useState([]);
  const [streakTrackingMetric, setStreakTrackingMetric] = useState('calories');

  // Load weekly data
  const loadWeeklyData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Get current week data
      const currentWeek = await getWeeklyMealData(currentSunday);
      setCurrentWeekData(currentWeek);

      // Get last week data
      const lastSunday = new Date(currentSunday);
      lastSunday.setDate(lastSunday.getDate() - 7);
      const lastSundayStr = lastSunday.toISOString().split('T')[0];
      const lastWeek = await getWeeklyMealData(lastSundayStr);
      setLastWeekData(lastWeek);

      // Get weekly goals - query with today's date to find the most recent goals
      const today = new Date().toISOString().split('T')[0];
      const goals = await getWeeklyGoals(today);
      setWeeklyGoals(goals);

      // Get daily goals for breakdown cards
      const dailyGoalsData = await getMacroGoals(currentSunday);
      if (dailyGoalsData) {
        setDailyGoals(dailyGoalsData);
      }

      // Get daily breakdown
      const breakdown = await getWeeklyDailyBreakdown(currentSunday);
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
      console.error('Error loading weekly meal data:', error);
      setError('Failed to load meal data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSunday, fadeAnim]);

  // Load data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadWeeklyData();
    }, [loadWeeklyData])
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
      console.error('Error loading goal preferences:', error);
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
      return { background: '#f5f5f5', border: '#ddd' }; // Gray for no meals
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

  // Format week label with month/day
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


          {/* Empty State */}
          {!hasData ? (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons
                name="food-off"
                size={64}
                color="#ccc"
              />
              <Text style={styles.emptyStateTitle}>No Meals Logged</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start logging your meals to see weekly insights
              </Text>
              <TouchableOpacity
                onPress={handleMealHistory}
                style={styles.emptyStateButton}
              >
                <MaterialCommunityIcons name="history" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>View Meal History</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                    <View style={styles.statHeader}>
                      <Text style={styles.statLabel}>Stats</Text>
                    </View>
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
              </View>

              {/* Weekly Summary Cards */}
              <WeeklySummaryCards
                currentWeekData={currentWeekData}
                lastWeekData={lastWeekData}
                weeklyGoals={weeklyGoals}
              />


            </>
          )}
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
  consistencyBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  consistencyBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
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
  historyButton: {
    backgroundColor: '#9C27B0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  statsSection: {
    paddingVertical: 12,
    marginBottom: 20,
    gap: 16,
  },
  statItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 16,
    marginBottom: 0,
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
  insightWarning: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  warningText: {
    color: '#E65100',
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
