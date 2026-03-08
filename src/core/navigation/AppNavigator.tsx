import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { getUser } from '@database/repositories/userRepo';
import { useTheme } from '@theme/index';
import { useAuth } from '../AuthContext';
import OnboardingStack from './stacks/OnboardingStack';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();
  const { hasUser, setHasUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        setHasUser(user !== null);
      } catch {
        setHasUser(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasUser ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      )}
    </Stack.Navigator>
  );
}
