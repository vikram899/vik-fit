import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import ProgressScreen from "../../screens/ProgressScreen";
import MealProgressScreen from "../../screens/MealProgressScreen";

// Constants
import { COLORS, TYPOGRAPHY } from "../../shared/constants";

const Stack = createNativeStackNavigator();

// Common header style
const defaultHeaderOptions = {
  headerTitleStyle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  headerStyle: {
    backgroundColor: COLORS.mainBackground,
  },
};

/**
 * ProgressStackNavigator
 * Navigation stack for progress tracking view
 */
export function ProgressStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen
        name="ProgressHome"
        component={ProgressScreen}
        options={{
          title: "Progress",
          ...defaultHeaderOptions,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="MealProgress"
        component={MealProgressScreen}
        options={{
          title: "Meal Progress",
          ...defaultHeaderOptions,
        }}
      />
    </Stack.Navigator>
  );
}
