import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../constants/colors";
import ProfileScreen from "../screens/ProfileScreen";
import WorkoutDayScheduleScreen from "../screens/WorkoutDayScheduleScreen";
import ComponentsShowcaseScreen from "../screens/ComponentsShowcaseScreen";

// Import screen components
// import HomeScreen from '../screens/HomeScreen';

// import MealsScreen from '../screens/MealsScreen';

// import { WorkoutPlansScreen } from '../screens/WorkoutPlansScreen';
// import { CreatePlanScreen } from '../screens/CreatePlanScreen';
// import { PlanDetailScreen } from '../screens/PlanDetailScreen';
// import { WorkoutExecutionScreen } from '../screens/WorkoutExecutionScreen';

// Import constants

// Create navigators
const Tab = createBottomTabNavigator();

const WorkoutStack = createNativeStackNavigator();

/**
 * WorkoutStackNavigator
 * Stack navigation for workout planning and execution
 */
function WorkoutStackNavigator() {
  try {
    const nav = (
      <WorkoutStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        <WorkoutStack.Screen
          name="Workouts"
          component={WorkoutDayScheduleScreen}
        />
        <WorkoutStack.Screen
          name="ComponentsShowcase"
          component={ComponentsShowcaseScreen}
        />
      </WorkoutStack.Navigator>
    );
    return nav;
  } catch (err) {
    throw err;
  }
}

/**
 * AppNavigator
 * Bottom tab navigation setup with 4 tabs: Home, Workouts, Meals, Profile
 * Workouts tab uses stack navigation for plan-based workflow
 */
export default function AppNavigator() {
  try {
    const navigatorElement = (
      <Tab.Navigator
        screenOptions={({ route }) => {
          return {
            // Configure the tab bar icon
            tabBarIcon: ({ focused, color, size }) => {
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
    return navigatorElement;
  } catch (err) {
    throw err;
  }
}
