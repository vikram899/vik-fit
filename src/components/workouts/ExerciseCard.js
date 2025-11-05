import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { STRINGS } from '../../constants/strings';
import { COLORS, SPACING, TYPOGRAPHY } from '../../shared/constants';

const ExerciseCard = ({ exercise, onDelete, onEdit, showDeleteButton = true, showEditButton = false, disabled = false }) => {
  return (
    <View style={styles.exerciseDetailsCard}>
      <View style={styles.exerciseCardHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.headerRight}>
          {(exercise.restTime || 0) > 0 && (
            <Text style={styles.timeDisplay}>{exercise.restTime} {STRINGS.exerciseCard.units.seconds}</Text>
          )}
          {showEditButton && (
            <TouchableOpacity
              onPress={onEdit}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={COLORS.info} />
            </TouchableOpacity>
          )}
          {showDeleteButton && (
            <TouchableOpacity
              onPress={onDelete}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.exerciseDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{STRINGS.exerciseCard.detailLabels.sets}</Text>
          <Text style={styles.detailValue}>{exercise.sets}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{STRINGS.exerciseCard.detailLabels.reps}</Text>
          <Text style={styles.detailValue}>{exercise.reps}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{STRINGS.exerciseCard.detailLabels.weight}</Text>
          <Text style={styles.detailValue}>{exercise.weight || '0'} {STRINGS.exerciseCard.units.kilograms}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseDetailsCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  exerciseName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: SPACING.element,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.info,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.medium,
  },
  timeDisplay: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadiusSmall,
  },
});

export default ExerciseCard;
