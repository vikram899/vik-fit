import React from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import AllMealsScreen from "../../screens/AllMealsScreen";
import CreateMealScreen from "../../screens/CreateMealScreen";

// Constants
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

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
 * MealsStackNavigator
 * Navigation stack for meals view with add new meal option
 */
export function MealsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: COLORS.primary,
        animationEnabled: false,
      }}
    >
      <Stack.Screen
        name="MealsHome"
        component={AllMealsScreen}
        options={({ navigation }) => ({
          title: "Meals",
          ...defaultHeaderOptions,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("AddNewMeal");
              }}
              style={{ paddingRight: SPACING.element }}
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={28}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="AddNewMeal"
        component={CreateMealScreen}
        options={{
          title: "Add New Meal",
          ...defaultHeaderOptions,
          headerBackTitleVisible: false,
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
