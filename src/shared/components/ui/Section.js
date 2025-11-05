/**
 * REUSABLE SECTION COMPONENT
 *
 * Container with section header and optional action button.
 * Used for organizing content into logical sections.
 *
 * Features:
 * - Section title
 * - Optional description/subtitle
 * - Optional action button
 * - Collapsible state
 * - Loading state
 *
 * @example
 * <Section
 *   title="Today's Workouts"
 *   actionLabel="View All"
 *   onActionPress={() => navigation.navigate('AllWorkouts')}
 * >
 *   <WorkoutCard {...props} />
 *   <WorkoutCard {...props} />
 * </Section>
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

const Section = ({
  // Content
  title,
  description,
  children,

  // Actions
  actionLabel,
  onActionPress,

  // States
  isCollapsible = false,
  isCollapsed = false,
  isLoading = false,

  // Appearance
  variant = 'default', // 'default', 'elevated'
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const handleActionPress = () => {
    if (onActionPress && !isLoading) {
      onActionPress();
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <View style={[styles.container, variant === 'elevated' && styles.containerElevated]}>
      {/* Section Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.titleContainer, isCollapsible && styles.titleClickable]}
          onPress={isCollapsible ? toggleCollapse : undefined}
          disabled={!isCollapsible}
        >
          <View style={styles.titleContent}>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
          </View>

          {isCollapsible && (
            <MaterialCommunityIcons
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              size={24}
              color={COLORS.textSecondary}
            />
          )}
        </TouchableOpacity>

        {/* Action Button */}
        {actionLabel && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleActionPress}
            disabled={isLoading}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={COLORS.primary}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {!collapsed && <View style={styles.content}>{children}</View>}

      {/* Empty state */}
      {!children && !isLoading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.element,
    paddingHorizontal: SPACING.element,
  },

  containerElevated: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    borderRadius: SPACING.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.element,
  },

  titleContainer: {
    flex: 1,
  },

  titleClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleContent: {
    flex: 1,
  },

  title: {
    ...TYPOGRAPHY.sectionTitle,
    marginBottom: SPACING.xs,
  },

  description: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    borderRadius: SPACING.borderRadius,
    marginLeft: SPACING.small,
  },

  actionLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  actionIcon: {
    marginLeft: SPACING.xs,
  },

  content: {
    width: '100%',
  },

  emptyState: {
    paddingVertical: SPACING.container,
    alignItems: 'center',
  },

  emptyStateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default Section;
