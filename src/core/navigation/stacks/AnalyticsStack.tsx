import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnalyticsScreen from '@modules/analytics/screens/AnalyticsScreen';

export type AnalyticsStackParamList = {
  Analytics: undefined;
};

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export default function AnalyticsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
}
