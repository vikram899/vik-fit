import React from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import HomeScreen from "../../screens/HomeScreen";
import CreateWorkoutScreen from "../../screens/CreateWorkoutScreen";
import ExecuteWorkoutScreen from "../../screens/ExecuteWorkoutScreen";
import LogMealsScreen from "../../screens/LogMealsScreen";
import LogWorkoutScreen from "../../screens/LogWorkoutScreen";
import StartWorkoutScreen from "../../screens/StartWorkoutScreen";
import WorkoutSummaryScreen from "../../screens/WorkoutSummaryScreen";
import MenuScreen from "../../screens/MenuScreen";
import MacroGoalsScreen from "../../screens/MacroGoalsScreen";
import WeightTrackingScreen from "../../screens/WeightTrackingScreen";
import ComponentsShowcaseScreen from "../../screens/ComponentsShowcaseScreen";
import QuickSelectMealsScreen from "../../screens/QuickSelectMealsScreen";
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
 * HomeStackNavigator
 * Navigation stack for home/daily view with all related screens
 */
export function HomeStackNavigator({ navigation }) {
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
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerTitle: "VikFit",
          headerStyle: {
            backgroundColor: COLORS.mainBackground,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Menu");
              }}
              style={{ paddingLeft: SPACING.element }}
            >
              <MaterialCommunityIcons
                name="menu"
                size={28}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="LogWorkout"
        component={LogWorkoutScreen}
        options={({ navigation }) => ({
          title: "Log Workouts",
          ...defaultHeaderOptions,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("HomeScreen");
                }
              }}
              style={{ paddingLeft: SPACING.element }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="CreatePlan"
        component={CreateWorkoutScreen}
        options={{
          title: "Create Workout",
          ...defaultHeaderOptions,
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="ExecuteWorkout"
        component={ExecuteWorkoutScreen}
        options={{
          title: "Execute Workout",
          ...defaultHeaderOptions,
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="StartWorkout"
        component={StartWorkoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LogMeals"
        component={LogMealsScreen}
        options={{
          title: "Log Meals",
          ...defaultHeaderOptions,
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="QuickAddMeals"
        component={QuickSelectMealsScreen}
        options={{
          headerShown: false,
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="AddNewMeal"
        component={CreateMealScreen}
        options={{
          headerShown: false,
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: "Menu",
          ...defaultHeaderOptions,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MacroGoals"
        component={MacroGoalsScreen}
        options={{
          title: "Macro Goals",
          ...defaultHeaderOptions,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="WeightTracking"
        component={WeightTrackingScreen}
        options={{
          title: "Weight Tracking",
          ...defaultHeaderOptions,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ComponentsShowcase"
        component={ComponentsShowcaseScreen}
        options={{
          title: "Components Showcase",
          ...defaultHeaderOptions,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
