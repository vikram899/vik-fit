import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MealsScreen from '@modules/meals/screens/MealsScreen';

export type MealsStackParamList = {
  Meals: undefined;
};

const Stack = createNativeStackNavigator<MealsStackParamList>();

export default function MealsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Meals" component={MealsScreen} />
    </Stack.Navigator>
  );
}
