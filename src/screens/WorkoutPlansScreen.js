import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useWorkoutPlans } from '../hooks/useWorkoutPlans';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/design';

/**
 * WorkoutPlansScreen - Display list of workout plans
 * Users can:
 * - View all existing plans
 * - Select a plan to start workout
 * - Create new plan
 * - Edit/delete plans
 */
export const WorkoutPlansScreen = ({ navigation }) => {
  const {
    plans,
    loading,
    error,
    loadPlans,
    deletePlanById,
    clearError,
  } = useWorkoutPlans();

  useEffect(() => {
    // Load plans when screen mounts
    loadPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    // Navigate to PlanDetailScreen to view plan and start workout
    navigation.navigate('PlanDetail', { planId: plan.id });
  };

  const handleCreatePlan = () => {
    // Navigate to CreatePlanScreen
    navigation.navigate('CreatePlan');
  };

  const handleDeletePlan = (plan) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.name}"?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const result = await deletePlanById(plan.id);
            if (result.success) {
              Alert.alert('Success', 'Plan deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete plan');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderPlanCard = ({ item: plan }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() => handleSelectPlan(plan)}
      activeOpacity={0.7}
    >
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          <Text style={styles.exerciseCount}>
            {(plan.exercises || []).length} exercise{(plan.exercises || []).length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePlan(plan)}
        >
          <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.planFooter}>
        <Text style={styles.createdDate}>
          Created {new Date(plan.createdAt).toLocaleDateString()}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="fitness-center" size={48} color={COLORS.lightGray} />
      <Text style={styles.emptyText}>No workout plans yet</Text>
      <Text style={styles.emptySubtext}>Create your first plan to get started</Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => {
              clearError();
              loadPlans();
            }}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Plans</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreatePlan}
        >
          <MaterialIcons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading && plans.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={plans.length > 0}
        />
      )}
    </View>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  deleteButton: {
    padding: 4,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  createdDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray,
    marginTop: SPACING.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.error,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  errorButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
});
