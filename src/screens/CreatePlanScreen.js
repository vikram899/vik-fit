import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useWorkoutPlans } from '../hooks/useWorkoutPlans';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/design';

/**
 * CreatePlanScreen - Create a new workout plan
 * Users can:
 * - Enter plan name and description
 * - Create the plan (exercises added later in PlanDetailScreen)
 */
export const CreatePlanScreen = ({ navigation }) => {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createNewPlan } = useWorkoutPlans();

  const validateForm = () => {
    if (!planName.trim()) {
      Alert.alert('Validation Error', 'Please enter a plan name');
      return false;
    }
    if (planName.trim().length < 3) {
      Alert.alert('Validation Error', 'Plan name must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await createNewPlan({
      name: planName.trim(),
      description: description.trim() || 'No description',
    });
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'Plan created successfully!', [
        {
          text: 'Add Exercises',
          onPress: () => {
            // Navigate to PlanDetailScreen to add exercises
            navigation.replace('PlanDetail', { planId: result.plan.id });
          },
        },
        {
          text: 'Back to Plans',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } else {
      Alert.alert('Error', 'Failed to create plan. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Plan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Plan Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Upper Body Strength"
            placeholderTextColor={COLORS.lightGray}
            value={planName}
            onChangeText={setPlanName}
            editable={!isSubmitting}
            maxLength={50}
          />
          <Text style={styles.charCount}>{planName.length}/50</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Add details about this workout plan..."
            placeholderTextColor={COLORS.lightGray}
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
            multiline
            numberOfLines={4}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.tipHeader}>
            <MaterialIcons name="info" size={20} color={COLORS.primary} />
            <Text style={styles.tipTitle}>Tips</Text>
          </View>
          <Text style={styles.tipText}>
            • Create a plan for different workout goals (strength, cardio, flexibility)
          </Text>
          <Text style={styles.tipText}>
            • You can add exercises after creating the plan
          </Text>
          <Text style={styles.tipText}>
            • You can also add new exercises while working out
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleCreatePlan}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <MaterialIcons name="add" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Create Plan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
  },
  textarea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'right',
  },
  tipsSection: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray,
    marginVertical: 4,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
