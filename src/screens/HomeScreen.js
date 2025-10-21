import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS } from '../constants/colors';
import { SPACING, TYPOGRAPHY } from '../constants/spacing';
import { formatDate } from '../utils/helpers';
import { useWorkouts } from '../hooks/useWorkouts';
import { useMeals } from '../hooks/useMeals';

/**
 * HomeScreen
 * Main dashboard showing quick action buttons and today's summary
 */
export default function HomeScreen({ navigation }) {
  const { getTodayWorkoutCount } = useWorkouts();
  const { getTodayMealCount } = useMeals();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Update date when component mounts
    setCurrentDate(new Date());
  }, []);

  const todayWorkouts = getTodayWorkoutCount();
  const todayMeals = getTodayMealCount();

  const handleLogWorkout = () => {
    navigation.navigate('WorkoutsTab');
  };

  const handleLogMeal = () => {
    navigation.navigate('Meals');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>VikFit</Text>
          <Text style={styles.date}>{formatDate(currentDate)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Log Workout"
            onPress={handleLogWorkout}
            accessibilityLabel="Log a new workout"
            style={styles.actionButton}
          />
          <Button
            title="Log Meal"
            onPress={handleLogMeal}
            accessibilityLabel="Log a new meal"
            style={styles.actionButton}
          />
        </View>

        {/* Today's Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Progress</Text>

          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Workouts Logged</Text>
              <Text style={styles.summaryCount}>{todayWorkouts}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Meals Logged</Text>
              <Text style={styles.summaryCount}>{todayMeals}</Text>
            </View>
          </View>
        </Card>

        {/* Quick Tip */}
        <Card style={styles.tipCard} elevated={false}>
          <Text style={styles.tipTitle}>💡 Quick Tip</Text>
          <Text style={styles.tipText}>
            Log your workouts right after finishing them for better accuracy.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.container,
    paddingTop: SPACING.container,
    paddingBottom: SPACING.container,
  },
  header: {
    marginBottom: SPACING.container,
  },
  appName: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  date: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    marginBottom: SPACING.container,
    gap: SPACING.element,
  },
  actionButton: {
    width: '100%',
  },
  summaryCard: {
    marginBottom: SPACING.container,
  },
  summaryTitle: {
    ...TYPOGRAPHY.screenTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.element,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SPACING.element,
  },
  tipCard: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.element,
  },
  tipTitle: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  tipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
