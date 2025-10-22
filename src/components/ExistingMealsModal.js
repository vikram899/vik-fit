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
  updateMeal,
  deleteMeal,
  getMealLogsForDate,
  getDailyTotals,
  getAllMeals,
} from "../services/database";
import { modalStyles, formStyles, buttonStyles, COLORS } from "../styles";
import { STRINGS } from "../constants/strings";

const ExistingMealsModal = ({ visible, meals = [], onClose, onMealAdded }) => {
  const today = new Date().toISOString().split("T")[0];
  const [editMode, setEditMode] = React.useState(false);
  const [editingMealId, setEditingMealId] = React.useState(null);
  const [form, setForm] = React.useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [localMeals, setLocalMeals] = React.useState(meals);
  const [addedMealIds, setAddedMealIds] = React.useState(new Set());

  React.useEffect(() => {
    setLocalMeals(meals);
  }, [meals]);

  const handleAddMealToday = async (meal) => {
    try {
      await logMeal(
        meal.id,
        today,
        meal.calories || 0,
        meal.protein || 0,
        meal.carbs || 0,
        meal.fats || 0
      );

      const updatedMeals = await getMealLogsForDate(today);
      const totals = await getDailyTotals(today);

      // Mark meal as added
      setAddedMealIds(new Set([...addedMealIds, meal.id]));

      onMealAdded?.({ meals: updatedMeals, totals });
      Alert.alert(
        STRINGS.existingMealsModal.alerts.addSuccess.title,
        STRINGS.existingMealsModal.alerts.addSuccess.message(meal.name)
      );
    } catch (error) {
      console.error("Error adding meal to today:", error);
      Alert.alert(
        STRINGS.existingMealsModal.alerts.addError.title,
        STRINGS.existingMealsModal.alerts.addError.message
      );
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMealId(meal.id);
    setForm({
      name: meal.name,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString(),
    });
  };

  const handleSaveEdit = async (meal) => {
    try {
      await updateMeal(
        meal.id,
        form.name || meal.name,
        "General",
        parseFloat(form.calories) || meal.calories,
        parseFloat(form.protein) || meal.protein,
        parseFloat(form.carbs) || meal.carbs,
        parseFloat(form.fats) || meal.fats
      );

      const updatedMeals = await getAllMeals();
      setLocalMeals(updatedMeals);
      setEditingMealId(null);
      setForm({ name: "", calories: "", protein: "", carbs: "", fats: "" });
      Alert.alert(
        STRINGS.existingMealsModal.alerts.updateSuccess.title,
        STRINGS.existingMealsModal.alerts.updateSuccess.message
      );
    } catch (error) {
      console.error("Error updating meal:", error);
      Alert.alert(
        STRINGS.existingMealsModal.alerts.updateError.title,
        STRINGS.existingMealsModal.alerts.updateError.message
      );
    }
  };

  const handleDeleteMeal = (meal) => {
    Alert.alert(
      STRINGS.existingMealsModal.alerts.deleteConfirmDialog.title,
      STRINGS.existingMealsModal.alerts.deleteConfirmDialog.message,
      [
        {
          text: STRINGS.existingMealsModal.alerts.deleteCancel,
          onPress: () => {},
          style: "cancel",
        },
        {
          text: STRINGS.existingMealsModal.alerts.deleteConfirmButton,
          onPress: async () => {
            try {
              await deleteMeal(meal.id);
              const updatedMeals = await getAllMeals();
              setLocalMeals(updatedMeals);
            } catch (error) {
              console.error("Error deleting meal:", error);
              // Add delay to show error alert after confirmation dialog closes
              setTimeout(() => {
                Alert.alert(
                  STRINGS.existingMealsModal.alerts.deleteError.title,
                  STRINGS.existingMealsModal.alerts.deleteError.message
                );
              }, 500);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleClose = () => {
    setEditMode(false);
    setEditingMealId(null);
    setForm({ name: "", calories: "", protein: "", carbs: "", fats: "" });
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
                {/* Header with title and edit toggle */}
                <View style={modalStyles.header}>
                  <Text style={modalStyles.title}>{STRINGS.existingMealsModal.title}</Text>
                  <TouchableOpacity
                    onPress={() => setEditMode(!editMode)}
                    style={modalStyles.editToggle}
                  >
                    <MaterialCommunityIcons
                      name={editMode ? "check" : "pencil"}
                      size={24}
                      color={editMode ? COLORS.success : COLORS.primary}
                    />
                  </TouchableOpacity>
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
                      <View key={meal.id} style={modalStyles.mealItemWrapper}>
                        {editMode && editingMealId === meal.id ? (
                          // Edit mode
                          <View
                            style={[modalStyles.editForm, formStyles.formGroup]}
                          >
                            <TextInput
                              style={[formStyles.input, { marginBottom: 10 }]}
                              placeholder={STRINGS.existingMealsModal.labels.mealName}
                              placeholderTextColor={COLORS.inputPlaceholder}
                              value={form.name}
                              onChangeText={(value) =>
                                setForm({ ...form, name: value })
                              }
                            />
                            <View style={formStyles.rowGroup}>
                              <TextInput
                                style={[formStyles.input, { flex: 1 }]}
                                placeholder={STRINGS.existingMealsModal.labels.calories}
                                placeholderTextColor={COLORS.inputPlaceholder}
                                value={form.calories}
                                onChangeText={(value) =>
                                  setForm({ ...form, calories: value })
                                }
                                keyboardType="decimal-pad"
                              />
                              <TextInput
                                style={[formStyles.input, { flex: 1 }]}
                                placeholder={STRINGS.existingMealsModal.labels.protein}
                                placeholderTextColor={COLORS.inputPlaceholder}
                                value={form.protein}
                                onChangeText={(value) =>
                                  setForm({ ...form, protein: value })
                                }
                                keyboardType="decimal-pad"
                              />
                            </View>
                            <View style={formStyles.rowGroup}>
                              <TextInput
                                style={[formStyles.input, { flex: 1 }]}
                                placeholder={STRINGS.existingMealsModal.labels.carbs}
                                placeholderTextColor={COLORS.inputPlaceholder}
                                value={form.carbs}
                                onChangeText={(value) =>
                                  setForm({ ...form, carbs: value })
                                }
                                keyboardType="decimal-pad"
                              />
                              <TextInput
                                style={[formStyles.input, { flex: 1 }]}
                                placeholder={STRINGS.existingMealsModal.labels.fats}
                                placeholderTextColor={COLORS.inputPlaceholder}
                                value={form.fats}
                                onChangeText={(value) =>
                                  setForm({ ...form, fats: value })
                                }
                                keyboardType="decimal-pad"
                              />
                            </View>
                            <View style={buttonStyles.buttonGroup}>
                              <TouchableOpacity
                                style={[
                                  buttonStyles.button,
                                  buttonStyles.buttonHalf,
                                  buttonStyles.buttonPrimary,
                                ]}
                                onPress={() => {
                                  Keyboard.dismiss();
                                  setTimeout(() => {
                                    handleSaveEdit(meal);
                                  }, 100);
                                }}
                              >
                                <Text style={buttonStyles.buttonText}>
                                  {STRINGS.existingMealsModal.buttons.save}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  buttonStyles.button,
                                  buttonStyles.buttonHalf,
                                  buttonStyles.cancelButton,
                                ]}
                                onPress={() => {
                                  setEditingMealId(null);
                                  setForm({
                                    name: "",
                                    calories: "",
                                    protein: "",
                                    carbs: "",
                                    fats: "",
                                  });
                                }}
                              >
                                <Text style={buttonStyles.buttonText}>
                                  {STRINGS.existingMealsModal.buttons.cancel}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          // View mode
                          <View style={modalStyles.mealItemContent}>
                            <View style={{ flex: 1 }}>
                              <Text style={modalStyles.mealName}>
                                {meal.name}
                              </Text>
                              <Text style={modalStyles.mealMacros}>
                                {Math.round(meal.calories)} cal •{" "}
                                {Math.round(meal.protein)}g protein
                              </Text>
                            </View>
                            <View style={modalStyles.buttonsGroup}>
                              {editMode ? (
                                <>
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => handleEditMeal(meal)}
                                  >
                                    <MaterialCommunityIcons
                                      name="pencil"
                                      size={24}
                                      color={COLORS.primary}
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => handleDeleteMeal(meal)}
                                  >
                                    <MaterialCommunityIcons
                                      name="trash-can"
                                      size={24}
                                      color={COLORS.danger}
                                    />
                                  </TouchableOpacity>
                                </>
                              ) : addedMealIds.has(meal.id) ? (
                                <MaterialCommunityIcons
                                  name="check"
                                  size={24}
                                  color={COLORS.success}
                                />
                              ) : (
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  onPress={() => handleAddMealToday(meal)}
                                >
                                  <MaterialCommunityIcons
                                    name="plus"
                                    size={24}
                                    color={COLORS.success}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}
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
                    <Text style={buttonStyles.buttonText}>{STRINGS.existingMealsModal.buttons.close}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      buttonStyles.button,
                      buttonStyles.buttonHalf,
                      buttonStyles.cancelButton,
                    ]}
                    onPress={handleClose}
                  >
                    <Text style={buttonStyles.buttonText}>{STRINGS.existingMealsModal.buttons.cancel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ExistingMealsModal;
