import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../styles";

/**
 * MealCard Component - Modern Trendy Design
 * Displays meal info: Name, Calories, Protein, Carbs, and Fats with meal type indicator
 *
 * Props:
 * - meal: object (name, calories, protein, carbs, fats, isFavorite, mealType)
 *   mealType: 'veg' | 'non-veg' | 'egg' | 'vegan'
 * - onPress: function (callback when card is tapped)
 * - onMenuPress: function (callback for menu button)
 * - onFavoritePress: function (callback when star is tapped)
 */
export default function MealCard({ meal, onPress, onMenuPress, onFavoritePress }) {
  const [isFavorite, setIsFavorite] = React.useState(meal.isFavorite || false);

  const getMealTypeInfo = (type) => {
    const mealTypes = {
      veg: {
        icon: "leaf",
        color: "#4CAF50",
        backgroundColor: "#E8F5E9",
        label: "Veg",
        borderColor: "#81C784",
      },
      "non-veg": {
        icon: "chicken",
        color: "#D32F2F",
        backgroundColor: "#FFEBEE",
        label: "Non-Veg",
        borderColor: "#EF5350",
      },
      egg: {
        icon: "egg",
        color: "#FF9800",
        backgroundColor: "#FFF3E0",
        label: "Egg",
        borderColor: "#FFB74D",
      },
      vegan: {
        icon: "sprout",
        color: "#7CB342",
        backgroundColor: "#F1F8E9",
        label: "Vegan",
        borderColor: "#9CCC65",
      },
    };
    return mealTypes[type] || mealTypes.veg;
  };

  const mealTypeInfo = getMealTypeInfo(meal.mealType || "veg");

  const handleFavoritePress = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoritePress && onFavoritePress(!isFavorite);
  };

  return (
    <TouchableOpacity
      style={[
        styles.mealCard,
        {
          borderLeftWidth: 4,
          borderLeftColor: mealTypeInfo.color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top Row: Meal Name + Star + Menu */}
      <View style={styles.topRow}>

        <Text style={styles.mealName} numberOfLines={1}>
          {meal.name}
        </Text>
        <View style={styles.topRowActions}>
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.starButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "star" : "star-outline"}
              size={22}
              color={isFavorite ? "#FFD700" : "#ccc"}
            />
          </TouchableOpacity>
          {onMenuPress && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onMenuPress();
              }}
              style={styles.menuButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Row: Stats Badges */}
      <View style={styles.bottomRow}>
        {/* Calories Badge */}
        <View style={[styles.statBadge, styles.caloriesBadge]}>
          <MaterialCommunityIcons name="fire" size={13} color="#FF6B35" />
          <View style={styles.badgeContent}>
            <Text style={styles.statBadgeLabel}>cal</Text>
            <Text style={styles.statBadgeValue}>
              {Math.round(meal.calories || 0)}
            </Text>
          </View>
        </View>

        {/* Protein Badge */}
        <View style={[styles.statBadge, styles.proteinBadge]}>
          <MaterialCommunityIcons name="dumbbell" size={13} color="#00A86B" />
          <View style={styles.badgeContent}>
            <Text style={styles.statBadgeLabel}>protein</Text>
            <Text style={styles.statBadgeValue}>
              {Math.round(meal.protein || 0)}g
            </Text>
          </View>
        </View>

        {/* Carbs Badge */}
        <View style={[styles.statBadge, styles.carbsBadge]}>
          <MaterialCommunityIcons name="bread-slice" size={13} color="#D2691E" />
          <View style={styles.badgeContent}>
            <Text style={styles.statBadgeLabel}>carbs</Text>
            <Text style={styles.statBadgeValue}>
              {Math.round(meal.carbs || 0)}g
            </Text>
          </View>
        </View>

        {/* Fats Badge */}
        <View style={[styles.statBadge, styles.fatsBadge]}>
          <MaterialCommunityIcons name="water-percent" size={13} color="#8B4513" />
          <View style={styles.badgeContent}>
            <Text style={styles.statBadgeLabel}>fats</Text>
            <Text style={styles.statBadgeValue}>
              {Math.round(meal.fats || 0)}g
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  mealName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 22,
    letterSpacing: 0.3,
    flex: 1,
  },
  topRowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  starButton: {
    padding: 8,
    marginRight: -4,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  badgeContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  caloriesBadge: {
    backgroundColor: "#FFE5D9",
  },
  proteinBadge: {
    backgroundColor: "#D4F4DD",
  },
  carbsBadge: {
    backgroundColor: "#FFE4B5",
  },
  fatsBadge: {
    backgroundColor: "#E8D4C0",
  },
  statBadgeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
    textTransform: "capitalize",
  },
  statBadgeValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  menuButton: {
    padding: 8,
    marginRight: -8,
  },
});
