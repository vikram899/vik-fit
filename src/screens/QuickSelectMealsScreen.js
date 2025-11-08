import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../shared/constants";
import { getAllMeals, logMeal } from "../services/database";
import { BottomSheet } from "../shared/components/ui";
import MealCard from "../components/MealCard";
import SelectMealTimePopup from "../components/SelectMealTimePopup";

const QuickSelectMealsScreen = ({ navigation, route }) => {
  const today = new Date().toISOString().split("T")[0];
  const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  const [meals, setMeals] = React.useState([]);
  const [addedMealIds, setAddedMealIds] = React.useState(new Set());
  const [mealTypeSelectVisible, setMealTypeSelectVisible] =
    React.useState(false);
  const [mealTypeSelectMeal, setMealTypeSelectMeal] = React.useState(null);
  const [selectedMealType, setSelectedMealType] = React.useState("Breakfast");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMeals = async () => {
      try {
        setLoading(true);
        const mealsList = await getAllMeals();
        setMeals(mealsList || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, []);

  const handleCloseBottomSheet = () => {
    navigation.goBack();
  };

  const handleShowMealTypeSelector = (meal) => {
    setMealTypeSelectMeal(meal);
    setSelectedMealType("Breakfast");
    setMealTypeSelectVisible(true);
  };

  const handleAddMealToday = async (meal, mealType) => {
    try {
      await logMeal(
        meal.id,
        today,
        meal.calories || 0,
        meal.protein || 0,
        meal.carbs || 0,
        meal.fats || 0,
        mealType
      );

      // Mark meal as added
      setAddedMealIds(new Set([...addedMealIds, meal.id]));

      // Close meal type selector
      setMealTypeSelectVisible(false);
      setMealTypeSelectMeal(null);
    } catch (error) {
    }
  };

  return (
    <>
      <SelectMealTimePopup
        visible={mealTypeSelectVisible}
        mealName={mealTypeSelectMeal?.name}
        selectedMealType={selectedMealType}
        onMealTypeChange={setSelectedMealType}
        onConfirm={(mealType) => {
          handleAddMealToday(mealTypeSelectMeal, mealType);
        }}
        onCancel={() => {
          setMealTypeSelectVisible(false);
          setMealTypeSelectMeal(null);
        }}
      />

      <BottomSheet
        visible={true}
        title="Quick Add Meals"
        onClose={handleCloseBottomSheet}
        heightPercent={0.9}
      >
        {/* Meals List */}
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
              Loading meals...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: SPACING.element }}
            showsVerticalScrollIndicator={false}
          >
            {meals.length === 0 ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 40,
                }}
              >
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={64}
                  color={COLORS.mediumGray}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.textSecondary,
                    marginTop: 16,
                  }}
                >
                  No meals available
                </Text>
              </View>
            ) : (
              [...meals]
                .sort((a, b) => {
                  // Sort by favorite status first (favorited meals on top)
                  if ((b.isFavorite || 0) !== (a.isFavorite || 0)) {
                    return (b.isFavorite || 0) - (a.isFavorite || 0);
                  }
                  // Then sort by name
                  return a.name.localeCompare(b.name);
                })
                .map((meal) => (
                  <View
                    key={meal.id}
                    style={{ marginBottom: SPACING.medium }}
                  >
                    <MealCard
                      meal={meal}
                      showPlusIcon={true}
                      isAdded={addedMealIds.has(meal.id)}
                      onMenuPress={() => {
                        if (!addedMealIds.has(meal.id)) {
                          handleShowMealTypeSelector(meal);
                        }
                      }}
                    />
                  </View>
                ))
            )}
          </ScrollView>
        )}
      </BottomSheet>
    </>
  );
};

export default QuickSelectMealsScreen;
