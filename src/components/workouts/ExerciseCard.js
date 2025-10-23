import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { STRINGS } from '../../constants/strings';

const ExerciseCard = ({ exercise, onDelete, onEdit, showDeleteButton = true, showEditButton = false, disabled = false }) => {
  return (
    <View style={styles.exerciseDetailsCard}>
      <View style={styles.exerciseCardHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.headerRight}>
          {(exercise.time || 0) > 0 && (
            <Text style={styles.timeDisplay}>{exercise.time} {STRINGS.exerciseCard.units.seconds}</Text>
          )}
          {showEditButton && (
            <TouchableOpacity
              onPress={onEdit}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          {showDeleteButton && (
            <TouchableOpacity
              onPress={onDelete}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#FF3B30" />
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
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeDisplay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
});

export default ExerciseCard;
