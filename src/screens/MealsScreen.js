import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS } from '../constants/colors';
import { SPACING, TYPOGRAPHY } from '../constants/spacing';
import { isValidString, getMealTypeByTime } from '../utils/helpers';
import { useMeals } from '../hooks/useMeals';

/**
 * MealsScreen
 * Form for logging meals with name, description, type, and optional photo
 */
export default function MealsScreen({ navigation }) {
  const { logMeal, loading } = useMeals();
  const [mealName, setMealName] = useState('');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState(getMealTypeByTime());
  const mealNameInputRef = useRef(null);

  const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

  // Auto-focus on meal name when screen loads
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setTimeout(() => {
        mealNameInputRef.current?.focus?.();
      }, 100);
    });
    return unsubscribe;
  }, [navigation]);

  const handleSaveMeal = async () => {
    // Validate meal name
    if (!isValidString(mealName)) {
      Alert.alert('Validation Error', 'Please enter a meal name');
      return;
    }

    // Prepare meal data
    const mealData = {
      meal_name: mealName.trim(),
      description: description.trim() || null,
      meal_type: mealType,
      photo_url: null, // Photo upload to be implemented later
    };

    // Save meal
    const success = await logMeal(mealData);

    if (success) {
      // Show success toast
      Alert.alert('Success', 'Meal logged! 🍽️', [
        {
          text: 'Log Another',
          onPress: () => resetForm(),
        },
        {
          text: 'Go Home',
          onPress: () => {
            resetForm();
            navigation.navigate('Home');
          },
        },
      ]);
    } else {
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    }
  };

  const resetForm = () => {
    setMealName('');
    setDescription('');
    setMealType(getMealTypeByTime());
    mealNameInputRef.current?.focus?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Screen Title */}
            <Text style={styles.screenTitle}>Log Meal</Text>

            {/* Meal Name Input */}
            <Input
              ref={mealNameInputRef}
              placeholder="e.g., Chicken Salad"
              value={mealName}
              onChangeText={setMealName}
              clearable={true}
              keyboardType="default"
              accessibilityLabel="Meal name input"
            />

            {/* Description Input */}
            <Input
              placeholder="What's in this meal?"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              clearable={false}
              accessibilityLabel="Meal description input"
              accessibilityHint="Optional: Add ingredients or notes"
            />

            {/* Meal Type Selector */}
            <View style={styles.mealTypeContainer}>
              <Text style={styles.mealTypeLabel}>Meal Type</Text>
              <View style={styles.mealTypePills}>
                {MEAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypePill,
                      mealType === type && styles.mealTypePillActive,
                    ]}
                    onPress={() => setMealType(type)}
                    accessibilityLabel={`${type} meal type`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: mealType === type }}
                  >
                    <Text
                      style={[
                        styles.mealTypePillText,
                        mealType === type && styles.mealTypePillTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Save Meal"
                onPress={handleSaveMeal}
                loading={loading}
                disabled={!isValidString(mealName)}
                accessibilityLabel="Save meal button"
              />
            </View>

            {/* Photo Upload Note */}
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                📸 Photo upload will be available in the next update
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.container,
    paddingTop: SPACING.container,
    paddingBottom: SPACING.container,
  },
  screenTitle: {
    ...TYPOGRAPHY.screenTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.container,
  },
  mealTypeContainer: {
    marginBottom: SPACING.element,
  },
  mealTypeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
    fontWeight: '600',
  },
  mealTypePills: {
    flexDirection: 'row',
    gap: SPACING.small,
    flexWrap: 'wrap',
  },
  mealTypePill: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.background,
  },
  mealTypePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mealTypePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  mealTypePillTextActive: {
    color: COLORS.white,
  },
  buttonContainer: {
    marginTop: SPACING.element,
  },
  noteCard: {
    marginTop: SPACING.container,
    padding: SPACING.element,
    backgroundColor: '#FFF9E6',
    borderRadius: SPACING.borderRadius,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  noteText: {
    ...TYPOGRAPHY.caption,
    color: '#8B6900',
  },
});
