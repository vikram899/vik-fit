import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Stack Navigators
import {
  HomeStackNavigator,
  WorkoutsStackNavigator,
  ProgressStackNavigator,
  MealsStackNavigator,
} from "./stacks";

// Components
import TabBarIcon from "./TabBarIcon";
import TabBarFAB from "../components/TabBarFAB";
import GlassyTabBar from "../components/GlassyTabBar";

// Hooks
import { useTabBarListeners } from "../shared/hooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

/**
 * MainTabNavigator
 * Bottom tab navigation with all main screens
 * Uses glass morphism tab bar for modern UI
 */
export function MainTabNavigator({ onAddPress }) {
  const insets = useSafeAreaInsets();
  const { homeTabListeners } = useTabBarListeners();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            route={route}
            focused={focused}
            color={color}
            size={size}
          />
        ),
      })}
      tabBar={(props) => <GlassyTabBar {...props} insets={insets} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        listeners={homeTabListeners}
        options={{
          tabBarLabel: "Home",
          tabBarItemStyle: {
            marginHorizontal: 8,
          },
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsStackNavigator}
        options={{
          tabBarLabel: "Workouts",
          tabBarItemStyle: {
            marginHorizontal: 8,
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Add"
        component={() => null}
        options={{
          tabBarLabel: "",
          tabBarButton: (props) => (
            <TabBarFAB {...props} onPress={onAddPress} />
          ),
        }}
      />
      <Tab.Screen
        name="Meals"
        component={MealsStackNavigator}
        options={{
          tabBarLabel: "Meals",
          tabBarItemStyle: {
            marginHorizontal: 6,
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressStackNavigator}
        options={{
          tabBarLabel: "Progress",
          tabBarItemStyle: {
            marginHorizontal: 8,
          },
        }}
      />
    </Tab.Navigator>
  );
}
