import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { todaysMealsStyles, COLORS } from '../../styles';
import { STRINGS } from '../../constants/strings';

const TodaysMealsList = ({ meals = [], onMealPress, onMealEdit, onMealDelete }) => {
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
          meals.map((meal) => (
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
          ))
        )}
      </ScrollView>
    </>
  );
};

export default TodaysMealsList;
