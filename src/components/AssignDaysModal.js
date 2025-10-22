import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { modalStyles, buttonStyles, COLORS } from '../styles';

const DAYS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

/**
 * AssignDaysModal Component
 * Modal for assigning a plan to multiple days of the week
 *
 * @param {boolean} visible - Modal visibility
 * @param {string} planName - Name of the plan being assigned
 * @param {array} selectedDays - Currently selected days (array of 0-6)
 * @param {function} onSave - Callback when days are saved
 * @param {function} onClose - Callback when modal is closed
 */
const AssignDaysModal = ({ visible, planName, selectedDays = [], onSave, onClose }) => {
  const [checkedDays, setCheckedDays] = React.useState(new Set(selectedDays));

  React.useEffect(() => {
    setCheckedDays(new Set(selectedDays));
  }, [selectedDays, visible]);

  const toggleDay = (dayValue) => {
    const newChecked = new Set(checkedDays);
    if (newChecked.has(dayValue)) {
      newChecked.delete(dayValue);
    } else {
      newChecked.add(dayValue);
    }
    setCheckedDays(newChecked);
  };

  const handleSave = () => {
    if (checkedDays.size === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }
    onSave(Array.from(checkedDays).sort());
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={modalStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={modalStyles.overlay} onPress={onClose} activeOpacity={1}>
          <View style={modalStyles.content}>
            {/* Header */}
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Assign Days for Workout</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Plan Name */}
            <Text style={styles.planName}>{planName}</Text>

            {/* Days Selection */}
            <ScrollView
              style={styles.daysList}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {DAYS.map((day) => {
                const isChecked = checkedDays.has(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    onPress={() => toggleDay(day.value)}
                    style={[
                      styles.dayItem,
                      isChecked && styles.dayItemSelected,
                    ]}
                  >
                    <View style={styles.dayCheckbox}>
                      {isChecked && (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={COLORS.white}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayLabel,
                        isChecked && styles.dayLabelSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Buttons */}
            <View style={buttonStyles.buttonGroup}>
              <TouchableOpacity
                style={[
                  buttonStyles.button,
                  buttonStyles.buttonHalf,
                  buttonStyles.buttonPrimary,
                ]}
                onPress={handleSave}
              >
                <Text style={buttonStyles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  buttonStyles.button,
                  buttonStyles.buttonHalf,
                  buttonStyles.cancelButton,
                ]}
                onPress={onClose}
              >
                <Text style={buttonStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  daysList: {
    marginHorizontal: 16,
    marginBottom: 16,
    maxHeight: 350,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  dayItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  dayCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dayLabelSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default AssignDaysModal;
