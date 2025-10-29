import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addMeal, logMeal, getMealLogsForDate, getDailyTotals } from "../services/database";
import { modalStyles, formStyles, buttonStyles, COLORS } from "../styles";
import MealForm from "../components/MealForm";

const screenHeight = Dimensions.get("window").height;
const bottomSheetHeight = screenHeight * 0.9;

const CreateMealScreen = ({ navigation }) => {
  const today = new Date().toISOString().split("T")[0];

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
    // Animate in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleCloseBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: bottomSheetHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
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

  const handleAddMeal = async () => {
    if (!form.name.trim()) {
      Alert.alert("Meal Name Required", "Please enter a meal name");
      return;
    }

    if (!form.calories.trim()) {
      Alert.alert("Calories Required", "Please enter calories");
      return;
    }

    if (!form.protein.trim()) {
      Alert.alert("Protein Required", "Please enter protein");
      return;
    }

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
      console.error("Error adding meal:", error);
      Alert.alert("Error", "Failed to add meal. Please try again.");
    }
  };

  const handleClose = () => {
    handleCloseBottomSheet();
  };

  return (
    <Modal
      visible={true}
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
        <TouchableWithoutFeedback onPress={handleCloseBottomSheet}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
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
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
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
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#ddd",
              borderRadius: 2,
            }}
          />
        </View>

        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#f0f0f0",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
            Add New Meal
          </Text>
          <TouchableOpacity
            onPress={handleClose}
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
        />

        {/* Buttons - Fixed at Bottom */}
        <View
          style={{
            flexDirection: "row",
            padding: 12,
            paddingBottom: 24,
            backgroundColor: "#fff",
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
          }}
        >
          <TouchableOpacity
            style={[
              buttonStyles.button,
              buttonStyles.buttonHalf,
              buttonStyles.buttonPrimary,
            ]}
            onPress={handleAddMeal}
          >
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
            <Text style={buttonStyles.buttonText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.button, buttonStyles.buttonHalf, buttonStyles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={buttonStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default CreateMealScreen;
