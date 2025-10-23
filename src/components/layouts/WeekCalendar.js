import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * WeekCalendar Component
 * Displays a week view with selectable days
 *
 * @param {number} selectedDay - Currently selected day (0-6)
 * @param {function} onDaySelect - Callback when day is selected
 * @param {array} highlightedDays - Days to highlight (optional, for showing scheduled plans)
 */
const WeekCalendar = ({ selectedDay, onDaySelect, highlightedDays = [] }) => {
  return (
    <View style={styles.container}>
      <View style={styles.weekDays}>
        {DAYS.map((day, index) => {
          const isSelected = selectedDay === index;
          const isHighlighted = highlightedDays.includes(index);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDaySelect(index)}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
                isHighlighted && !isSelected && styles.dayButtonHighlighted,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isHighlighted && !isSelected && styles.dayTextHighlighted,
                ]}
              >
                {day}
              </Text>
              {isHighlighted && !isSelected && (
                <View style={styles.dot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.selectedDayLabel}>
        <Text style={styles.selectedDayText}>{FULL_DAYS[selectedDay]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    flex: 1,
    marginHorizontal: 4,
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayButtonHighlighted: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayTextHighlighted: {
    color: '#2e7d32',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  selectedDayLabel: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  selectedDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default WeekCalendar;
