import React, { useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HorizontalPicker from "@vseslav/react-native-horizontal-picker";
import { COLORS } from "../styles";

/**
 * AnimatedNumberItem
 * Component for animated number transitions
 */
function AnimatedNumberItem({ item, isActive, currentWeight }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1 : 0,
      duration: 50,
      useNativeDriver: false,
    }).start();
  }, [isActive, scaleAnim]);

  const fontSize = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 36],
  });

  return (
    <View style={[styles.item, { width: 80 }]}>
      <Animated.Text
        style={[
          styles.itemText,
          {
            fontSize,
            color: isActive ? COLORS.primary : "#999",
            fontWeight: isActive ? "700" : "600",
          },
        ]}
      >
        {item}
      </Animated.Text>
    </View>
  );
}

/**
 * WeightPicker Component
 * Reusable horizontal weight picker with animated numbers
 *
 * Props:
 * - minWeight: number (default: 30)
 * - maxWeight: number (default: 200)
 * - increment: number (default: 0.5)
 * - currentWeight: string (current selected weight)
 * - onWeightChange: function (callback when weight changes)
 * - title: string (optional header title)
 * - showHeader: boolean (default: true)
 */
export default function WeightPicker({
  minWeight = 30,
  maxWeight = 200,
  increment = 0.5,
  currentWeight = "",
  onWeightChange,
  title = "Today's Weight",
  showHeader = true,
}) {
  // Generate array of weights with specified increments
  const generateWeightArray = () => {
    const weights = [];
    for (let i = minWeight; i <= maxWeight; i += increment) {
      weights.push(parseFloat(i.toFixed(1)));
    }
    return weights;
  };

  const WEIGHT_ARRAY = generateWeightArray();

  return (
    <View style={styles.pickerSection}>
      {showHeader && (
        <View style={styles.pickerHeader}>
          <MaterialCommunityIcons
            name="scale-bathroom"
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
        data={WEIGHT_ARRAY}
        itemWidth={80}
        renderItem={(item, index) => {
          const isActive = Math.abs(parseFloat(currentWeight) - item) < 0.01;
          return (
            <AnimatedNumberItem
              item={item}
              isActive={isActive}
              currentWeight={currentWeight}
            />
          );
        }}
        defaultIndex={
          currentWeight
            ? WEIGHT_ARRAY.findIndex(
                (w) => Math.abs(w - parseFloat(currentWeight)) < 0.01
              )
            : WEIGHT_ARRAY.findIndex((w) => w === minWeight + (maxWeight - minWeight) / 2)
        }
        onChange={(index) => {
          onWeightChange(WEIGHT_ARRAY[index].toFixed(1));
        }}
        snapTimeout={0}
        animatedScrollToDefaultIndex={true}
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
