import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { todaysMealsStyles, COLORS } from '../../styles';
import { STRINGS } from '../../constants/strings';
import MealCard from '../MealCard';

const TodaysMealsList = ({ meals = [], onMealPress, onMealEdit, onMealDelete }) => {
  // Group meals by type
  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const mealsByType = {};

  // Collapsed state for each meal type
  const [collapsedMeals, setCollapsedMeals] = React.useState({});

  MEAL_TYPES.forEach(type => {
    mealsByType[type] = meals.filter(meal => meal.mealType === type || (!meal.mealType && type === 'Breakfast'));
  });

  // Get meal type icon and color
  const getMealTypeIcon = (type) => {
    const icons = {
      'Breakfast': { icon: 'coffee', color: '#FF9800' },
      'Lunch': { icon: 'food', color: '#2196F3' },
      'Snacks': { icon: 'popcorn', color: '#FF5722' },
      'Dinner': { icon: 'moon-waning-crescent', color: '#7C4DFF' },
    };
    return icons[type] || { icon: 'food', color: '#999' };
  };

  // Toggle collapse for meal type
  const toggleMealTypeCollapse = (mealType) => {
    setCollapsedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  return (
    <>
      {/* Title - Fixed */}
      <View style={todaysMealsStyles.titleContainer}>
        <Text style={todaysMealsStyles.title}>{STRINGS.todaysMealsList.title}</Text>
      </View>

      {/* Scrollable Meals List */}
      <ScrollView
        style={todaysMealsStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={todaysMealsStyles.contentContainer}
      >
        {meals.length === 0 ? (
          <Text style={todaysMealsStyles.emptyText}>{STRINGS.todaysMealsList.emptyState}</Text>
        ) : (
          MEAL_TYPES.map((mealType) => {
            const mealsOfType = mealsByType[mealType];
            if (mealsOfType.length === 0) return null;

            const typeInfo = getMealTypeIcon(mealType);
            const totalCalories = mealsOfType.reduce((sum, meal) => sum + (meal.calories || 0), 0);
            const totalProtein = mealsOfType.reduce((sum, meal) => sum + (meal.protein || 0), 0);

            const isCollapsed = collapsedMeals[mealType];

            return (
              <View key={mealType} style={{ marginBottom: 16 }}>
                {/* Meal Type Header with Toggle */}
                <TouchableOpacity
                  onPress={() => toggleMealTypeCollapse(mealType)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 8 }}
                >
                  <MaterialCommunityIcons
                    name={isCollapsed ? 'chevron-right' : 'chevron-down'}
                    size={20}
                    color={COLORS.primary}
                  />
                  <MaterialCommunityIcons name={typeInfo.icon} size={20} color={typeInfo.color} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', flex: 1 }}>
                    {mealType}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#999' }}>
                    {Math.round(totalCalories)} cal
                  </Text>
                </TouchableOpacity>

                {/* Meals under this type - Using MealCard Component */}
                {!isCollapsed && mealsOfType.map((meal) => {
                  // Map the foodType from database to mealType for MealCard component
                  const mealCardData = {
                    ...meal,
                    mealType: meal.foodType || 'veg', // Use foodType as mealType for MealCard
                  };
                  return (
                    <View key={meal.id} style={{ marginHorizontal: 16, marginBottom: 12 }}>
                      <MealCard
                        meal={mealCardData}
                        onMenuPress={() => onMealPress?.(meal)}
                      />
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );
};

export default TodaysMealsList;
