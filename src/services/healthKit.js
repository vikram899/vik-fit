import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

// For iOS only - HealthKit integration
let AppleHealthKit = null;
let isHealthKitAvailable = false;

if (Platform.OS === 'ios') {
  try {
    // Try to load the native module
    const AppleHealth = require('react-native-health').default;
    if (AppleHealth && typeof AppleHealth.initHealthKit === 'function') {
      AppleHealthKit = AppleHealth;
      isHealthKitAvailable = true;
    }
  } catch (e) {
    isHealthKitAvailable = false;
  }
}

/**
 * Hook to fetch step count from Apple HealthKit
 * Only works on iOS
 *
 * Returns:
 * - steps: number - Today's step count
 * - loading: boolean - Whether data is being fetched
 * - error: string | null - Error message if fetch failed
 * - hasPermission: boolean - Whether user granted permission
 * - refreshSteps: function - Manually refresh step count
 * - requestPermission: function - Request HealthKit permission
 */
export const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  /**
   * Request HealthKit permissions
   */
  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'HealthKit is only available on iOS');
      return false;
    }

    if (!isHealthKitAvailable || !AppleHealthKit) {
      Alert.alert(
        'Custom Dev Client Required',
        'This feature requires a custom dev client with native modules. Please build with EAS or run with eas dev.'
      );
      return false;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      try {
        const permissions = {
          permissions: {
            read: ['HKQuantityTypeIdentifierStepCount'],
          },
        };

        AppleHealthKit.initHealthKit(permissions, (err, result) => {
          if (err) {
            setError('Permission denied. Check that HealthKit is supported on this device.');
            setHasPermission(false);
            setLoading(false);
            resolve(false);
            return;
          }

          setHasPermission(true);
          setLoading(false);
          resolve(true);
        });
      } catch (err) {
        setError(err.message || 'Failed to request permission');
        setLoading(false);
        resolve(false);
      }
    });
  }, []);

  /**
   * Fetch today's step count from HealthKit
   */
  const fetchStepCount = useCallback(async () => {
    if (Platform.OS !== 'ios' || !AppleHealthKit) {
      setSteps(0);
      return;
    }

    // If no permission, don't try to fetch
    if (!hasPermission) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const options = {
        startDate: today,
        endDate: tomorrow,
      };

      AppleHealthKit.getStepCount(options, (err, result) => {
        setLoading(false);
        if (err) {
          setError('Failed to fetch steps');
          setSteps(0);
          return;
        }

        setSteps(Math.round(result.value || 0));
        setError(null);
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setSteps(0);
    }
  }, [hasPermission]);

  // Initialize on mount - try to get permission if not iOS
  useEffect(() => {
    if (Platform.OS === 'ios' && AppleHealthKit && !hasPermission) {
      requestPermission();
    }
  }, []);

  // Fetch steps when permission is granted
  useEffect(() => {
    if (hasPermission) {
      fetchStepCount();
    }
  }, [hasPermission, fetchStepCount]);

  const refreshSteps = useCallback(() => {
    if (hasPermission) {
      fetchStepCount();
    }
  }, [hasPermission, fetchStepCount]);

  return {
    steps,
    loading,
    error,
    hasPermission,
    refreshSteps,
    requestPermission,
  };
};

/**
 * Initialize HealthKit with required permissions
 * Should be called early in app lifecycle
 */
export const initializeHealthKit = async () => {
  if (Platform.OS !== 'ios' || !AppleHealthKit) {
    return false;
  }

  return new Promise((resolve) => {
    const permissions = {
      permissions: {
        read: ['HKQuantityTypeIdentifierStepCount'],
      },
    };

    AppleHealthKit.initHealthKit(permissions, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
