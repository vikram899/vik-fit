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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  updateMeal,
  getAllMeals,
} from "../services/database";
import { modalStyles, formStyles, buttonStyles, COLORS } from "../styles";
import { STRINGS } from "../constants/strings";

const EditMealDetailsModal = ({ visible, meal, onClose, onMealUpdated }) => {
  const [form, setForm] = React.useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  React.useEffect(() => {
    if (meal) {
      setForm({
        name: meal.name || "",
        calories: meal.calories?.toString() || "",
        protein: meal.protein?.toString() || "",
        carbs: meal.carbs?.toString() || "",
        fats: meal.fats?.toString() || "",
      });
    }
  }, [meal]);

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
        parseFloat(form.fats) || 0
      );

      // Reload meals and callback
      const updatedMeals = await getAllMeals();
      onMealUpdated?.(updatedMeals);
      onClose();

      Alert.alert(
        "Success",
        `${form.name} has been updated successfully!`
      );
    } catch (error) {
      console.error("Error updating meal:", error);
      Alert.alert(
        "Error",
        "Failed to update meal. Please try again."
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
    onClose();
  };

  if (!meal) return null;

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
                <Text style={modalStyles.title}>Edit Meal</Text>

                {/* Meal Name */}
                <View style={formStyles.formGroup}>
                  <Text style={formStyles.label}>Meal Name</Text>
                  <TextInput
                    style={formStyles.input}
                    placeholder="e.g., Grilled Chicken"
                    placeholderTextColor={COLORS.inputPlaceholder}
                    value={form.name}
                    onChangeText={(value) => setForm({ ...form, name: value })}
                  />
                </View>

                {/* Calories and Protein */}
                <View style={formStyles.rowGroup}>
                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>Calories</Text>
                    <TextInput
                      style={formStyles.input}
                      placeholder="0"
                      placeholderTextColor={COLORS.inputPlaceholder}
                      value={form.calories}
                      onChangeText={(value) =>
                        setForm({ ...form, calories: value })
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>Protein (g)</Text>
                    <TextInput
                      style={formStyles.input}
                      placeholder="0"
                      placeholderTextColor={COLORS.inputPlaceholder}
                      value={form.protein}
                      onChangeText={(value) =>
                        setForm({ ...form, protein: value })
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Carbs and Fats */}
                <View style={formStyles.rowGroup}>
                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>Carbs (g)</Text>
                    <TextInput
                      style={formStyles.input}
                      placeholder="0"
                      placeholderTextColor={COLORS.inputPlaceholder}
                      value={form.carbs}
                      onChangeText={(value) =>
                        setForm({ ...form, carbs: value })
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>Fats (g)</Text>
                    <TextInput
                      style={formStyles.input}
                      placeholder="0"
                      placeholderTextColor={COLORS.inputPlaceholder}
                      value={form.fats}
                      onChangeText={(value) =>
                        setForm({ ...form, fats: value })
                      }
                      keyboardType="decimal-pad"
                    />
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
                    onPress={handleSaveMeal}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={buttonStyles.buttonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      buttonStyles.button,
                      buttonStyles.buttonHalf,
                      buttonStyles.cancelButton,
                    ]}
                    onPress={handleClose}
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
  );
};

export default EditMealDetailsModal;
