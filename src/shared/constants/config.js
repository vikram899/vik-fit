/**
 * CENTRALIZED APP CONFIGURATION FOR VIKFIT
 *
 * Single source of truth for all app-wide settings, API configuration,
 * feature flags, and environment-specific values.
 *
 * This file should be updated when:
 * - Adding new features that need to be toggleable
 * - Changing API endpoints or credentials
 * - Modifying timeouts or cache settings
 */

// ============================================================================
// APP METADATA
// ============================================================================

export const APP_CONFIG = {
  // App information (from app.json)
  name: 'VikFit',
  slug: 'vik-fit',
  version: '1.0.0',
  buildNumber: '1',
  description: 'A simple, modern fitness tracking app',

  // Package identifiers
  ios: {
    bundleId: 'com.vikfit.app',
    buildNumber: '1',
  },
  android: {
    packageName: 'com.vikfit.app',
    versionCode: 1,
  },

  // ============================================================================
  // RUNTIME & SDK
  // ============================================================================
  sdkVersion: '54.0.0',
  runtimeVersion: '54.0.0',

  // ============================================================================
  // API CONFIGURATION
  // ============================================================================
  api: {
    // Base URL for API calls (update with your backend URL)
    baseURL: process.env.REACT_APP_API_URL || 'https://api.vikfit.app',

    // Supabase configuration (if using Supabase backend)
    supabase: {
      url: process.env.REACT_APP_SUPABASE_URL || '',
      anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
    },

    // Request timeouts (in milliseconds)
    timeout: 30000,              // 30 seconds
    retryAttempts: 3,            // Number of retry attempts on failure
    retryDelay: 1000,            // Delay between retries in ms

    // Cache settings
    cacheEnabled: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  },

  // ============================================================================
  // FEATURE FLAGS
  // Enable/disable features without code changes
  // ============================================================================
  features: {
    // Authentication
    authEnabled: true,
    socialLoginEnabled: false,    // Google, Facebook login

    // Meals tracking
    mealsTrackingEnabled: true,
    mealSearchEnabled: true,
    mealHistoryEnabled: true,
    customMealCreationEnabled: true,

    // Workout tracking
    workoutTrackingEnabled: true,
    workoutPlansEnabled: true,
    workoutHistoryEnabled: true,
    customWorkoutEnabled: true,

    // Health integrations
    healthKitEnabled: true,       // Apple HealthKit integration
    googleFitEnabled: false,      // Google Fit integration

    // Progress tracking
    progressTrackingEnabled: true,
    weightTrackingEnabled: true,
    macroTrackingEnabled: true,
    streakTrackingEnabled: true,

    // Cloud sync
    cloudSyncEnabled: false,      // Backup to cloud
    offlineModeEnabled: true,     // Support offline mode

    // Analytics & Logging
    analyticsEnabled: true,
    crashReportingEnabled: true,
    debugLoggingEnabled: __DEV__, // Only in dev
  },

  // ============================================================================
  // DATABASE CONFIGURATION
  // ============================================================================
  database: {
    name: 'vikfit.db',
    location: 'default',
    version: '1.0.0',
    encryption: false,            // Enable SQLite encryption if needed
  },

  // ============================================================================
  // STORAGE CONFIGURATION
  // ============================================================================
  storage: {
    asyncStorageNamespace: '@vikfit/',
    clearOnLogout: true,
  },

  // ============================================================================
  // NOTIFICATION CONFIGURATION
  // ============================================================================
  notifications: {
    enabled: true,
    dailyReminderEnabled: true,
    mealReminderEnabled: true,
    workoutReminderEnabled: true,

    // Reminder times (HH:MM format)
    reminderTimes: {
      breakfast: '08:00',
      lunch: '12:30',
      dinner: '19:00',
      workout: '18:00',
    },
  },

  // ============================================================================
  // GOALS & LIMITS
  // ============================================================================
  goals: {
    // Default macro goals (can be customized per user)
    defaultCalories: 2000,
    defaultProtein: 150,
    defaultCarbs: 200,
    defaultFats: 65,

    // Default workout goal (minutes per week)
    defaultWeeklyWorkout: 150,

    // Default water intake goal (liters per day)
    defaultWaterIntake: 3,
  },

  // ============================================================================
  // UI/UX CONFIGURATION
  // ============================================================================
  ui: {
    // Animation settings
    animationsEnabled: true,
    animationDuration: 300,      // milliseconds

    // Toast notifications
    toastDuration: 3000,         // 3 seconds

    // Modal settings
    modalAnimationDuration: 300,

    // List/Scroll settings
    itemsPerPage: 20,
    paginationEnabled: true,
  },

  // ============================================================================
  // SECURITY CONFIGURATION
  // ============================================================================
  security: {
    // Require authentication
    authRequired: false,

    // Session timeout (in minutes)
    sessionTimeout: 30,

    // Biometric authentication
    biometricEnabled: true,

    // Data encryption
    dataEncryption: false,
  },

  // ============================================================================
  // THIRD-PARTY SERVICES
  // ============================================================================
  services: {
    // Analytics service (Firebase, Amplitude, etc)
    analytics: {
      enabled: true,
      provider: 'firebase', // 'firebase', 'amplitude', 'mixpanel'
    },

    // Crash reporting (Sentry, Firebase, etc)
    crashReporting: {
      enabled: true,
      provider: 'sentry',   // 'sentry', 'firebase'
      dsn: process.env.REACT_APP_SENTRY_DSN || '',
    },

    // Performance monitoring
    performanceMonitoring: {
      enabled: true,
      provider: 'firebase',
    },
  },

  // ============================================================================
  // ENVIRONMENT
  // ============================================================================
  environment: {
    isDevelopment: __DEV__,
    isProduction: !__DEV__,
    buildType: __DEV__ ? 'debug' : 'release',
  },
};

export default APP_CONFIG;
