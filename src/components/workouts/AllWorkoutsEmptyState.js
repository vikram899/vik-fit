import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../shared/constants';

/**
 * AllWorkoutsEmptyState Component
 * Reusable empty state for when no workouts are found
 *
 * Props:
 * - hasAnyWorkouts: boolean - whether any workouts exist
 * - onCreatePress: function - callback when user clicks create button
 */
const AllWorkoutsEmptyState = ({ hasAnyWorkouts = false, onCreatePress }) => {
  const isNoWorkoutsAtAll = !hasAnyWorkouts;

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="dumbbell"
        size={64}
        color={COLORS.textTertiary}
      />
      <Text style={styles.title}>
        {isNoWorkoutsAtAll ? 'No Workouts Created' : 'No Workouts Found'}
      </Text>
      <Text style={styles.subtitle}>
        {isNoWorkoutsAtAll
          ? 'Create your first workout routine'
          : 'Try adjusting your search or filters'}
      </Text>
      {isNoWorkoutsAtAll && (
        <TouchableOpacity
          onPress={onCreatePress}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={COLORS.white}
          />
          <Text style={styles.buttonText}>Create Workout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.container * 2,
    paddingHorizontal: SPACING.element,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginTop: SPACING.small,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: SPACING.container,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.container,
    borderRadius: SPACING.borderRadius,
  },
  buttonText: {
    ...TYPOGRAPHY.small,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});

export default AllWorkoutsEmptyState;
