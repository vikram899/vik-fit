import React from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import AllWorkoutsScreen from "../../screens/AllWorkoutsScreen";
import CreateWorkoutScreen from "../../screens/CreateWorkoutScreen";

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
 * WorkoutsStackNavigator
 * Navigation stack for workouts library view and creation
 */
export function WorkoutsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen
        name="WorkoutsHome"
        component={AllWorkoutsScreen}
        options={({ navigation }) => ({
          title: "Workouts",
          ...defaultHeaderOptions,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("CreatePlan")}
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
        name="CreatePlan"
        component={CreateWorkoutScreen}
        options={({ navigation }) => ({
          title: "Create Workout",
          ...defaultHeaderOptions,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ paddingLeft: SPACING.element }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
          animationEnabled: false,
        })}
      />
    </Stack.Navigator>
  );
}
