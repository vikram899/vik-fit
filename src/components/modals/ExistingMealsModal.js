import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  ScrollView,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  logMeal,
  getMealLogsForDate,
  getDailyTotals,
} from "../../services/database";
import { modalStyles, formStyles, buttonStyles, COLORS } from "../../styles";
import { STRINGS } from "../../constants/strings";
import {
  COLORS as SHARED_COLORS,
  SPACING,
  TYPOGRAPHY,
} from "../../shared/constants";
import MealCard from "../MealCard";

const ExistingMealsModal = ({ visible, meals = [], onClose, onMealAdded }) => {
  const today = new Date().toISOString().split("T")[0];
  const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  const [localMeals, setLocalMeals] = React.useState(meals);
  const [addedMealIds, setAddedMealIds] = React.useState(new Set());
  const [mealTypeSelectVisible, setMealTypeSelectVisible] =
    React.useState(false);
  const [mealTypeSelectMeal, setMealTypeSelectMeal] = React.useState(null);
  const [selectedMealType, setSelectedMealType] = React.useState("Breakfast");

  React.useEffect(() => {
    setLocalMeals(meals);
  }, [meals]);

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

      const updatedMeals = await getMealLogsForDate(today);
      const totals = await getDailyTotals(today);

      // Mark meal as added
      setAddedMealIds(new Set([...addedMealIds, meal.id]));

      onMealAdded?.({ meals: updatedMeals, totals });

      // Close meal type selector
      setMealTypeSelectVisible(false);
      setMealTypeSelectMeal(null);

      Alert.alert(
        STRINGS.existingMealsModal.alerts.addSuccess.title,
        STRINGS.existingMealsModal.alerts.addSuccess.message(meal.name)
      );
    } catch (error) {
      Alert.alert(
        STRINGS.existingMealsModal.alerts.addError.title,
        STRINGS.existingMealsModal.alerts.addError.message
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={modalStyles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={modalStyles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={modalStyles.content}>
                {/* Header with title */}
                <View style={modalStyles.header}>
                  <Text style={modalStyles.title}>
                    {STRINGS.existingMealsModal.title}
                  </Text>
                </View>

                {/* Meals List */}
                <ScrollView
                  style={modalStyles.mealsList}
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  {localMeals.length === 0 ? (
                    <Text style={modalStyles.emptyText}>
                      {STRINGS.existingMealsModal.emptyState}
                    </Text>
                  ) : (
                    localMeals.map((meal) => (
                      <View
                        key={meal.id}
                        style={{
                          position: "relative",
                          marginHorizontal: 0,
                          marginBottom: SPACING.small,
                        }}
                      >
                        <MealCard meal={meal} />
                        {/* Overlay button for quick-add */}
                        <View
                          style={{
                            position: "absolute",
                            right: SPACING.element,
                            top: SPACING.small,
                            zIndex: 10,
                          }}
                        >
                          {addedMealIds.has(meal.id) ? (
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={28}
                              color={COLORS.success}
                            />
                          ) : (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => handleShowMealTypeSelector(meal)}
                              style={{
                                backgroundColor: COLORS.success,
                                borderRadius: 50,
                                padding: SPACING.xs,
                              }}
                              hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                              }}
                            >
                              <MaterialCommunityIcons
                                name="plus"
                                size={24}
                                color={SHARED_COLORS.white}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* Bottom Buttons */}
                <View style={buttonStyles.buttonGroup}>
                  <TouchableOpacity
                    style={[buttonStyles.button, buttonStyles.buttonHalf]}
                    onPress={handleClose}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={buttonStyles.buttonText}>
                      {STRINGS.existingMealsModal.buttons.close}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      buttonStyles.button,
                      buttonStyles.buttonHalf,
                      buttonStyles.cancelButton,
                    ]}
                    onPress={handleClose}
                  >
                    <Text style={buttonStyles.buttonText}>
                      {STRINGS.existingMealsModal.buttons.cancel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Meal Type Selection Modal */}
      <Modal
        visible={mealTypeSelectVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setMealTypeSelectVisible(false);
          setMealTypeSelectMeal(null);
        }}
      >
        <KeyboardAvoidingView
          style={modalStyles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setMealTypeSelectVisible(false);
              setMealTypeSelectMeal(null);
            }}
          >
            <View style={modalStyles.overlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={modalStyles.content}>
                  <Text style={modalStyles.title}>Select Meal Type</Text>
                  {mealTypeSelectMeal && (
                    <Text style={modalStyles.mealNameLabel}>
                      {mealTypeSelectMeal.name}
                    </Text>
                  )}

                  {/* Meal Type Selection */}
                  <View style={formStyles.formGroup}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: SPACING.small,
                        flexWrap: "wrap",
                      }}
                    >
                      {MEAL_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={{
                            flex: 1,
                            minWidth: "48%",
                            paddingVertical: SPACING.small,
                            paddingHorizontal: SPACING.small,
                            borderRadius: SPACING.borderRadius,
                            borderWidth: 2,
                            borderColor:
                              selectedMealType === type
                                ? COLORS.primary
                                : SHARED_COLORS.mediumGray,
                            backgroundColor:
                              selectedMealType === type
                                ? COLORS.primary
                                : SHARED_COLORS.secondaryBackground,
                            alignItems: "center",
                          }}
                          onPress={() => setSelectedMealType(type)}
                        >
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.small.fontSize,
                              fontWeight: TYPOGRAPHY.weights.semibold,
                              color:
                                selectedMealType === type
                                  ? SHARED_COLORS.white
                                  : SHARED_COLORS.textPrimary,
                            }}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Buttons */}
                  <View style={buttonStyles.buttonGroup}>
                    <TouchableOpacity
                      style={[
                        buttonStyles.button,
                        buttonStyles.buttonHalf,
                        buttonStyles.buttonPrimary,
                      ]}
                      onPress={() => {
                        handleAddMealToday(
                          mealTypeSelectMeal,
                          selectedMealType
                        );
                      }}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={SHARED_COLORS.white}
                      />
                      <Text style={buttonStyles.buttonText}>Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        buttonStyles.button,
                        buttonStyles.buttonHalf,
                        buttonStyles.cancelButton,
                      ]}
                      onPress={() => {
                        setMealTypeSelectVisible(false);
                        setMealTypeSelectMeal(null);
                      }}
                    >
                      <Text style={buttonStyles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
  );
};

export default ExistingMealsModal;
