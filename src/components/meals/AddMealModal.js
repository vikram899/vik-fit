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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  addMeal,
  logMeal,
} from "../../services/database";
import { modalStyles, formStyles, buttonStyles, COLORS } from "../../styles";
import { STRINGS } from "../../constants/strings";

const AddMealModal = ({ visible, onClose, onMealAdded, showMealType = false, selectedMealType = null }) => {
  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  const [form, setForm] = React.useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const [mealType, setMealType] = React.useState(selectedMealType || 'Breakfast');

  const handleAddMeal = async () => {
    if (!form.name.trim()) {
      Alert.alert(
        STRINGS.addMealModal.alerts.errorMealName.title,
        STRINGS.addMealModal.alerts.errorMealName.message
      );
      return;
    }

    if (!form.calories.trim()) {
      Alert.alert(
        STRINGS.addMealModal.alerts.errorCalories.title,
        STRINGS.addMealModal.alerts.errorCalories.message
      );
      return;
    }

    if (!form.protein.trim()) {
      Alert.alert(
        STRINGS.addMealModal.alerts.errorProtein.title,
        STRINGS.addMealModal.alerts.errorProtein.message
      );
      return;
    }

    try {
      const mealName = form.name.trim();
      const today = new Date().toISOString().split("T")[0];

      // Add meal to existing meals table
      const mealId = await addMeal(
        mealName,
        "General",
        parseFloat(form.calories) || 0,
        parseFloat(form.protein) || 0,
        parseFloat(form.carbs) || 0,
        parseFloat(form.fats) || 0
      );

      // If called from LogMealsScreen with mealType, also log the meal for today
      if (showMealType) {
        await logMeal(
          mealId,
          today,
          parseFloat(form.calories) || 0,
          parseFloat(form.protein) || 0,
          parseFloat(form.carbs) || 0,
          parseFloat(form.fats) || 0,
          mealType
        );
      }

      // Reset form and close modal
      setForm({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      });
      setMealType('Breakfast');

      // Notify parent to refresh meals list
      onMealAdded?.({ mealId, mealLogged: showMealType });
      onClose();

      Alert.alert(
        STRINGS.addMealModal.alerts.success.title,
        STRINGS.addMealModal.alerts.success.message(mealName)
      );
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert(
        STRINGS.addMealModal.alerts.error.title,
        STRINGS.addMealModal.alerts.error.message
      );
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });
    setMealType('Breakfast');
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
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={modalStyles.title}>{STRINGS.addMealModal.title}</Text>

                  {/* Meal Name */}
                  <View style={formStyles.formGroup}>
                    <Text style={formStyles.label}>{STRINGS.addMealModal.labels.mealName}</Text>
                    <TextInput
                      style={formStyles.input}
                      placeholder={STRINGS.addMealModal.placeholders.mealName}
                      placeholderTextColor={COLORS.inputPlaceholder}
                      value={form.name}
                      onChangeText={(value) => setForm({ ...form, name: value })}
                    />
                  </View>

                  {/* Meal Type (only show when called from LogMealsScreen) */}
                  {showMealType && (
                    <View style={formStyles.formGroup}>
                      <Text style={formStyles.label}>Meal Type</Text>
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {MEAL_TYPES.map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={{
                              width: '48%',
                              paddingVertical: 12,
                              paddingHorizontal: 12,
                              borderRadius: 8,
                              borderWidth: 2,
                              borderColor: mealType === type ? COLORS.primary : COLORS.mediumGray,
                              backgroundColor: mealType === type ? COLORS.primary : COLORS.lightGray,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 8,
                            }}
                            onPress={() => setMealType(type)}
                          >
                            <Text style={{
                              fontSize: 13,
                              fontWeight: '600',
                              color: mealType === type ? COLORS.white : COLORS.textPrimary,
                            }}>
                              {type}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Calories and Protein (mandatory) */}
                  <View style={formStyles.rowGroup}>
                    <View style={[formStyles.formGroup, { flex: 1 }]}>
                      <Text style={formStyles.label}>{STRINGS.addMealModal.labels.calories}</Text>
                      <TextInput
                        style={formStyles.input}
                        placeholder={STRINGS.addMealModal.placeholders.calories}
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={form.calories}
                        onChangeText={(value) =>
                          setForm({ ...form, calories: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={[formStyles.formGroup, { flex: 1 }]}>
                      <Text style={formStyles.label}>{STRINGS.addMealModal.labels.protein}</Text>
                      <TextInput
                        style={formStyles.input}
                        placeholder={STRINGS.addMealModal.placeholders.protein}
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={form.protein}
                        onChangeText={(value) =>
                          setForm({ ...form, protein: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  {/* Carbs and Fats (optional) */}
                  <View style={formStyles.rowGroup}>
                    <View style={[formStyles.formGroup, { flex: 1 }]}>
                      <Text style={formStyles.label}>{STRINGS.addMealModal.labels.carbs}</Text>
                      <TextInput
                        style={formStyles.input}
                        placeholder={STRINGS.addMealModal.placeholders.carbs}
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={form.carbs}
                        onChangeText={(value) =>
                          setForm({ ...form, carbs: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={[formStyles.formGroup, { flex: 1 }]}>
                      <Text style={formStyles.label}>{STRINGS.addMealModal.labels.fats}</Text>
                      <TextInput
                        style={formStyles.input}
                        placeholder={STRINGS.addMealModal.placeholders.fats}
                        placeholderTextColor={COLORS.inputPlaceholder}
                        value={form.fats}
                        onChangeText={(value) =>
                          setForm({ ...form, fats: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </ScrollView>

                {/* Buttons */}
                <View style={buttonStyles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      buttonStyles.button,
                      buttonStyles.buttonHalf,
                      buttonStyles.buttonPrimary,
                    ]}
                    onPress={handleAddMeal}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={buttonStyles.buttonText}>{STRINGS.addMealModal.buttons.add}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      buttonStyles.button,
                      buttonStyles.buttonHalf,
                      buttonStyles.cancelButton,
                    ]}
                    onPress={handleClose}
                  >
                    <Text style={buttonStyles.buttonText}>{STRINGS.addMealModal.buttons.cancel}</Text>
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

export default AddMealModal;
