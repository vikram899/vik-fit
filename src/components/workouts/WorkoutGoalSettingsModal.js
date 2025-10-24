import React, { useState, useEffect } from 'react';
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
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { modalStyles, formStyles, buttonStyles, COLORS } from '../../styles';
import { STRINGS } from '../../constants/strings';
import { getGoalPreferences, updateGoalPreference, updateUserSetting } from '../../services/database';

const WorkoutGoalSettingsModal = ({ visible, onClose, onSave }) => {
  const [streakTrackingMetric, setStreakTrackingMetric] = useState('workouts');
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);

  const STREAK_METRICS = [
    { key: 'workouts', label: 'Workouts', icon: 'dumbbell', color: '#2196F3' },
    { key: 'exercises', label: 'Exercises', icon: 'lightning-bolt', color: '#FF9800' },
  ];

  const STATS_OPTIONS = [
    { key: 'workoutTarget', label: 'Workout Target', icon: 'target', color: '#2196F3' },
    { key: 'exercisesCompleted', label: 'Exercises', icon: 'check-circle', color: '#4CAF50' },
    { key: 'consistency', label: 'Consistency', icon: 'calendar-check', color: '#FF9800' },
    { key: 'strengthStats', label: 'Strength', icon: 'dumbbell', color: '#FF6B6B' },
    { key: 'volumeStats', label: 'Volume', icon: 'chart-box', color: '#9C27B0' },
    { key: 'restTimeStats', label: 'Rest Time', icon: 'timer', color: '#00BCD4' },
    { key: 'recoveryStats', label: 'Recovery', icon: 'heart-pulse', color: '#E91E63' },
  ];

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
      if (onSave) {
        onSave({
          streakTrackingMetric,
        });
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const isStatEnabled = (statKey) => {
    return preferences.some(p => p.statName === statKey && p.isEnabled === 1);
  };

  const handleChangeStreakMetric = async (metric) => {
    try {
      setStreakTrackingMetric(metric);
      await updateUserSetting('workoutStreakTrackingMetric', metric);

      // Notify parent component
      if (onSave) {
        onSave({
          streakTrackingMetric: metric,
        });
      }
    } catch (error) {
      console.error('Error updating tracking metric:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleSave = async () => {
    try {
      onSave?.({
        streakTrackingMetric,
      });

      onClose();
    } catch (error) {
      console.error('Error saving goal settings:', error);
      Alert.alert('Error', 'Failed to save goal settings');
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
          <Text style={styles.headerTitle}>Workout Goals</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Set your workout goals and choose which stats to track
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
              {STREAK_METRICS.map((metric) => (
                <TouchableOpacity
                  key={metric.key}
                  style={[
                    styles.metricOption,
                    streakTrackingMetric === metric.key && styles.metricOptionSelected,
                  ]}
                  onPress={() => handleChangeStreakMetric(metric.key)}
                >
                  <MaterialCommunityIcons
                    name={metric.icon}
                    size={18}
                    color={streakTrackingMetric === metric.key ? '#fff' : metric.color}
                  />
                  <Text
                    style={[
                      styles.metricOptionText,
                      streakTrackingMetric === metric.key && styles.metricOptionTextSelected,
                    ]}
                  >
                    {metric.label}
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
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : preferences.length === 0 ? (
              <Text style={styles.emptyText}>No stats available</Text>
            ) : (
              STATS_OPTIONS.map((stat) => {
                const isEnabled = isStatEnabled(stat.key);
                return (
                  <TouchableOpacity
                    key={stat.key}
                    style={styles.settingItem}
                    onPress={() => {
                      const pref = preferences.find(p => p.statName === stat.key);
                      if (pref) {
                        handleToggleStat(stat.key, pref.isEnabled === 1);
                      }
                    }}
                  >
                    <View style={styles.settingContent}>
                      <View style={styles.iconSection}>
                        <MaterialCommunityIcons
                          name={stat.icon}
                          size={20}
                          color={isEnabled ? COLORS.primary : stat.color}
                        />
                      </View>
                      <View style={styles.labelSection}>
                        <Text style={styles.settingLabel}>{stat.label}</Text>
                        <Text style={styles.settingDescription}>
                          {isEnabled ? 'Showing in stats' : 'Hidden from stats'}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isEnabled && styles.checkboxActive,
                      ]}
                    >
                      {isEnabled && (
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color="#fff"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Done</Text>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 0,
  },
  goalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalInputUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  metricOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  metricOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  metricOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  metricOptionTextSelected: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSection: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelSection: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 11,
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default WorkoutGoalSettingsModal;
