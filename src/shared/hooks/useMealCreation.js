import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { addMeal, logMeal } from "../../services/database";

/**
 * useMealCreation
 * Custom hook for managing meal creation state and handlers
 *
 * Returns:
 * - form: Form data object
 * - setForm: Function to update form
 * - mealType: Selected meal type
 * - setMealType: Function to update meal type
 * - foodType: Selected food type
 * - setFoodType: Function to update food type
 * - handleAddMeal: Function to add meal
 * - handleClose: Function to close bottom sheet
 * - isLoading: Loading state during submission
 */
export const useMealCreation = (navigation) => {
  const today = new Date().toISOString().split("T")[0];

  // Form state
  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [mealType, setMealType] = useState("Breakfast");
  const [foodType, setFoodType] = useState("veg");
  const [isLoading, setIsLoading] = useState(false);

  // Close handler
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Validate form
  const validateForm = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert("Meal Name Required", "Please enter a meal name");
      return false;
    }

    if (!form.calories.trim()) {
      Alert.alert("Calories Required", "Please enter calories");
      return false;
    }

    if (!form.protein.trim()) {
      Alert.alert("Protein Required", "Please enter protein");
      return false;
    }

    return true;
  }, [form]);

  // Add meal
  const handleAddMeal = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const mealName = form.name.trim();

      // Add meal to existing meals table
      const mealId = await addMeal(
        mealName,
        "General",
        parseFloat(form.calories) || 0,
        parseFloat(form.protein) || 0,
        parseFloat(form.carbs) || 0,
        parseFloat(form.fats) || 0,
        foodType
      );

      // Log the meal for today
      await logMeal(
        mealId,
        today,
        parseFloat(form.calories) || 0,
        parseFloat(form.protein) || 0,
        parseFloat(form.carbs) || 0,
        parseFloat(form.fats) || 0,
        mealType
      );

      Alert.alert(
        "Success",
        `"${mealName}" has been added and logged for today!`,
        [
          {
            text: "OK",
            onPress: () => {
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add meal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [form, foodType, mealType, today, validateForm, handleClose]);

  return {
    form,
    setForm,
    mealType,
    setMealType,
    foodType,
    setFoodType,
    handleAddMeal,
    handleClose,
    isLoading,
  };
};
