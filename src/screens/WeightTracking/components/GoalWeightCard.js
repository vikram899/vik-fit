/**
 * GOAL WEIGHT CARD COMPONENT
 *
 * Displays an input field for the user to set their goal weight.
 * Uses shared Card component and styling for consistency.
 */

import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

const GoalWeightCard = ({ value, onChangeText }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="target"
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.title}>Goal Weight</Text>
      </View>

      <View style={styles.inputField}>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
        />
        <Text style={styles.unit}>kg</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.element,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    marginLeft: SPACING.small,
    color: COLORS.textPrimary,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mainBackground,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.small,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.element,
    ...TYPOGRAPHY.pageTitle,
    color: COLORS.primary,
  },
  unit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginLeft: SPACING.small,
  },
});

export default GoalWeightCard;
