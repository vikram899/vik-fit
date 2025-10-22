import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MealCard = ({ meal, onEdit, onDelete, onDuplicate, disabled = false }) => {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{meal.category || 'General'}</Text>
          </View>
        </View>
        <View style={styles.mealActions}>
          {onDuplicate && (
            <TouchableOpacity
              onPress={onDuplicate}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="content-duplicate" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          {onDelete && (
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

      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Calories</Text>
          <Text style={styles.nutritionValue}>{meal.calories || 0}</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Protein</Text>
          <Text style={styles.nutritionValue}>{meal.protein || 0}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Carbs</Text>
          <Text style={styles.nutritionValue}>{meal.carbs || 0}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Fats</Text>
          <Text style={styles.nutritionValue}>{meal.fats || 0}g</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  mealActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default MealCard;
