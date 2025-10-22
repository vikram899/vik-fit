import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WeeklyWorkoutSummaryCards from '../components/WeeklyWorkoutSummaryCards';
import WeeklyWorkoutCalendar from '../components/WeeklyWorkoutCalendar';
import { COLORS } from '../styles';
import {
  getWeeklyWorkoutStats,
  getWeeklyWorkoutBreakdown,
  getSundayOfWeek,
} from '../services/workoutStats';

/**
 * WorkoutsLibraryScreen
 * Dashboard showing weekly workout analytics
 */
export default function WorkoutsLibraryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentWeekStats, setCurrentWeekStats] = useState({ workoutsCompleted: 0, exercisesCompleted: 0 });
  const [lastWeekStats, setLastWeekStats] = useState({ workoutsCompleted: 0, exercisesCompleted: 0 });
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [showCalendar, setShowCalendar] = useState(true);
  const [currentSunday, setCurrentSunday] = useState(
    getSundayOfWeek(new Date().toISOString().split('T')[0])
  );
  const [weeklyGoal, setWeeklyGoal] = useState(7); // Default goal of 7 workouts per week

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

  const handleGoalSettings = () => {
    // Navigate to goal settings
  };

  const handleLogWorkout = () => {
    navigation.navigate('LogWorkout');
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
                onPress={handleLogWorkout}
                style={[styles.actionButton, styles.logButton]}
              >
                <MaterialCommunityIcons name="plus" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats Header */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>This Week</Text>
              <Text style={styles.quickStatValue}>
                {currentWeekStats.workoutsCompleted}
              </Text>
              <Text style={styles.quickStatUnit}>workouts</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Goal</Text>
              <Text style={styles.quickStatValue}>
                {weeklyGoal}
              </Text>
              <Text style={styles.quickStatUnit}>workouts</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Progress</Text>
              <Text style={[styles.quickStatValue, { color: (currentWeekStats.workoutsCompleted / weeklyGoal) >= 0.9 ? '#4CAF50' : '#FF9800' }]}>
                {Math.round((currentWeekStats.workoutsCompleted / weeklyGoal) * 100)}%
              </Text>
              <Text style={styles.quickStatUnit}>complete</Text>
            </View>
          </View>

          {/* Weekly Summary Cards */}
          <WeeklyWorkoutSummaryCards
            currentWeekData={currentWeekStats}
            lastWeekData={lastWeekStats}
          />

          {/* Weekly Completion Calendar */}
          <WeeklyWorkoutCalendar
            weeklyData={weeklyBreakdown}
          />
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
});
