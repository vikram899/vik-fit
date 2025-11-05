/**
 * MEALS LIST CONTAINER COMPONENT
 *
 * Displays list of filtered meals or empty state.
 * Handles meal card rendering with menu and favorite actions.
 *
 * @example
 * <MealsListContainer
 *   meals={filteredMeals}
 *   onMealMenu={handleMealMenu}
 *   onFavoritePress={handleFavoritePress}
 * />
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MealCard from '../MealCard';
import EmptyState from './EmptyState';
import { SPACING } from '../../shared/constants';

const MealsListContainer = ({
  meals = [],
  allMeals = [],
  onMealMenu,
  onFavoritePress,
  onCreatePress,
}) => {
  // Show empty state if no meals found in filtered results
  if (meals.length === 0) {
    return (
      <EmptyState
        showCreateButton={allMeals.length === 0}
        onCreatePress={onCreatePress}
        title={allMeals.length === 0 ? 'No Meals Created' : 'No Meals Found'}
        subtitle={
          allMeals.length === 0
            ? 'Create your first meal'
            : 'Try adjusting your search'
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      {meals.map((meal) => (
        <View key={meal.id} style={styles.mealCardWrapper}>
          <MealCard
            meal={meal}
            onMenuPress={() => onMealMenu(meal)}
            isEditableStar={true}
            onFavoritePress={(isFavorite) => onFavoritePress(meal.id, isFavorite)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mealCardWrapper: {
    marginHorizontal: SPACING.element,
    marginBottom: SPACING.small,
  },
});

export default MealsListContainer;
