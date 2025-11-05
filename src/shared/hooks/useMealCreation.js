import { useState, useRef, useCallback, useEffect } from "react";
import { Animated, Alert, Dimensions } from "react-native";
import { addMeal, logMeal } from "../../services/database";

const screenHeight = Dimensions.get("window").height;
const bottomSheetHeight = screenHeight * 0.9;

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
 * - slideAnim: Animated value for slide animation
 * - panResponder: Pan responder for drag gesture
 * - handleAddMeal: Function to add meal
 * - handleCloseBottomSheet: Function to close bottom sheet
 * - handleClose: Wrapper for close handler
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

  // Animation
  const slideAnim = useRef(new Animated.Value(bottomSheetHeight)).current;

  // Initialize animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Close bottom sheet with animation
  const handleCloseBottomSheet = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: bottomSheetHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  }, [slideAnim, navigation]);

  // Pan responder for drag gesture
  const panResponder = useRef(
    require("react-native").PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 10,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          slideAnim.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > 50) {
          handleCloseBottomSheet();
        } else {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
              handleCloseBottomSheet();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add meal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [form, foodType, mealType, today, validateForm, handleCloseBottomSheet]);

  // Close wrapper
  const handleClose = useCallback(() => {
    handleCloseBottomSheet();
  }, [handleCloseBottomSheet]);

  return {
    form,
    setForm,
    mealType,
    setMealType,
    foodType,
    setFoodType,
    slideAnim,
    panResponder,
    handleAddMeal,
    handleCloseBottomSheet,
    handleClose,
    isLoading,
    bottomSheetHeight,
  };
};
