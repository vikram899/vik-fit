/**
 * REUSABLE CARD COMPONENT
 *
 * Flexible card container with optional title, subtitle, and actions.
 * Used throughout the app for displaying content in a contained format.
 *
 * Features:
 * - Optional title and subtitle
 * - Optional action button (text label OR custom component)
 * - Optional onPress callback
 * - Loading and disabled states
 * - Clean, consistent styling
 *
 * @example with text action label
 * <Card
 *   title="Daily Summary"
 *   subtitle="Nov 5, 2025"
 *   actionLabel="Log"
 *   onActionPress={() => navigation.navigate('LogMeals')}
 * >
 *   <Text>Card content here</Text>
 * </Card>
 *
 * @example with custom action component (like LogButton)
 * <Card
 *   title="Weight Progress"
 *   actionComponent={
 *     <LogButton
 *       onPress={() => navigation.navigate('WeightTracking')}
 *       size="small"
 *     />
 *   }
 * >
 *   <Text>Card content here</Text>
 * </Card>
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../shared/constants";

const Card = ({
  // Content
  title,
  subtitle,
  children,

  // Actions
  onPress,
  actionLabel,
  actionComponent,
  onActionPress,

  // States
  isLoading = false,
  isDisabled = false,
  isError = false,

  // Appearance
  variant = "default", // 'default', 'highlight', 'outline'
}) => {
  const handlePress = () => {
    if (!isDisabled && !isLoading && onPress) {
      onPress();
    }
  };

  const handleActionPress = () => {
    if (!isDisabled && !isLoading && onActionPress) {
      onActionPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variant === "highlight" && styles.containerHighlight,
        variant === "outline" && styles.containerOutline,
        isDisabled && styles.containerDisabled,
        isError && styles.containerError,
      ]}
      onPress={handlePress}
      disabled={isDisabled || isLoading}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header with title and action button */}
      {(title || actionLabel || actionComponent) && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {/* Action Component or Button */}
          {actionComponent ? (
            actionComponent
          ) : actionLabel ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleActionPress}
              disabled={isDisabled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.actionButtonText}>{actionLabel}</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Loading state overlay */}
      {isLoading && !actionLabel && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Children content */}
      {!isLoading && <View style={styles.content}>{children}</View>}

      {/* Error state message */}
      {isError && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>Failed to load data</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.secondaryBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  containerHighlight: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  containerOutline: {
    backgroundColor: COLORS.mainBackground,
    borderColor: COLORS.mediumGray,
  },

  containerDisabled: {
    opacity: 0.6,
  },

  containerError: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.element,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    ...TYPOGRAPHY.sectionTitle,
    marginBottom: SPACING.xs,
  },

  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },

  actionButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.element,
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 28,
    marginLeft: SPACING.element,
  },

  actionButtonText: {
    ...TYPOGRAPHY.small,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  content: {
    width: "100%",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: SPACING.borderRadiusLarge,
  },

  errorMessage: {
    marginTop: SPACING.small,
    padding: SPACING.small,
    backgroundColor: COLORS.dangerLight,
    borderRadius: SPACING.borderRadius,
  },

  errorText: {
    ...TYPOGRAPHY.small,
    color: COLORS.danger,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default Card;
