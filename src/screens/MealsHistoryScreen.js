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
import { WeeklyCalendarView } from '../components/layouts';
import { Toast } from '../components/common';
import { COLORS } from '../styles';
import {
  getWeeklyMealData,
  getWeeklyDailyBreakdown,
  getSundayOfWeek,
} from '../services/mealStats';
import { getMacroGoals } from '../services/database';

/**
 * MealsHistoryScreen
 * Shows detailed daily meal history with completion tracking
 */
export default function MealsHistoryScreen({ navigation }) {
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [dailyGoals, setDailyGoals] = useState({
    calorieGoal: 0,
    proteinGoal: 0,
    carbsGoal: 0,
    fatsGoal: 0,
  });
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

      // Get daily breakdown
      const breakdown = await getWeeklyDailyBreakdown(currentSunday);
      setWeeklyBreakdown(breakdown);

      // Get daily goals for completion cards
      const dailyGoalsData = await getMacroGoals(currentSunday);
      if (dailyGoalsData) {
        setDailyGoals(dailyGoalsData);
      }

      // Trigger fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading meal history data:', error);
      setError('Failed to load meal history. Please try again.');
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

  // Check if week has any data
  const hasData = weeklyBreakdown.some(day => day.totalCalories > 0);

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
          {/* Header with week navigation */}
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
                onPress={() => navigation.navigate('LogMeals')}
                style={[styles.actionButton, styles.logButton]}
              >
                <MaterialCommunityIcons name="plus" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>Log</Text>
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
                Start logging your meals to see history
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LogMeals')}
                style={styles.emptyStateButton}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Log Your First Meal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Weekly Calendar View - Daily Completion */}
              <WeeklyCalendarView
                weeklyData={weeklyBreakdown}
                dailyGoal={dailyGoals.calorieGoal}
                selectedDate={null}
                onDateSelect={() => {}}
              />

              {/* Daily Breakdown Summary */}
              <View style={styles.breakdownSection}>
                <Text style={styles.breakdownTitle}>Daily Breakdown</Text>
                {weeklyBreakdown.map((day) => (
                  <View key={day.date} style={styles.dayBreakdown}>
                    <View style={styles.dayBreakdownHeader}>
                      <Text style={styles.dayName}>{day.day}, {day.date}</Text>
                      <Text style={styles.dayCalories}>
                        {Math.round(day.totalCalories)} kcal
                      </Text>
                    </View>
                    <View style={styles.macrosRow}>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Protein</Text>
                        <Text style={styles.macroValue}>{Math.round(day.totalProtein)}g</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Carbs</Text>
                        <Text style={styles.macroValue}>{Math.round(day.totalCarbs)}g</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Fats</Text>
                        <Text style={styles.macroValue}>{Math.round(day.totalFats)}g</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
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
  },
  weekLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  todayButton: {
    backgroundColor: '#2196F3',
  },
  logButton: {
    backgroundColor: '#4CAF50',
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  breakdownSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  dayBreakdown: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
});
