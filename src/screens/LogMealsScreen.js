import React from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { logMealsScreenStyles, COLORS } from "../styles";
import { STRINGS } from "../constants/strings";
import {
  getMealLogsForDate,
  getDailyTotals,
  deleteMealLog,
  getMacroGoals,
} from "../services/database";
import {
  AddMealModal,
  EditMealModal,
  TodaysMealsList,
} from "../components/meals";
import { SummaryCard } from "../components/home";

const LogMealsScreen = ({ navigation }) => {
  const today = new Date().toISOString().split("T")[0];

  // Modals visibility
  const [addMealModalVisible, setAddMealModalVisible] = React.useState(false);
  const [editMealModalVisible, setEditMealModalVisible] = React.useState(false);

  // Data
  const [todaysMeals, setTodaysMeals] = React.useState([]);
  const [dailyTotals, setDailyTotals] = React.useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [macroGoals, setMacroGoals] = React.useState({
    calorieGoal: 2500,
    proteinGoal: 150,
    carbsGoal: 300,
    fatsGoal: 85,
  });
  const [selectedMealForEdit, setSelectedMealForEdit] = React.useState(null);

  // Fetch today's meals, totals, and macro goals when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const todayDate = new Date().toISOString().split("T")[0];
          const meals = await getMealLogsForDate(todayDate);
          setTodaysMeals(meals || []);

          const totals = await getDailyTotals(todayDate);
          setDailyTotals(totals);

          // Load macro goals to ensure they're always up-to-date
          const goals = await getMacroGoals(todayDate);
          setMacroGoals(goals);
        } catch (error) {
          console.error("Error fetching meals:", error);
        }
      };

      fetchData();
    }, [])
  );

  const handleAddMealModalClose = () => {
    setAddMealModalVisible(false);
  };

  const handleMealAdded = async ({ mealId, mealLogged }) => {
    try {
      // If meal was logged directly (from LogMealsScreen), refresh today's meals
      if (mealLogged) {
        const meals = await getMealLogsForDate(today);
        setTodaysMeals(meals || []);

        const totals = await getDailyTotals(today);
        setDailyTotals(totals);
      } else {
        // Otherwise just refresh existing meals list for logging
        const meals = await getAllMeals();
        setExistingMeals(meals);
      }
    } catch (error) {
      console.error("Error refreshing meals list:", error);
    }
  };

  const handleOpenAddExistingScreen = () => {
    navigation.navigate("QuickAddMeals");
  };

  const handleMealSelected = async ({ meals, totals }) => {
    setTodaysMeals(meals || []);
    setDailyTotals(totals);
  };

  const handleEditMeal = (meal) => {
    setSelectedMealForEdit(meal);
    setEditMealModalVisible(true);
  };

  const handleDeleteMeal = (mealId) => {
    Alert.alert(
      STRINGS.logMealsScreen.alerts.deleteConfirmDialog.title,
      STRINGS.logMealsScreen.alerts.deleteConfirmDialog.message,
      [
        {
          text: STRINGS.logMealsScreen.alerts.deleteCancel,
          onPress: () => {},
          style: "cancel",
        },
        {
          text: STRINGS.logMealsScreen.alerts.deleteConfirmButton,
          onPress: async () => {
            try {
              await deleteMealLog(mealId);
              const meals = await getMealLogsForDate(today);
              setTodaysMeals(meals || []);

              const totals = await getDailyTotals(today);
              setDailyTotals(totals);
            } catch (error) {
              console.error("Error deleting meal:", error);
              // Add delay to show error alert after confirmation dialog closes
              setTimeout(() => {
                Alert.alert(
                  STRINGS.logMealsScreen.alerts.deleteError.title,
                  STRINGS.logMealsScreen.alerts.deleteError.message
                );
              }, 500);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleMealUpdated = async ({ meals, totals }) => {
    setTodaysMeals(meals || []);
    setDailyTotals(totals);
    setEditMealModalVisible(false);
  };

  return (
    <View style={logMealsScreenStyles.container}>
      {/* Macro Cards Grid */}
      <SummaryCard
        dailyTotals={dailyTotals}
        macroGoals={macroGoals}
        hideHeader={true}
        showDate={false}
      />

      {/* Meals List with fixed title */}
      <TodaysMealsList
        meals={todaysMeals}
        onMealPress={(meal) => {
          Alert.alert(
            STRINGS.logMealsScreen.alerts.mealOptions(meal.name).title,
            STRINGS.logMealsScreen.alerts.mealOptions(meal.name).message,
            [
              {
                text: STRINGS.logMealsScreen.alerts.edit,
                onPress: () => handleEditMeal(meal),
              },
              {
                text: STRINGS.logMealsScreen.alerts.deleteConfirmButton,
                onPress: () => handleDeleteMeal(meal.id),
                style: "destructive",
              },
              {
                text: STRINGS.logMealsScreen.alerts.deleteCancel,
                onPress: () => {},
                style: "cancel",
              },
            ]
          );
        }}
      />

      {/* Add Meal Buttons - Fixed at Bottom */}
      <View style={logMealsScreenStyles.buttonsContainer}>
        <TouchableOpacity
          style={logMealsScreenStyles.buttonPrimary}
          onPress={() => setAddMealModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
          <Text style={logMealsScreenStyles.buttonText}>
            {STRINGS.logMealsScreen.buttons.addNewMeal}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={logMealsScreenStyles.buttonSecondary}
          onPress={handleOpenAddExistingScreen}
        >
          <MaterialCommunityIcons name="check" size={24} color={COLORS.white} />
          <Text style={logMealsScreenStyles.buttonText}>
            {STRINGS.logMealsScreen.buttons.addExistingMeal}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddMealModal
        visible={addMealModalVisible}
        onClose={handleAddMealModalClose}
        onMealAdded={handleMealAdded}
        showMealType={true}
      />

      <EditMealModal
        visible={editMealModalVisible}
        meal={selectedMealForEdit}
        onClose={() => {
          setEditMealModalVisible(false);
          setSelectedMealForEdit(null);
        }}
        onMealUpdated={handleMealUpdated}
      />
    </View>
  );
};

export default LogMealsScreen;
