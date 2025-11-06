import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";
import { STRINGS } from "../../constants/strings";
import MealCard from "../MealCard";

const TodaysMealsList = ({
  meals = [],
  onMealPress,
  onMealEdit,
  onMealDelete,
}) => {
  // Group meals by type
  const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  const mealsByType = {};

  // Collapsed state for each meal type
  const [collapsedMeals, setCollapsedMeals] = React.useState({});

  MEAL_TYPES.forEach((type) => {
    mealsByType[type] = meals.filter(
      (meal) =>
        meal.mealType === type || (!meal.mealType && type === "Breakfast")
    );
  });

  // Get meal type icon and color
  const getMealTypeIcon = (type) => {
    const icons = {
      Breakfast: { icon: "coffee", color: COLORS.breakfast },
      Lunch: { icon: "food", color: COLORS.lunch },
      Snacks: { icon: "popcorn", color: COLORS.snacks },
      Dinner: { icon: "moon-waning-crescent", color: COLORS.dinner },
    };
    return icons[type] || { icon: "food", color: COLORS.textSecondary };
  };

  // Toggle collapse for meal type
  const toggleMealTypeCollapse = (mealType) => {
    setCollapsedMeals((prev) => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  };

  return (
    <>
      {/* Title - Fixed */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{STRINGS.todaysMealsList.title}</Text>
      </View>

      {/* Scrollable Meals List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {meals.length === 0 ? (
          <Text style={styles.emptyText}>
            {STRINGS.todaysMealsList.emptyState}
          </Text>
        ) : (
          MEAL_TYPES.map((mealType) => {
            const mealsOfType = mealsByType[mealType];
            if (mealsOfType.length === 0) return null;

            const typeInfo = getMealTypeIcon(mealType);
            const totalCalories = mealsOfType.reduce(
              (sum, meal) => sum + (meal.calories || 0),
              0
            );
            const totalProtein = mealsOfType.reduce(
              (sum, meal) => sum + (meal.protein || 0),
              0
            );

            const isCollapsed = collapsedMeals[mealType];

            return (
              <View key={mealType} style={styles.mealTypeSection}>
                {/* Meal Type Header with Toggle */}
                <TouchableOpacity
                  onPress={() => toggleMealTypeCollapse(mealType)}
                  style={styles.mealTypeHeader}
                >
                  <MaterialCommunityIcons
                    name={isCollapsed ? "chevron-right" : "chevron-down"}
                    size={20}
                    color={COLORS.primary}
                  />
                  <MaterialCommunityIcons
                    name={typeInfo.icon}
                    size={20}
                    color={typeInfo.color}
                  />
                  <Text style={styles.mealTypeName}>{mealType}</Text>
                  <Text style={styles.mealTypeCalories}>
                    {Math.round(totalCalories)} cal
                  </Text>
                </TouchableOpacity>

                {/* Meals under this type - Using MealCard Component */}
                {!isCollapsed &&
                  mealsOfType.map((meal) => {
                    // Map the foodType from database to mealType for MealCard component
                    const mealCardData = {
                      ...meal,
                      mealType: meal.foodType || "veg", // Use foodType as mealType for MealCard
                    };
                    return (
                      <View key={meal.id} style={styles.mealCardContainer}>
                        <MealCard
                          meal={mealCardData}
                          onMenuPress={() => onMealPress?.(meal)}
                        />
                      </View>
                    );
                  })}
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    backgroundColor: COLORS.mainBackground,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingVertical: SPACING.small,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: SPACING.container,
  },
  mealTypeSection: {
    marginBottom: SPACING.element,
  },
  mealTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.element,
    marginBottom: SPACING.xs,
    gap: SPACING.small,
  },
  mealTypeName: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    flex: 1,
  },
  mealTypeCalories: {
    ...TYPOGRAPHY.small,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
  },
  mealCardContainer: {
    marginHorizontal: SPACING.element,
    marginBottom: SPACING.small,
  },
});

export default TodaysMealsList;
