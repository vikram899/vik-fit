import React from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { updateMealLog, getMealLogsForDate, getDailyTotals } from '../../services/database';
import { modalStyles, formStyles, buttonStyles, COLORS } from '../../styles';
import { STRINGS } from '../../constants/strings';

const EditMealModal = ({
  visible,
  meal,
  onClose,
  onMealUpdated,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = React.useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  React.useEffect(() => {
    if (meal) {
      setForm({
        calories: meal.calories?.toString() || '',
        protein: meal.protein?.toString() || '',
        carbs: meal.carbs?.toString() || '',
        fats: meal.fats?.toString() || '',
      });
    }
  }, [meal]);

  const handleSave = async () => {
    try {
      await updateMealLog(
        meal.id,
        parseFloat(form.calories) || 0,
        parseFloat(form.protein) || 0,
        parseFloat(form.carbs) || 0,
        parseFloat(form.fats) || 0
      );

      const meals = await getMealLogsForDate(today);
      const totals = await getDailyTotals(today);

      onMealUpdated?.({ meals, totals });
      onClose();

      Alert.alert(
        STRINGS.editMealModal.alerts.success.title,
        STRINGS.editMealModal.alerts.success.message
      );
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert(
        STRINGS.editMealModal.alerts.error.title,
        STRINGS.editMealModal.alerts.error.message
      );
    }
  };

  const handleClose = () => {
    setForm({ calories: '', protein: '', carbs: '', fats: '' });
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={modalStyles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={modalStyles.content}>
                <Text style={modalStyles.title}>{STRINGS.editMealModal.title}</Text>
                <Text style={modalStyles.mealNameLabel}>{meal.name}</Text>

                {/* Calories and Protein */}
                <View style={formStyles.rowGroup}>
                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>{STRINGS.editMealModal.labels.calories}</Text>
                    <TextInput
                      style={formStyles.input}
                      value={form.calories}
                      onChangeText={(value) => setForm({ ...form, calories: value })}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>{STRINGS.editMealModal.labels.protein}</Text>
                    <TextInput
                      style={formStyles.input}
                      value={form.protein}
                      onChangeText={(value) => setForm({ ...form, protein: value })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Carbs and Fats */}
                <View style={formStyles.rowGroup}>
                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>{STRINGS.editMealModal.labels.carbs}</Text>
                    <TextInput
                      style={formStyles.input}
                      value={form.carbs}
                      onChangeText={(value) => setForm({ ...form, carbs: value })}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={[formStyles.formGroup, { flex: 1 }]}>
                    <Text style={formStyles.label}>{STRINGS.editMealModal.labels.fats}</Text>
                    <TextInput
                      style={formStyles.input}
                      value={form.fats}
                      onChangeText={(value) => setForm({ ...form, fats: value })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Buttons */}
                <View style={buttonStyles.buttonGroup}>
                  <TouchableOpacity style={[buttonStyles.button, buttonStyles.buttonHalf, buttonStyles.buttonPrimary]} onPress={handleSave}>
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
                    <Text style={buttonStyles.buttonText}>{STRINGS.editMealModal.buttons.save}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[buttonStyles.button, buttonStyles.buttonHalf, buttonStyles.cancelButton]} onPress={handleClose}>
                    <Text style={buttonStyles.buttonText}>{STRINGS.editMealModal.buttons.cancel}</Text>
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

export default EditMealModal;
