import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../styles";

/**
 * MealCardItem Component
 * Reusable meal card displaying meal info with macros
 *
 * Props:
 * - meal: object (name, calories, protein, carbs, fats)
 * - onMenuPress: function (callback for menu button)
 */
export default function MealCardItem({ meal, onMenuPress }) {
  return (
    <View style={styles.mealCard}>
      {/* Card Header: Name + Calories + Menu */}
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <View style={styles.mealTitleRow}>
            <Text style={styles.mealName} numberOfLines={1}>
              🍽️ {meal.name}
            </Text>
            {meal.calories && (
              <Text style={styles.caloriesText}>
                <MaterialCommunityIcons name="fire" size={14} color="#007AFF" />
                <Text style={styles.caloriesValue}>
                  {Math.round(meal.calories)}
                </Text>{" "}
                kcal
              </Text>
            )}
          </View>
        </View>

        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.kebabButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Macros */}
      <View style={styles.macrosContainer}>
        {/* Protein */}
        <View style={styles.macroItem}>
          <View style={styles.macroIconContainer}>
            <MaterialCommunityIcons name="flash" size={14} color="#FF9800" />
          </View>
          <Text style={styles.macroText}>
            P:{" "}
            <Text style={styles.macroValue}>
              {Math.round(meal.protein || 0)}g
            </Text>
          </Text>
        </View>

        <View style={styles.macroDivider} />

        {/* Carbs */}
        <View style={styles.macroItem}>
          <View style={styles.macroIconContainer}>
            <MaterialCommunityIcons
              name="bread-slice"
              size={14}
              color="#4CAF50"
            />
          </View>
          <Text style={styles.macroText}>
            C:{" "}
            <Text style={styles.macroValue}>
              {Math.round(meal.carbs || 0)}g
            </Text>
          </Text>
        </View>

        <View style={styles.macroDivider} />

        {/* Fats */}
        <View style={styles.macroItem}>
          <View style={styles.macroIconContainer}>
            <MaterialCommunityIcons name="water" size={14} color="#FF6B6B" />
          </View>
          <Text style={styles.macroText}>
            F:{" "}
            <Text style={styles.macroValue}>{Math.round(meal.fats || 0)}g</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 0,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
  },
  mealTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.2,
  },
  caloriesText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  caloriesValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  kebabButton: {
    padding: 6,
    marginRight: -6,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  macroDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#e8e8e8",
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  macroIconContainer: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  macroText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
});
