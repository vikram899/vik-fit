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
import { WeeklySummaryCards, WeeklyCalendarView } from '../components/layouts';
import { Toast } from '../components/common';
import { COLORS } from '../styles';
import {
  getWeeklyMealData,
  getWeeklyDailyBreakdown,
  getWeeklyGoals,
  getSundayOfWeek,
} from '../services/mealStats';
import { getMacroGoals } from '../services/database';

/**
 * MealsScreen
 * Weekly meal summary dashboard showing totals, goals, and daily breakdown
 */
export default function MealsScreen({ navigation }) {
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

      // Get weekly goals
      const goals = await getWeeklyGoals(currentSunday);
      setWeeklyGoals(goals);

      // Get daily goals for breakdown cards
      const dailyGoalsData = await getMacroGoals(currentSunday);
      if (dailyGoalsData) {
        setDailyGoals(dailyGoalsData);
      }

      // Get daily breakdown
      const breakdown = await getWeeklyDailyBreakdown(currentSunday);
      setWeeklyBreakdown(breakdown);

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
    // Navigate to settings or goal settings screen
    // For now, show an alert
    Alert.alert(
      'Macro Goals',
      'Daily Goals:\n\nCalories: ' + Math.round(dailyGoals.calorieGoal) + '\nProtein: ' + Math.round(dailyGoals.proteinGoal) + 'g\nCarbs: ' + Math.round(dailyGoals.carbsGoal) + 'g\nFats: ' + Math.round(dailyGoals.fatsGoal) + 'g',
      [{ text: 'OK' }]
    );
  };

  const handleLogMeal = () => {
    navigation.navigate('LogMeals');
  };

  // Calculate consistency badge (days with logged meals)
  const daysWithMeals = weeklyBreakdown.filter(
    day => day.totalCalories > 0
  ).length;
  const consistencyBadge = daysWithMeals === 7 ? 'Complete' : `${daysWithMeals}/7 days`;

  // Check if week has any data
  const hasData = weeklyBreakdown.some(day => day.totalCalories > 0);

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
                onPress={handleLogMeal}
                style={[styles.actionButton, styles.logButton]}
              >
                <MaterialCommunityIcons name="plus" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats Header */}
          {hasData && (
            <View style={styles.quickStatsContainer}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>This Week</Text>
                <Text style={styles.quickStatValue}>
                  {Math.round(currentWeekData.totalCalories)}
                </Text>
                <Text style={styles.quickStatUnit}>kcal</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>Goal</Text>
                <Text style={styles.quickStatValue}>
                  {Math.round(weeklyGoals.calorieGoal)}
                </Text>
                <Text style={styles.quickStatUnit}>kcal</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>Progress</Text>
                <Text style={[styles.quickStatValue, { color: weeklyGoals.calorieGoal > 0 && (currentWeekData.totalCalories / weeklyGoals.calorieGoal) >= 0.9 ? '#4CAF50' : '#FF9800' }]}>
                  {weeklyGoals.calorieGoal > 0 ? Math.round((currentWeekData.totalCalories / weeklyGoals.calorieGoal) * 100) : 0}%
                </Text>
                <Text style={styles.quickStatUnit}>complete</Text>
              </View>
            </View>
          )}

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
                onPress={handleLogMeal}
                style={styles.emptyStateButton}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Log Your First Meal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Weekly Summary Cards */}
              <WeeklySummaryCards
                currentWeekData={currentWeekData}
                lastWeekData={lastWeekData}
                weeklyGoals={weeklyGoals}
              />

              {/* Weekly Calendar View */}
              <WeeklyCalendarView
                weeklyData={weeklyBreakdown}
                dailyGoal={dailyGoals.calorieGoal}
                selectedDate={null}
                onDateSelect={() => {}}
              />

            </>
          )}
        </ScrollView>
      </Animated.View>
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
});
