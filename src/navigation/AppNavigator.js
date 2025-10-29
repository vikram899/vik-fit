console.log("🔧 AppNavigator.js - START IMPORT");

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../constants/colors";
import ProfileScreen from "../screens/ProfileScreen";
import WorkoutDayViewScreen from "../screens/WorkoutDayViewScreen";
import ComponentsShowcaseScreen from "../screens/ComponentsShowcaseScreen";

console.log("🔧 AppNavigator.js - Navigation imports done");

// Import screen components
// import HomeScreen from '../screens/HomeScreen';
console.log("🔧 AppNavigator.js - About to import WorkoutsScreen");
console.log("🔧 AppNavigator.js - WorkoutsScreen imported");

// import MealsScreen from '../screens/MealsScreen';
console.log("🔧 AppNavigator.js - About to import ProfileScreen");
console.log("🔧 AppNavigator.js - ProfileScreen imported");

// import { WorkoutPlansScreen } from '../screens/WorkoutPlansScreen';
// import { CreatePlanScreen } from '../screens/CreatePlanScreen';
// import { PlanDetailScreen } from '../screens/PlanDetailScreen';
// import { WorkoutExecutionScreen } from '../screens/WorkoutExecutionScreen';

// Import constants
console.log("🔧 AppNavigator.js - About to import constants");
console.log("🔧 AppNavigator.js - Constants imported");

console.log("🔧 AppNavigator.js - Creating navigators");

// Create navigators
const Tab = createBottomTabNavigator();
console.log("🔧 AppNavigator.js - Tab navigator created");

const WorkoutStack = createNativeStackNavigator();
console.log("🔧 AppNavigator.js - WorkoutStack navigator created");

/**
 * WorkoutStackNavigator
 * Stack navigation for workout planning and execution
 */
function WorkoutStackNavigator() {
  console.log("🔧 WorkoutStackNavigator - RENDERING");
  try {
    console.log("🔧 WorkoutStackNavigator - About to create Navigator");
    const nav = (
      <WorkoutStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        <WorkoutStack.Screen name="Workouts" component={WorkoutDayViewScreen} />
        <WorkoutStack.Screen name="ComponentsShowcase" component={ComponentsShowcaseScreen} />
      </WorkoutStack.Navigator>
    );
    console.log("🔧 WorkoutStackNavigator - Navigator created successfully");
    return nav;
  } catch (err) {
    console.error("❌ Error in WorkoutStackNavigator:", err);
    console.error("❌ Stack:", err.stack);
    throw err;
  }
}

/**
 * AppNavigator
 * Bottom tab navigation setup with 4 tabs: Home, Workouts, Meals, Profile
 * Workouts tab uses stack navigation for plan-based workflow
 */
export default function AppNavigator() {
  console.log("🔧 AppNavigator - RENDERING");
  try {
    console.log("🔧 About to render Tab.Navigator");
    const navigatorElement = (
      <Tab.Navigator
        screenOptions={({ route }) => {
          console.log("🔧 screenOptions called, route:", route);
          return {
            // Configure the tab bar icon
            tabBarIcon: ({ focused, color, size }) => {
              console.log("🔧 tabBarIcon called, route.name:", route?.name);
              let iconName = "help-circle";

              // Determine which icon to show based on route name
              if (route?.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route?.name === "WorkoutsTab") {
                iconName = focused ? "dumbbell" : "dumbbell";
              } else if (route?.name === "Meals") {
                iconName = focused ? "food" : "food-outline";
              } else if (route?.name === "Profile") {
                iconName = focused ? "account" : "account-outline";
              }

              console.log("🔧 tabBarIcon iconName:", iconName);

              // Return the icon component
              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            },
            // Tab bar styling
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
            },
            tabBarStyle: {
              backgroundColor: COLORS.background,
              borderTopColor: COLORS.lightGray,
              borderTopWidth: 1,
              paddingBottom: 5,
            },
            headerShown: false,
          };
        }}
      >
        {/* Workouts Tab - Uses Stack Navigator */}
        <Tab.Screen
          name="WorkoutsTab"
          component={WorkoutStackNavigator}
          options={{
            title: "Workouts",
          }}
        />

        {/* Profile Tab */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: "Profile",
          }}
        />
      </Tab.Navigator>
    );
    console.log("🔧 Tab.Navigator rendered successfully");
    return navigatorElement;
  } catch (err) {
    console.error("❌ Error in AppNavigator:", err);
    console.error("❌ Error stack:", err.stack);
    throw err;
  }
}
