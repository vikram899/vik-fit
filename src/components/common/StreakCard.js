import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../shared/constants';
import BottomSheet from './BottomSheet';
import SectionHeader from './SectionHeader';

/**
 * StreakCard Component
 * Displays a minimalistic streak indicator with color-coded checkmarks
 * Reusable for both Meals and Workouts
 */
const StreakCard = ({
  daysTracked,
  totalDays = 7,
  trackingMetric = 'Calories',
  weeklyBreakdown = [],
  getStreakColor = () => ({ background: '#e0e0e0', border: '#ccc' }),
  showLegend = false,
}) => {
  const [showLegendModal, setShowLegendModal] = useState(false);

  const handleHelpPress = () => {
    setShowLegendModal(true);
  };

  return (
    <View style={styles.streakCard}>
      {/* Title Section with Help Icon */}
      <SectionHeader title="Weekly Streak" onHelpPress={handleHelpPress} />

      {/* Content Section */}
      <View style={styles.contentRow}>
        <View style={styles.streakMinimalRow}>
          <View style={styles.streakLabelContainer}>
            <View style={styles.streakHeaderRow}>
              <View>
                <Text style={styles.streakMinimalText}>
                  <Text style={styles.streakBold}>{daysTracked}/{totalDays}</Text> logged
                </Text>
                <Text style={styles.streakMetricLabel}>
                  Tracked by {trackingMetric}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.checkmarkRowMinimal}>
            {weeklyBreakdown.map((day) => {
              const color = getStreakColor(day);
              return (
                <View
                  key={day.date || day.day}
                  style={[
                    styles.checkmarkMinimal,
                    {
                      backgroundColor: color.background,
                      borderColor: color.border,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* Bottom Sheet for Color Legend */}
      <BottomSheet
        visible={showLegendModal}
        onClose={() => setShowLegendModal(false)}
        title="Color Legend"
      >
        <View style={styles.legendContent}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendTitle}>Green (80%+)</Text>
              <Text style={styles.legendDescription}>
                Achieved 80% or more of daily goal
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendTitle}>Orange (50-79%)</Text>
              <Text style={styles.legendDescription}>
                Achieved 50-79% of daily goal
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.error }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendTitle}>Red (&lt;50%)</Text>
              <Text style={styles.legendDescription}>
                Achieved less than 50% of daily goal
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.mediumGray }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendTitle}>Gray</Text>
              <Text style={styles.legendDescription}>
                No data logged for this day
              </Text>
            </View>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  streakCard: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    marginHorizontal: SPACING.element,
    marginBottom: SPACING.element,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  contentRow: {
    paddingTop: 0,
  },
  streakMinimalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakMinimalText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  streakBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  checkmarkRowMinimal: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  checkmarkMinimal: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
  },
  streakMetricLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.xs,
  },
  streakLabelContainer: {
    flex: 1,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  helpButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.small,
  },
  legendContent: {
    gap: SPACING.element,
    paddingBottom: SPACING.container,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.medium,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusSmall,
  },
  legendColor: {
    width: 40,
    height: 40,
    borderRadius: SPACING.borderRadiusSmall,
    marginTop: SPACING.xs,
  },
  legendText: {
    flex: 1,
  },
  legendTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  legendDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default StreakCard;
