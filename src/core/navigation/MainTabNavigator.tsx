import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@theme/index';
import { Home, Dumbbell, Utensils, TrendingUp, User } from 'lucide-react-native';
import DashboardStack from './stacks/DashboardStack';
import MealsStack from './stacks/MealsStack';
import WorkoutsStack from './stacks/WorkoutsStack';
import ProfileStack from './stacks/ProfileStack';
import AnalyticsStack from './stacks/AnalyticsStack';

export type MainTabParamList = {
  DashboardTab:  undefined;
  WorkoutsTab:   undefined;
  MealsTab:      undefined;
  AnalyticsTab:  undefined;
  ProfileTab:    undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICON_SIZE = 22;

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarActiveTintColor: colors.brandSecondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutsStack}
        options={{
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ color }) => <Dumbbell size={ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="MealsTab"
        component={MealsStack}
        options={{
          tabBarLabel: 'Meals',
          tabBarIcon: ({ color }) => <Utensils size={ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsStack}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <TrendingUp size={ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User size={ICON_SIZE} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
