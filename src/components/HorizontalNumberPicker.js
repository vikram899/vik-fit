import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HorizontalPicker from "@vseslav/react-native-horizontal-picker";
import { COLORS } from "../styles";

/**
 * NumberItem
 * Component for displaying numbers
 */
function NumberItem({ item, isActive }) {
  return (
    <View style={[styles.item, { width: 50 }]}>
      <Text
        style={[
          styles.itemText,
          {
            fontSize: 16,
            color: isActive ? COLORS.primary : "#999",
            fontWeight: isActive ? "700" : "600",
          },
        ]}
      >
        {item}
      </Text>
    </View>
  );
}

/**
 * HorizontalNumberPicker Component
 * Reusable horizontal number picker with animated numbers
 *
 * Props:
 * - minValue: number (default: 0)
 * - maxValue: number (default: 100)
 * - increment: number (default: 1)
 * - currentValue: string (current selected value)
 * - onValueChange: function (callback when value changes)
 * - title: string (optional header title)
 * - icon: string (icon name from MaterialCommunityIcons)
 * - showHeader: boolean (default: true)
 */
export default function HorizontalNumberPicker({
  minValue = 0,
  maxValue = 100,
  increment = 1,
  currentValue = "",
  onValueChange,
  title = "Select Value",
  icon = "pound",
  showHeader = true,
}) {
  // Generate array of values with specified increments
  const generateValueArray = () => {
    const values = [];
    for (let i = minValue; i <= maxValue; i += increment) {
      values.push(parseFloat(i.toFixed(1)));
    }
    return values;
  };

  const VALUE_ARRAY = generateValueArray();

  return (
    <View style={styles.pickerSection}>
      {showHeader && (
        <View style={styles.pickerHeader}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.pickerTitle}>{title}</Text>
        </View>
      )}

      <View style={styles.pickerMarkerContainer}>
        <MaterialCommunityIcons
          name="arrow-down"
          size={24}
          color={COLORS.primary}
        />
      </View>

      <HorizontalPicker
        data={VALUE_ARRAY}
        itemWidth={50}
        renderItem={(item, index) => {
          const isActive = Math.abs(parseFloat(currentValue) - item) < 0.01;
          return <NumberItem item={item} isActive={isActive} />;
        }}
        defaultIndex={
          currentValue
            ? VALUE_ARRAY.findIndex(
                (v) => Math.abs(v - parseFloat(currentValue)) < 0.01
              )
            : VALUE_ARRAY.findIndex(
                (v) => v === minValue + (maxValue - minValue) / 2
              )
        }
        onChange={(index) => {
          onValueChange(VALUE_ARRAY[index].toFixed(1));
        }}
        //snapTimeout={5}
        //animationDuration={10}
        decelerationRate={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pickerSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    color: "#333",
  },
  pickerMarkerContainer: {
    alignItems: "center",
    marginBottom: 8,
    height: 24,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
  },
});
