import React from "react";
import {
  View,
  Alert,
} from "react-native";
import {
  updateMeal,
  getAllMeals,
} from "../../services/database";
import { COLORS, SPACING } from "../../shared/constants";
import { BottomSheet } from "../../shared/components/ui";
import CreateMealButtons from "../CreateMealButtons";
import MealForm from "../MealForm";

const EditMealDetailsModal = ({ visible, meal, onClose, onMealUpdated }) => {
  const [form, setForm] = React.useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [mealType, setMealType] = React.useState("Breakfast");
  const [foodType, setFoodType] = React.useState("veg");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (visible && meal) {
      setForm({
        name: meal.name || "",
        calories: meal.calories?.toString() || "",
        protein: meal.protein?.toString() || "",
        carbs: meal.carbs?.toString() || "",
        fats: meal.fats?.toString() || "",
      });
      setMealType(meal.mealType || "Breakfast");
      setFoodType(meal.mealType || "veg");
    }
  }, [visible, meal]);

  const handleSaveMeal = async () => {
    if (!form.name.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter a meal name"
      );
      return;
    }

    if (!form.calories.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter calories"
      );
      return;
    }

    if (!form.protein.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter protein"
      );
      return;
    }

    try {
      setIsLoading(true);
      await updateMeal(
        meal.id,
        form.name.trim(),
        "General",
        parseFloat(form.calories) || 0,
        parseFloat(form.protein) || 0,
        parseFloat(form.carbs) || 0,
        parseFloat(form.fats) || 0,
        foodType
      );

      // Reload meals and callback
      const updatedMeals = await getAllMeals();
      onMealUpdated?.(updatedMeals);

      Alert.alert(
        "Success",
        `${form.name} has been updated successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              setIsLoading(false);
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Error",
        "Failed to update meal. Please try again."
      );
    }
  };

  if (!meal) return null;

  return (
    <BottomSheet
      visible={visible}
      title="Edit Meal"
      onClose={onClose}
      heightPercent={0.9}
      hasFixedFooter={true}
    >
      <MealForm
        form={form}
        onFormChange={setForm}
        mealType={mealType}
        onMealTypeChange={setMealType}
        foodType={foodType}
        onFoodTypeChange={setFoodType}
        showLabels={true}
      />

      <CreateMealButtons
        onAdd={handleSaveMeal}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </BottomSheet>
  );
};

export default EditMealDetailsModal;
