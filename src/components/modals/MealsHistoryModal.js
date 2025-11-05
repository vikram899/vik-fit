import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles';
import { COLORS as SHARED_COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';
import { getWeeklyDailyBreakdown, getMondayOfWeek } from '../../../services/mealStats';

/**
 * MealsHistoryModal Component
 * Shows daily meal history with macro breakdown for the selected week
 */
const MealsHistoryModal = ({ visible, onClose }) => {
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonday, setCurrentSunday] = useState(
    getMondayOfWeek(new Date().toISOString().split('T')[0])
  );

  // Load weekly data
  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      const breakdown = await getWeeklyDailyBreakdown(currentMonday);
      setWeeklyBreakdown(breakdown);
    } catch (error) {
      Alert.alert('Error', 'Failed to load meal history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadWeeklyData();
    }
  }, [visible, currentMonday]);

  const handlePreviousWeek = () => {
    const prevSunday = new Date(currentMonday);
    prevSunday.setDate(prevSunday.getDate() - 7);
    setCurrentSunday(prevSunday.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextSunday = new Date(currentMonday);
    nextSunday.setDate(nextSunday.getDate() + 7);
    setCurrentSunday(nextSunday.toISOString().split('T')[0]);
  };

  const handleTodayWeek = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentSunday(getMondayOfWeek(today));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWeeklyData();
  };

  // Format week label with month/day
  const formatDateRange = () => {
    const sundayDate = new Date(currentMonday);
    const saturdayDate = new Date(sundayDate);
    saturdayDate.setDate(saturdayDate.getDate() + 6);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sundayMonth = monthNames[sundayDate.getMonth()];
    const sundayDay = sundayDate.getDate();
    const saturdayMonth = monthNames[saturdayDate.getMonth()];
    const saturdayDay = saturdayDate.getDate();

    if (sundayMonth === saturdayMonth) {
      return `${sundayMonth} ${sundayDay} - ${saturdayDay}`;
    } else {
      return `${sundayMonth} ${sundayDay} - ${saturdayMonth} ${saturdayDay}`;
    }
  };

  const weekLabel = formatDateRange();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meals History</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            onPress={handlePreviousWeek}
            style={styles.navButton}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <View style={styles.weekLabelContainer}>
            <Text style={styles.weekLabelText}>{weekLabel}</Text>
          </View>

          <TouchableOpacity
            onPress={handleNextWeek}
            style={styles.navButton}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Today Button */}
        <View style={styles.todayButtonContainer}>
          <TouchableOpacity
            onPress={handleTodayWeek}
            style={styles.todayButton}
          >
            <MaterialCommunityIcons name="calendar-today" size={14} color={SHARED_COLORS.white} />
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Breakdown List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : weeklyBreakdown.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="food-off"
                size={48}
                color="#ccc"
              />
              <Text style={styles.emptyText}>No meals logged this week</Text>
            </View>
          ) : (
            weeklyBreakdown.map((day) => (
              <View key={day.date} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={styles.dayName}>{day.day}</Text>
                    <Text style={styles.dayDate}>{day.date}</Text>
                  </View>
                  <Text style={styles.dayCalories}>
                    {Math.round(day.totalCalories)} kcal
                  </Text>
                </View>

                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <MaterialCommunityIcons
                      name="flash"
                      size={16}
                      color={SHARED_COLORS.proteinIcon}
                    />
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>{Math.round(day.totalProtein)}g</Text>
                  </View>

                  <View style={styles.macroItem}>
                    <MaterialCommunityIcons
                      name="bread-slice"
                      size={16}
                      color={SHARED_COLORS.carbsIcon}
                    />
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>{Math.round(day.totalCarbs)}g</Text>
                  </View>

                  <View style={styles.macroItem}>
                    <MaterialCommunityIcons
                      name="water"
                      size={16}
                      color={SHARED_COLORS.fatsIcon}
                    />
                    <Text style={styles.macroLabel}>Fats</Text>
                    <Text style={styles.macroValue}>{Math.round(day.totalFats)}g</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
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
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    backgroundColor: SHARED_COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: SHARED_COLORS.mediumGray,
  },
  navButton: {
    padding: SPACING.xs,
  },
  weekLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: SHARED_COLORS.textPrimary,
  },
  todayButtonContainer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.element,
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadius,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: SHARED_COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    gap: SPACING.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: SHARED_COLORS.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: SPACING.small,
  },
  emptyText: {
    fontSize: 14,
    color: SHARED_COLORS.textTertiary,
  },
  dayCard: {
    backgroundColor: SHARED_COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.small,
    borderWidth: 1,
    borderColor: SHARED_COLORS.mediumGray,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: SHARED_COLORS.textPrimary,
  },
  dayDate: {
    fontSize: 11,
    color: SHARED_COLORS.textTertiary,
    marginTop: 2,
  },
  dayCalories: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: SHARED_COLORS.mediumGray,
  },
  macroItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  macroLabel: {
    fontSize: 11,
    color: SHARED_COLORS.textTertiary,
    fontWeight: '500',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
    color: SHARED_COLORS.textPrimary,
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
});

export default MealsHistoryModal;
