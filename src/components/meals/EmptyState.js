/**
 * EMPTY STATE COMPONENT
 *
 * Displays when no meals are found based on search/filter criteria,
 * or when no meals exist at all.
 *
 * @example
 * <EmptyState
 *   showCreateButton={true}
 *   onCreatePress={() => navigation.navigate('AddNewMeal')}
 * />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../shared/constants';

const EmptyState = ({
  showCreateButton = false,
  onCreatePress,
  title = 'No Meals Found',
  subtitle = 'Try adjusting your search',
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={64}
        color={COLORS.textTertiary}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {showCreateButton && (
        <TouchableOpacity
          style={styles.button}
          onPress={onCreatePress}
        >
          <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Create Meal</Text>
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

export default EmptyState;
