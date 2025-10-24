import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { todaysMealsStyles, COLORS } from '../../styles';
import { STRINGS } from '../../constants/strings';

const TodaysMealsList = ({ meals = [], onMealPress, onMealEdit, onMealDelete }) => {
  // Group meals by type
  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const mealsByType = {};

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

            return (
              <View key={mealType} style={{ marginBottom: 16 }}>
                {/* Meal Type Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 8 }}>
                  <MaterialCommunityIcons name={typeInfo.icon} size={20} color={typeInfo.color} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', flex: 1 }}>
                    {mealType}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#999' }}>
                    {Math.round(totalCalories)} cal
                  </Text>
                </View>

                {/* Meals under this type */}
                {mealsOfType.map((meal) => (
                  <View key={meal.id} style={todaysMealsStyles.mealItem}>
                    <View style={todaysMealsStyles.mealContent}>
                      <Text style={todaysMealsStyles.mealName}>{meal.name}</Text>
                      <Text style={todaysMealsStyles.mealMacros}>
                        {Math.round(meal.calories)} cal • {Math.round(meal.protein)}g protein
                      </Text>
                    </View>
                    {onMealPress && (
                      <TouchableOpacity
                        onPress={() => onMealPress(meal)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialCommunityIcons name="dots-vertical" size={24} color={COLORS.gray600} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );
};

export default TodaysMealsList;
