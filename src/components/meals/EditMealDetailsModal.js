import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  updateMeal,
  getAllMeals,
} from "../../services/database";
import { buttonStyles, COLORS } from "../../styles";
import { COLORS as SHARED_COLORS, SPACING } from "../../shared/constants";
import MealForm from "../MealForm";

const screenHeight = Dimensions.get("window").height;
const bottomSheetHeight = screenHeight * 0.9;

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

  // Animation for bottom sheet
  const slideAnim = React.useRef(new Animated.Value(bottomSheetHeight)).current;

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

      // Reset and animate in
      slideAnim.setValue(bottomSheetHeight);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, meal, slideAnim]);

  const handleCloseBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: bottomSheetHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
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
              handleCloseBottomSheet();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update meal. Please try again."
      );
    }
  };

  if (!meal) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleCloseBottomSheet}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            opacity: slideAnim.interpolate({
              inputRange: [0, bottomSheetHeight],
              outputRange: [1, 0],
            }),
            zIndex: 999,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleCloseBottomSheet}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: bottomSheetHeight,
            backgroundColor: SHARED_COLORS.white,
            borderTopLeftRadius: SPACING.borderRadiusXL,
            borderTopRightRadius: SPACING.borderRadiusXL,
            overflow: "hidden",
            zIndex: 1000,
          },
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag handle indicator */}
        <View
          style={{
            alignItems: "center",
            paddingTop: SPACING.xs,
            paddingBottom: SPACING.xs,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: SHARED_COLORS.mediumGray,
              borderRadius: 2,
            }}
          />
        </View>

        {/* Header */}
        <View
          style={{
            paddingHorizontal: SPACING.element,
            paddingVertical: SPACING.small,
            borderBottomWidth: 1,
            borderBottomColor: SHARED_COLORS.mediumGray,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: SHARED_COLORS.textPrimary }}>
            Edit Meal
          </Text>
          <TouchableOpacity
            onPress={handleCloseBottomSheet}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <MealForm
          form={form}
          onFormChange={setForm}
          mealType={mealType}
          onMealTypeChange={setMealType}
          foodType={foodType}
          onFoodTypeChange={setFoodType}
          showLabels={true}
        />

        {/* Buttons - Fixed at Bottom */}
        <View
          style={{
            flexDirection: "row",
            padding: SPACING.small,
            paddingBottom: SPACING.element,
            backgroundColor: SHARED_COLORS.white,
            gap: SPACING.small,
            borderTopWidth: 1,
            borderTopColor: SHARED_COLORS.mediumGray,
          }}
        >
          <TouchableOpacity
            style={[
              buttonStyles.button,
              buttonStyles.buttonHalf,
              buttonStyles.buttonPrimary,
            ]}
            onPress={handleSaveMeal}
          >
            <MaterialCommunityIcons name="check" size={20} color={SHARED_COLORS.white} />
            <Text style={buttonStyles.buttonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.button, buttonStyles.buttonHalf, buttonStyles.cancelButton]}
            onPress={handleCloseBottomSheet}
          >
            <Text style={buttonStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default EditMealDetailsModal;
