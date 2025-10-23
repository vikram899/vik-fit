import React from 'react';
import { View, Text } from 'react-native';
import { macroStyles, COLORS } from '../../styles';
import { STRINGS } from '../../constants/strings';

const MealMacroCards = ({ dailyTotals, macroGoals = {} }) => {
  const { totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0 } = dailyTotals || {};

  // Default goals if not provided
  const goals = {
    calories: macroGoals.calorieGoal || 2500,
    protein: macroGoals.proteinGoal || 150,
    carbs: macroGoals.carbsGoal || 300,
    fats: macroGoals.fatsGoal || 85,
  };

  const MacroCard = ({ label, actual, goal, unit = '' }) => (
    <View style={macroStyles.macroCard}>
      <Text style={macroStyles.macroLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={macroStyles.macroValue}>
          {Math.round(actual)}{unit}
        </Text>
        <Text style={macroStyles.macroGoal}> / {Math.round(goal)}{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={macroStyles.container}>
      <View style={macroStyles.macroGridContainer}>
        <MacroCard label={STRINGS.mealMacroCards.labels.calories} actual={totalCalories} goal={goals.calories} unit={STRINGS.mealMacroCards.units.calories} />
        <MacroCard label={STRINGS.mealMacroCards.labels.protein} actual={totalProtein} goal={goals.protein} unit={STRINGS.mealMacroCards.units.protein} />
        <MacroCard label={STRINGS.mealMacroCards.labels.carbs} actual={totalCarbs} goal={goals.carbs} unit={STRINGS.mealMacroCards.units.carbs} />
        <MacroCard label={STRINGS.mealMacroCards.labels.fats} actual={totalFats} goal={goals.fats} unit={STRINGS.mealMacroCards.units.fats} />
      </View>
    </View>
  );
};

export default MealMacroCards;
