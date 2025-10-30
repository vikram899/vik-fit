import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles';
import {
  getGoalPreferences,
  updateGoalPreference,
  getUserSetting,
  updateUserSetting,
} from '../../services/database';

/**
 * Reusable GoalSettingsModal Component
 * Used to configure which stats to display in progress screens
 *
 * Props:
 * - visible: boolean - Modal visibility
 * - onClose: function - Called when modal is closed
 * - onSettingsSaved: function - Called when settings are saved
 * - type: string - 'meals' or 'workouts' to determine which stats to show
 * - trackingMetricSettingKey: string - Database key for the tracking metric setting
 * - trackingMetricOptions: object - Options for tracking metric selection
 * - statsOptions: array - Available stats to toggle
 * - statLabels: object - Labels and descriptions for each stat
 */
const GoalSettingsModal = ({
  visible,
  onClose,
  onSettingsSaved,
  type = 'meals', // 'meals' or 'workouts'
  trackingMetricSettingKey = 'streakTrackingMetric',
  trackingMetricOptions = {},
  statsOptions = [],
  statLabels = {},
}) => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingMetric, setTrackingMetric] = useState('calories');

  // Default options for meals
  const defaultMealsTrackingMetrics = {
    calories: { label: 'Calories', icon: 'fire', color: '#FF6B6B' },
    protein: { label: 'Protein', icon: 'flash', color: '#2196F3' },
    carbs: { label: 'Carbs', icon: 'bread-slice', color: '#FF9800' },
    fats: { label: 'Fats', icon: 'water', color: '#9C27B0' },
  };

  const defaultMealsStatLabels = {
    calorieTarget: {
      label: 'Calorie Target',
      description: 'Show days you hit calorie goal + trend',
      icon: 'fire',
      iconColor: '#FF6B6B',
    },
    proteinIntake: {
      label: 'Protein Intake',
      description: 'Show protein change vs last week',
      icon: 'flash',
      iconColor: '#2196F3',
    },
    carbsIntake: {
      label: 'Carbs Intake',
      description: 'Show carbs change vs last week',
      icon: 'bread-slice',
      iconColor: '#FF9800',
    },
    fatsIntake: {
      label: 'Fats Intake',
      description: 'Show fats change vs last week',
      icon: 'water',
      iconColor: '#9C27B0',
    },
    mealPrepTips: {
      label: 'Meal Prep Tips',
      description: 'Show actionable meal prep suggestions',
      icon: 'lightbulb-on',
      iconColor: '#FF9800',
    },
  };

  const defaultWorkoutsTrackingMetrics = {
    workouts: { label: 'Workouts', icon: 'dumbbell', color: '#2196F3' },
    exercises: { label: 'Exercises', icon: 'lightning-bolt', color: '#FF9800' },
  };

  const defaultWorkoutsStatLabels = {
    workoutTarget: {
      label: 'Workout Target',
      description: 'Show completed vs scheduled workouts',
      icon: 'target',
      iconColor: '#2196F3',
    },
    exercisesCompleted: {
      label: 'Exercises',
      description: 'Show completed vs scheduled exercises',
      icon: 'check-circle',
      iconColor: '#4CAF50',
    },
    consistency: {
      label: 'Consistency',
      description: 'Show days you logged workouts',
      icon: 'calendar-check',
      iconColor: '#FF9800',
    },
    strengthStats: {
      label: 'Strength',
      description: 'Show strength progress and max lifts',
      icon: 'dumbbell',
      iconColor: '#FF6B6B',
    },
    volumeStats: {
      label: 'Volume',
      description: 'Show total training volume and reps completed',
      icon: 'chart-box',
      iconColor: '#9C27B0',
    },
    restTimeStats: {
      label: 'Rest Time',
      description: 'Show average rest time between sets',
      icon: 'timer',
      iconColor: '#00BCD4',
    },
    recoveryStats: {
      label: 'Recovery',
      description: 'Show recovery and rest day metrics',
      icon: 'heart-pulse',
      iconColor: '#E91E63',
    },
  };

  // Use provided options or defaults based on type
  const metricsOptions = trackingMetricOptions.length > 0
    ? trackingMetricOptions
    : (type === 'meals' ? defaultMealsTrackingMetrics : defaultWorkoutsTrackingMetrics);

  const labels = Object.keys(statLabels).length > 0
    ? statLabels
    : (type === 'meals' ? defaultMealsStatLabels : defaultWorkoutsStatLabels);

  // Load preferences when modal opens
  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getGoalPreferences();
      setPreferences(prefs);

      // Load tracking metric
      const metric = await getUserSetting(trackingMetricSettingKey);
      if (metric) {
        setTrackingMetric(metric);
      } else {
        // Set default based on type
        const defaultMetric = type === 'meals' ? 'calories' : 'workouts';
        setTrackingMetric(defaultMetric);
      }
    } catch (error) {
      console.error('Error loading goal preferences:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStat = async (statName, currentValue) => {
    try {
      const newValue = !currentValue;
      await updateGoalPreference(statName, newValue);

      // Update local state
      setPreferences(
        preferences.map(pref =>
          pref.statName === statName
            ? { ...pref, isEnabled: newValue ? 1 : 0 }
            : pref
        )
      );

      // Notify parent component
      if (onSettingsSaved) {
        onSettingsSaved({ [trackingMetricSettingKey]: trackingMetric });
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleChangeTrackingMetric = async (metric) => {
    try {
      setTrackingMetric(metric);
      await updateUserSetting(trackingMetricSettingKey, metric);

      // Notify parent component with updated metric
      if (onSettingsSaved) {
        onSettingsSaved({ [trackingMetricSettingKey]: metric });
      }
    } catch (error) {
      console.error('Error updating tracking metric:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleClose = () => {
    onClose();
  };

  const headerTitle = type === 'meals' ? 'Meal Goal Stats' : 'Workout Goal Stats';
  const headerDescription = type === 'meals'
    ? 'Select which stats you want to see in your weekly meal progress'
    : 'Select which stats you want to see in your weekly workout progress';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{headerDescription}</Text>
        </View>

        {/* Settings List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Streak Tracking Metric Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Streak Tracking Metric</Text>
            <Text style={styles.sectionDescription}>
              Which metric should determine your daily streak colors?
            </Text>
            <View style={styles.metricOptionsContainer}>
              {Object.entries(metricsOptions).map(([key, option]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.metricOption,
                    trackingMetric === key && styles.metricOptionSelected,
                  ]}
                  onPress={() => handleChangeTrackingMetric(key)}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={18}
                    color={trackingMetric === key ? '#fff' : option.color}
                  />
                  <Text
                    style={[
                      styles.metricOptionText,
                      trackingMetric === key && styles.metricOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Stats Settings */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Display Stats</Text>
            {preferences.map((pref) => {
              const statInfo = labels[pref.statName];
              if (!statInfo) return null;

              return (
                <View key={pref.statName} style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <View style={styles.iconSection}>
                      <MaterialCommunityIcons
                        name={statInfo.icon}
                        size={20}
                        color={statInfo.iconColor}
                      />
                    </View>
                    <View style={styles.labelSection}>
                      <Text style={styles.settingLabel}>{statInfo.label}</Text>
                      <Text style={styles.settingDescription}>
                        {statInfo.description}
                      </Text>
                    </View>
                  </View>

                  <Switch
                    value={pref.isEnabled === 1}
                    onValueChange={() =>
                      handleToggleStat(pref.statName, pref.isEnabled === 1)
                    }
                    trackColor={{ false: '#e0e0e0', true: '#c8e6c9' }}
                    thumbColor={pref.isEnabled === 1 ? '#4CAF50' : '#f0f0f0'}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  description: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelSection: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 10,
  },
  metricOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  metricOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  metricOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  metricOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  metricOptionTextSelected: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
});

export default GoalSettingsModal;
