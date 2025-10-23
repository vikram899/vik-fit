import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles';

/**
 * DailyBreakdownCards Component
 * Shows detailed macro breakdown for each day of the week
 */
const DailyBreakdownCards = ({ weeklyData, dailyGoals, expandAll = false }) => {
  const [expandedDays, setExpandedDays] = useState(new Set());

  // Update expanded state when expandAll changes
  useEffect(() => {
    if (expandAll) {
      // Expand all days
      setExpandedDays(new Set(weeklyData.map((_, index) => index)));
    } else {
      // Collapse all days
      setExpandedDays(new Set());
    }
  }, [expandAll, weeklyData]);

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDays(newExpanded);
  };

  const MacroRow = ({ label, icon, value, unit, goal }) => {
    const percentage = goal > 0 ? (value / goal) * 100 : 0;
    const progressColor =
      percentage >= 90 ? '#4CAF50' :
      percentage >= 70 ? '#FFC107' :
      percentage >= 50 ? '#FF9800' :
      '#FF6B6B';

    return (
      <View style={styles.macroRow}>
        <View style={styles.macroLeft}>
          <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>{label}</Text>
            <Text style={styles.macroValue}>
              {Math.round(value)}{unit} {goal > 0 ? `/ ${Math.round(goal)}${unit}` : ''}
            </Text>
          </View>
        </View>
        {goal > 0 && (
          <View style={styles.macroProgress}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: progressColor }]}>
              {Math.round(percentage)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {weeklyData.map((day, index) => {
        const isExpanded = expandedDays.has(index);

        return (
          <TouchableOpacity
            key={day.date}
            style={styles.dayCard}
            onPress={() => toggleExpand(index)}
          >
            <View style={styles.dayHeader}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>{day.day}</Text>
                <Text style={styles.dayDate}>{day.date}</Text>
              </View>
              <View style={styles.dayStats}>
                <View style={styles.caloriesSummary}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={14}
                    color="#FF6B6B"
                  />
                  <Text style={styles.calorieValue}>
                    {Math.round(day.totalCalories)}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#999"
                />
              </View>
            </View>

            {isExpanded && (
              <View style={styles.dayContent}>
                <MacroRow
                  label="Calories"
                  icon="fire"
                  value={day.totalCalories}
                  unit=""
                  goal={dailyGoals?.calorieGoal || 0}
                />
                <MacroRow
                  label="Protein"
                  icon="flash"
                  value={day.totalProtein}
                  unit="g"
                  goal={dailyGoals?.proteinGoal || 0}
                />
                <MacroRow
                  label="Carbs"
                  icon="bread-slice"
                  value={day.totalCarbs}
                  unit="g"
                  goal={dailyGoals?.carbsGoal || 0}
                />
                <MacroRow
                  label="Fats"
                  icon="water"
                  value={day.totalFats}
                  unit="g"
                  goal={dailyGoals?.fatsGoal || 0}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  caloriesSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calorieValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  dayContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  macroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  macroInfo: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  macroProgress: {
    width: 100,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DailyBreakdownCards;
