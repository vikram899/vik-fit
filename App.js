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
import WorkoutsScreen from "./src/screens/WorkoutsScreen";
import WorkoutsLibraryScreen from "./src/screens/WorkoutsLibraryScreen";
import MealsScreen from "./src/screens/MealsScreen";
import AddWorkoutScreen from "./src/screens/AddWorkoutScreen";
import MealsListScreen from "./src/screens/MealsListScreen";
import StartWorkoutScreen from "./src/screens/StartWorkoutScreen";
import WorkoutSummaryScreen from "./src/screens/WorkoutSummaryScreen";
import MenuScreen from "./src/screens/MenuScreen";
import MacroGoalsScreen from "./src/screens/MacroGoalsScreen";
import WeightTrackingScreen from "./src/screens/WeightTrackingScreen";
import ComponentsShowcaseScreen from "./src/screens/ComponentsShowcaseScreen";
import QuickAddMealsScreen from "./src/screens/QuickAddMealsScreen";

// Services
import { initializeDatabase, seedDummyData } from "./src/services/database";

// Styles
import { COLORS } from "./src/styles";

// Components
import { AddOptionsModal } from "./src/components/modals";

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
        headerTintColor: "#007AFF",
        animationEnabled: false,
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerTitle: "VikFit",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                // Navigate to menu screen
                const navState = navigation.getState();
                navigation.navigate("Menu");
              }}
              style={{ paddingLeft: 16 }}
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
              style={{ paddingLeft: 16 }}
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
        component={QuickAddMealsScreen}
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
        headerTintColor: "#007AFF",
      }}
    >
      <Stack.Screen
        name="WorkoutsLibrary"
        component={WorkoutsLibraryScreen}
        options={{
          title: "Workouts",
        }}
      />
      <Stack.Screen
        name="WorkoutsCreatePlan"
        component={CreatePlanScreen}
        options={({ navigation }) => ({
          title: "Create Workout",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ paddingLeft: 16 }}
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
        headerTintColor: "#007AFF",
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
 */
function MainTabNavigator({ onAddPress }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Workouts") {
            iconName = focused ? "dumbbell" : "dumbbell";
          } else if (route.name === "Meals") {
            iconName = focused
              ? "silverware-fork-knife"
              : "silverware-fork-knife";
          } else if (route.name === "Progress") {
            iconName = focused ? "chart-line" : "chart-line";
          } else if (route.name === "Add") {
            iconName = "plus";
          }
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#f0f0f0",
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 8,
          height: 80,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Reset the stack to show HomeScreen when Home tab is pressed
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          },
        })}
        options={{
          tabBarLabel: "Home",
          tabBarItemStyle: {
            marginHorizontal: 8,
          },
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={AddWorkoutScreen}
        options={({ navigation }) => ({
          tabBarLabel: "Workouts",
          tabBarItemStyle: {
            marginHorizontal: 8,
          },
          headerShown: true,
          title: "Workouts",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("CreatePlan")}
              style={{ paddingRight: 16 }}
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
      <Tab.Screen
        name="Add"
        component={() => null}
        options={{
          tabBarLabel: "",
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                e.preventDefault?.();
                onAddPress?.();
              }}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={50}
                color={COLORS.primary}
                style={{
                  shadowColor: "#007AFF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Meals"
        component={MealsListScreen}
        options={({ navigation }) => ({
          tabBarLabel: "Meals",
          tabBarItemStyle: {
            marginHorizontal: 6,
          },
          headerShown: true,
          title: "Meals",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.setParams({ openAddModal: true });
              }}
              style={{ paddingRight: 16 }}
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
