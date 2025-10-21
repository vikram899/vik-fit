import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Button from '../components/Button';
import { COLORS } from '../constants/colors';
import { SPACING, TYPOGRAPHY } from '../constants/spacing';

/**
 * WorkoutsScreen
 * Form for logging workouts with exercise name, sets, reps, and weight
 */
export default function WorkoutsScreen({ navigation }) {
  const [count, setCount] = useState(0);

  const handleLogWorkout = () => {
    console.log('✅ Log Workout button pressed!');
    setCount(count + 1);
    Alert.alert('Success', `Workout logged! Count: ${count + 1}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Log Workout</Text>

        <Text style={styles.count}>Workouts: {count}</Text>

        <Button
          title="Log Workout"
          onPress={handleLogWorkout}
          accessibilityLabel="Log a new workout"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.screenTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.container,
  },
  count: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.container,
    fontSize: 32,
  },
});
