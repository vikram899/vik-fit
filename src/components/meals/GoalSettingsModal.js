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
import { COLORS as SHARED_COLORS, SPACING, TYPOGRAPHY } from '../../shared/constants';
import {
  getGoalPreferences,
  updateGoalPreference,
  getUserSetting,
  updateUserSetting,
} from '../../services/database';

/**
 * GoalSettingsModal Component
 * Allows users to enable/disable which stats they want to see in the Stats section
 */
const GoalSettingsModal = ({ visible, onClose, onSettingsSaved }) => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streakTrackingMetric, setStreakTrackingMetric] = useState('calories');

  const trackingMetricOptions = {
    calories: { label: 'Calories', icon: 'fire', color: SHARED_COLORS.caloriesIcon },
    protein: { label: 'Protein', icon: 'flash', color: SHARED_COLORS.proteinIcon },
    carbs: { label: 'Carbs', icon: 'bread-slice', color: SHARED_COLORS.carbsIcon },
    fats: { label: 'Fats', icon: 'water', color: SHARED_COLORS.fatsIcon },
  };

  const statLabels = {
    calorieTarget: {
      label: 'Calorie Target',
      description: 'Show days you hit calorie goal + trend',
      icon: 'fire',
      iconColor: SHARED_COLORS.caloriesIcon,
    },
    proteinIntake: {
      label: 'Protein Intake',
      description: 'Show protein change vs last week',
      icon: 'flash',
      iconColor: SHARED_COLORS.proteinIcon,
    },
    carbsIntake: {
      label: 'Carbs Intake',
      description: 'Show carbs change vs last week',
      icon: 'bread-slice',
      iconColor: SHARED_COLORS.carbsIcon,
    },
    fatsIntake: {
      label: 'Fats Intake',
      description: 'Show fats change vs last week',
      icon: 'water',
      iconColor: SHARED_COLORS.fatsIcon,
    },
    mealPrepTips: {
      label: 'Meal Prep Tips',
      description: 'Show actionable meal prep suggestions',
      icon: 'lightbulb-on',
      iconColor: SHARED_COLORS.caloriesIcon,
    },
  };

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

      // Load streak tracking metric
      const metric = await getUserSetting('streakTrackingMetric');
      if (metric) {
        setStreakTrackingMetric(metric);
      }
    } catch (error) {
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
        onSettingsSaved();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleChangeTrackingMetric = async (metric) => {
    try {
      setStreakTrackingMetric(metric);
      await updateUserSetting('streakTrackingMetric', metric);

      // Notify parent component
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleClose = () => {
    onClose();
  };

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
          <Text style={styles.headerTitle}>Goal Stats Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Select which stats you want to see in your weekly progress
          </Text>
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
              {Object.entries(trackingMetricOptions).map(([key, option]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.metricOption,
                    streakTrackingMetric === key && styles.metricOptionSelected,
                  ]}
                  onPress={() => handleChangeTrackingMetric(key)}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={18}
                    color={streakTrackingMetric === key ? '#fff' : option.color}
                  />
                  <Text
                    style={[
                      styles.metricOptionText,
                      streakTrackingMetric === key && styles.metricOptionTextSelected,
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
              const statInfo = statLabels[pref.statName];
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
                    trackColor={{ false: SHARED_COLORS.mediumGray, true: SHARED_COLORS.success }}
                    thumbColor={pref.isEnabled === 1 ? SHARED_COLORS.success : SHARED_COLORS.gray}
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
    backgroundColor: SHARED_COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: SHARED_COLORS.mediumGray,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SHARED_COLORS.textPrimary,
  },
  descriptionContainer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    backgroundColor: SHARED_COLORS.lightGray,
  },
  description: {
    fontSize: 13,
    color: SHARED_COLORS.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    gap: SPACING.small,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.element,
    paddingHorizontal: SPACING.small,
    backgroundColor: SHARED_COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    borderWidth: 1,
    borderColor: SHARED_COLORS.mediumGray,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
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
    color: SHARED_COLORS.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: SHARED_COLORS.textTertiary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    borderTopWidth: 1,
    borderTopColor: SHARED_COLORS.mediumGray,
    backgroundColor: SHARED_COLORS.white,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.small,
    borderRadius: SPACING.borderRadius,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: SHARED_COLORS.white,
  },
  sectionContainer: {
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SHARED_COLORS.textPrimary,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 12,
    color: SHARED_COLORS.textTertiary,
    fontWeight: '500',
    marginBottom: SPACING.element,
  },
  metricOptionsContainer: {
    flexDirection: 'row',
    gap: SPACING.small,
    justifyContent: 'space-between',
  },
  metricOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.xs,
    backgroundColor: SHARED_COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    borderWidth: 2,
    borderColor: SHARED_COLORS.mediumGray,
  },
  metricOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  metricOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: SHARED_COLORS.textPrimary,
  },
  metricOptionTextSelected: {
    color: SHARED_COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: SHARED_COLORS.mediumGray,
    marginVertical: SPACING.small,
  },
});

export default GoalSettingsModal;
