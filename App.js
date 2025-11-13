import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

// Navigation
import { MainTabNavigator } from "./src/navigation/MainTabNavigator";

// Components
import { AddOptionsModal } from "./src/components/modals";

// Services
import { initializeDatabase, seedDummyData } from "./src/services/database";

// Constants
import { COLORS } from "./src/shared/constants";

/**
 * App
 * Main entry point for the VikFit application
 *
 * Features:
 * - Bottom tab navigation with 5 main sections (Home, Workouts, Add, Meals, Progress)
 * - Glass morphism design for modern UI
 * - Quick add modal for logging workouts/meals
 * - Database initialization and seeding
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
        backgroundColor="#cd3030ff"
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
