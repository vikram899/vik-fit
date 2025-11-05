import React, { useEffect } from "react";
import { StatusBar, TouchableOpacity, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import CreatePlanScreen from "./src/screens/CreatePlanScreen";
import ExecuteWorkoutScreen from "./src/screens/ExecuteWorkoutScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import LogMealsScreen from "./src/screens/LogMealsScreen";
import LogWorkoutScreen from "./src/screens/LogWorkoutScreen";
import WorkoutDayScheduleScreen from "./src/screens/WorkoutDayScheduleScreen";
import AllWorkoutsScreen from "./src/screens/AllWorkoutsScreen";
import WorkoutProgressScreen from "./src/screens/WorkoutProgressScreen";
import MealProgressScreen from "./src/screens/MealProgressScreen";
import AllMealsScreen from "./src/screens/AllMealsScreen";
import StartWorkoutScreen from "./src/screens/StartWorkoutScreen";
import WorkoutSummaryScreen from "./src/screens/WorkoutSummaryScreen";
import MenuScreen from "./src/screens/MenuScreen";
import MacroGoalsScreen from "./src/screens/MacroGoalsScreen";
import WeightTrackingScreen from "./src/screens/WeightTrackingScreen";
import ComponentsShowcaseScreen from "./src/screens/ComponentsShowcaseScreen";
import QuickSelectMealsScreen from "./src/screens/QuickSelectMealsScreen";
import CreateMealScreen from "./src/screens/CreateMealScreen";

// Services
import { initializeDatabase, seedDummyData } from "./src/services/database";

// Styles
import { COLORS, SPACING, TYPOGRAPHY } from "./src/shared/constants";

// Components
import { AddOptionsModal } from "./src/components/modals";
import TabBarIcon from "./src/navigation/TabBarIcon";
import TabBarFAB from "./src/components/TabBarFAB";

// Hooks
import { useTabBarStyles, useTabBarListeners } from "./src/shared/hooks";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * HomeStackNavigator
 * Navigation stack for home/daily view
 */
function HomeStackNavigator({ navigation }) {
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
                // Navigate to menu screen
                const navState = navigation.getState();
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
        component={CreatePlanScreen}
        options={{
          title: "Create Workout",
          headerTitleStyle: { fontSize: 18, fontWeight: "700" },
        }}
      />
      <Stack.Screen
        name="ExecuteWorkout"
        component={ExecuteWorkoutScreen}
        options={{ title: "Execute Workout" }}
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
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MacroGoals"
        component={MacroGoalsScreen}
        options={{
          title: "Macro Goals",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="WeightTracking"
        component={WeightTrackingScreen}
        options={{
          title: "Weight Tracking",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ComponentsShowcase"
        component={ComponentsShowcaseScreen}
        options={{
          title: "Components Showcase",
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * WorkoutsStackNavigator
 * Navigation stack for workouts library
 */
function WorkoutsStackNavigator() {
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
        component={CreatePlanScreen}
        options={({ navigation }) => ({
          title: "Create Workout",
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
        })}
      />
    </Stack.Navigator>
  );
}

/**
 * ProgressStackNavigator
 * Navigation stack for progress view
 */
function ProgressStackNavigator() {
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
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="MealProgress"
        component={MealProgressScreen}
        options={{
          title: "Meal Progress",
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * MealsStackNavigator
 * Navigation stack for meals view with add new meal option
 */
function MealsStackNavigator() {
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
          headerTitleStyle: {
            ...TYPOGRAPHY.sectionTitle,
            color: COLORS.textPrimary,
          },
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
          headerShown: false,
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * App
 * Main entry point with Bottom Tab Navigation
 */
/**
 * MainTabNavigator
 * Bottom tab navigation with all main screens
 * Uses modular components and hooks for tab bar configuration
 */
function MainTabNavigator({ onAddPress }) {
  const { screenOptions } = useTabBarStyles();
  const { homeTabListeners } = useTabBarListeners();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            route={route}
            focused={focused}
            color={color}
            size={size}
          />
        ),
      })}
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

/**
 * App
 * Main entry point with Drawer Navigation
 */
export default function App() {
  const navigationRef = React.useRef(null);
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Initialize database on app start
  React.useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      await seedDummyData();
    };
    initDB();
  }, []);

  const handleAddPress = () => {
    setShowAddModal(true);
  };

  const handleLogWorkout = () => {
    setShowAddModal(false);
    navigationRef.current?.navigate("Home", { screen: "LogWorkout" });
  };

  const handleLogMeal = () => {
    setShowAddModal(false);
    navigationRef.current?.navigate("Home", { screen: "LogMeals" });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <NavigationContainer ref={navigationRef}>
        <MainTabNavigator onAddPress={handleAddPress} />
      </NavigationContainer>
      <AddOptionsModal
        visible={showAddModal}
        onLogWorkout={handleLogWorkout}
        onLogMeal={handleLogMeal}
        onClose={handleCloseModal}
      />
    </SafeAreaProvider>
  );
}
