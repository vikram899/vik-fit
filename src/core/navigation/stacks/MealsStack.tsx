import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MealsScreen from '@modules/meals/screens/MealsScreen';
import AddMealScreen from '@modules/meals/screens/AddMealScreen';
import EditMealScreen from '@modules/meals/screens/EditMealScreen';

export type MealsStackParamList = {
  Meals: undefined;
  AddMeal: { category?: string };
  EditMeal: { mealLogId: number };
};

const Stack = createNativeStackNavigator<MealsStackParamList>();

export default function MealsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Meals" component={MealsScreen} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} />
      <Stack.Screen name="EditMeal" component={EditMealScreen} />
    </Stack.Navigator>
  );
}
