import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@modules/onboarding/screens/WelcomeScreen';
import GenderScreen from '@modules/onboarding/screens/GenderScreen';
import DOBScreen from '@modules/onboarding/screens/DOBScreen';
import HeightScreen from '@modules/onboarding/screens/HeightScreen';
import WeightScreen from '@modules/onboarding/screens/WeightScreen';
import GoalScreen from '@modules/onboarding/screens/GoalScreen';
import ActivityScreen from '@modules/onboarding/screens/ActivityScreen';
import TargetWeightScreen from '@modules/onboarding/screens/TargetWeightScreen';
import SummaryScreen from '@modules/onboarding/screens/SummaryScreen';
import { OnboardingProvider } from '@modules/onboarding/hooks/useOnboarding';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Gender: undefined;
  DOB: undefined;
  Height: undefined;
  Weight: undefined;
  Goal: undefined;
  Activity: undefined;
  TargetWeight: undefined;
  Summary: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Welcome"      component={WelcomeScreen} />
        <Stack.Screen name="Gender"       component={GenderScreen} />
        <Stack.Screen name="DOB"          component={DOBScreen} />
        <Stack.Screen name="Height"       component={HeightScreen} />
        <Stack.Screen name="Weight"       component={WeightScreen} />
        <Stack.Screen name="Goal"         component={GoalScreen} />
        <Stack.Screen name="Activity"     component={ActivityScreen} />
        <Stack.Screen name="TargetWeight" component={TargetWeightScreen} />
        <Stack.Screen name="Summary"      component={SummaryScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
