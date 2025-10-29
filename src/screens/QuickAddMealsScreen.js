import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../styles";
import { getAllMeals, logMeal } from "../services/database";
import MealCard from "../components/MealCard";
import SelectMealTimePopup from "../components/SelectMealTimePopup";

const screenHeight = Dimensions.get("window").height;
const bottomSheetHeight = screenHeight * 0.9;

const QuickAddMealsScreen = ({ navigation, route }) => {
  const today = new Date().toISOString().split("T")[0];
  const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  const [meals, setMeals] = React.useState([]);
  const [addedMealIds, setAddedMealIds] = React.useState(new Set());
  const [mealTypeSelectVisible, setMealTypeSelectVisible] =
    React.useState(false);
  const [mealTypeSelectMeal, setMealTypeSelectMeal] = React.useState(null);
  const [selectedMealType, setSelectedMealType] = React.useState("Breakfast");
  const [loading, setLoading] = React.useState(true);

  // Animation for bottom sheet
  const slideAnim = React.useRef(new Animated.Value(bottomSheetHeight)).current;

  React.useEffect(() => {
    const loadMeals = async () => {
      try {
        setLoading(true);
        const mealsList = await getAllMeals();
        setMeals(mealsList || []);
      } catch (error) {
        console.error("Error loading meals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();

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
      console.error("Error adding meal to today:", error);
    }
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
            Quick Add Meals
          </Text>
          <TouchableOpacity
            onPress={handleCloseBottomSheet}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Meals List */}
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: "#999" }}>
              Loading meals...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
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
                  color="#ccc"
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: "#999",
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
                    style={{ marginBottom: 12 }}
                  >
                    <MealCard
                      meal={meal}
                      showPlusIcon={true}
                      isAdded={addedMealIds.has(meal.id)}
                      onMenuPress={() => {
                        if (addedMealIds.has(meal.id)) {
                          return; // Don't do anything if already added
                        }
                        handleShowMealTypeSelector(meal);
                      }}
                    />
                  </View>
                ))
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* Meal Type Selection Modal */}
      <SelectMealTimePopup
        visible={mealTypeSelectVisible}
        mealName={mealTypeSelectMeal?.name}
        selectedMealType={selectedMealType}
        onMealTypeChange={setSelectedMealType}
        onConfirm={() => {
          handleAddMealToday(mealTypeSelectMeal, selectedMealType);
        }}
        onCancel={() => {
          setMealTypeSelectVisible(false);
          setMealTypeSelectMeal(null);
        }}
      />
    </Modal>
  );
};

export default QuickAddMealsScreen;
