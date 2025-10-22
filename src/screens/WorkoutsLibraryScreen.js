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

  const weekStartDate = getSundayOfWeek(new Date().toISOString().split('T')[0]);

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
          {/* Weekly Summary Cards */}
          <WeeklyWorkoutSummaryCards
            currentWeekData={currentWeekStats}
            lastWeekData={lastWeekStats}
          />

          {/* Weekly Completion Calendar Toggle */}
          <View style={styles.sectionToggleContainer}>
            <Text style={styles.sectionToggleLabel}>Weekly Completion</Text>
            <TouchableOpacity
              onPress={() => setShowCalendar(!showCalendar)}
              style={[styles.toggleSwitch, showCalendar && styles.toggleSwitchActive]}
            >
              <View style={[styles.toggleSwitchKnob, showCalendar && styles.toggleSwitchKnobActive]} />
            </TouchableOpacity>
          </View>

          {/* Weekly Completion Calendar */}
          {showCalendar && (
            <WeeklyWorkoutCalendar
              weeklyData={weeklyBreakdown}
            />
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
