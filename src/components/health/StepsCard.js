import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHealthData } from '../../services/healthKit';
import { getUserSetting, setSetting } from '../../services/database';

const DEFAULT_STEP_GOAL = 10000;

/**
 * StepsCard Component
 * Displays today's step count synced from Apple HealthKit
 * Shows progress toward daily step goal
 */
const StepsCard = () => {
  const { steps, loading, error, hasPermission, refreshSteps, requestPermission } = useHealthData();
  const [stepGoal, setStepGoal] = useState(DEFAULT_STEP_GOAL);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(!hasPermission && Platform.OS === 'ios');

  // Load step goal from database
  useEffect(() => {
    const loadStepGoal = async () => {
      try {
        const savedGoal = await getUserSetting('stepGoal');
        if (savedGoal) {
          setStepGoal(parseInt(savedGoal, 10));
        }
      } catch (err) {
      } finally {
        setLoadingGoal(false);
      }
    };

    loadStepGoal();
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        setShowPermissionPrompt(false);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleRefresh = () => {
    refreshSteps();
  };

  const percentageComplete = Math.min((steps / stepGoal) * 100, 100);

  // Android fallback - HealthKit not available
  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <View style={styles.androidPlaceholder}>
          <MaterialCommunityIcons name="information" size={24} color="#999" />
          <Text style={styles.placeholderText}>Available on iPhone only</Text>
        </View>
      </View>
    );
  }

  // Permission prompt
  if (showPermissionPrompt) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <View style={styles.permissionPrompt}>
          <MaterialCommunityIcons name="lock" size={28} color="#FF6B6B" />
          <Text style={styles.permissionTitle}>Permission Required</Text>
          <Text style={styles.permissionText}>
            Allow access to Apple Health to sync your step count
          </Text>
          <Text style={styles.devClientNote}>
            Note: This feature requires a custom dev client. If you're using Expo Go, you'll need to build with EAS.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.permissionButtonText}>Grant Access</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#FF9800" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <>
                <MaterialCommunityIcons name="refresh" size={18} color="#2196F3" />
                <Text style={styles.retryText}>Retry</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Steps</Text>
          <Text style={styles.subtitle}>Apple Health</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <MaterialCommunityIcons name="refresh" size={20} color="#2196F3" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loadingGoal ? (
          <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 20 }} />
        ) : (
          <>
            {/* Circular Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.circleBackground}>
                <View
                  style={[
                    styles.circleFill,
                    {
                      width: `${percentageComplete}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.stepsDisplay}>
                <Text style={styles.stepsCount}>{steps.toLocaleString()}</Text>
                <Text style={styles.stepsLabel}>steps</Text>
              </View>
            </View>

            {/* Goal Progress */}
            <View style={styles.goalSection}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Daily Goal</Text>
                <Text style={styles.goalValue}>{stepGoal.toLocaleString()}</Text>
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Progress</Text>
                <Text
                  style={[
                    styles.goalValue,
                    { color: percentageComplete >= 100 ? '#4CAF50' : '#2196F3' },
                  ]}
                >
                  {Math.round(percentageComplete)}%
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            {percentageComplete >= 100 ? (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.completedText}>Goal reached!</Text>
              </View>
            ) : (
              <View style={styles.incompleteBadge}>
                <MaterialCommunityIcons name="run" size={16} color="#FF9800" />
                <Text style={styles.incompleteText}>
                  {stepGoal - steps} steps remaining
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    height: 140,
    justifyContent: 'center',
  },
  circleBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'absolute',
  },
  circleFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 60,
  },
  stepsDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  stepsCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
  },
  stepsLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  goalSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  goalInfo: {
    alignItems: 'center',
    flex: 1,
  },
  goalLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    borderRadius: 6,
  },
  incompleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9800',
  },
  permissionPrompt: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  devClientNote: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    minWidth: 150,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
  },
  androidPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
});

export default StepsCard;
