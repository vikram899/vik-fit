import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@modules/onboarding/screens/WelcomeScreen';
import BasicInfoScreen from '@modules/onboarding/screens/BasicInfoScreen';
import BodyMetricsScreen from '@modules/onboarding/screens/BodyMetricsScreen';
import ActivityGoalScreen from '@modules/onboarding/screens/ActivityGoalScreen';
import SummaryScreen from '@modules/onboarding/screens/SummaryScreen';
import { OnboardingProvider } from '@modules/onboarding/hooks/useOnboarding';

export type OnboardingStackParamList = {
  Welcome: undefined;
  BasicInfo: undefined;
  BodyMetrics: undefined;
  ActivityGoal: undefined;
  Summary: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
        <Stack.Screen name="BodyMetrics" component={BodyMetricsScreen} />
        <Stack.Screen name="ActivityGoal" component={ActivityGoalScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
