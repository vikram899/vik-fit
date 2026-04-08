import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnalyticsScreen from '@modules/analytics/screens/AnalyticsScreen';
import GoalTrackerCalendarScreen from '@modules/analytics/screens/GoalTrackerCalendarScreen';
import PRManagerScreen from '@modules/analytics/screens/PRManagerScreen';
import StrengthScreen from '@modules/analytics/screens/StrengthScreen';

export type AnalyticsStackParamList = {
  Analytics: undefined;
  GoalTrackerCalendar: undefined;
  PRManager: undefined;
  Strength: undefined;
};

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export default function AnalyticsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="GoalTrackerCalendar" component={GoalTrackerCalendarScreen} />
      <Stack.Screen name="PRManager" component={PRManagerScreen} />
      <Stack.Screen name="Strength" component={StrengthScreen} />
    </Stack.Navigator>
  );
}
