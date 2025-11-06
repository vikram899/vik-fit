import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";
import StatBadge from "./StatBadge";

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
 * - isEditableStar: boolean (whether star can be toggled, default false)
 */
export default function MealCard({
  meal,
  onPress,
  onMenuPress,
  onFavoritePress,
  showPlusIcon = false,
  isAdded = false,
  isEditableStar = false,
}) {
  const [isFavorite, setIsFavorite] = React.useState(meal.isFavorite || false);

  // Update local state when meal prop changes
  React.useEffect(() => {
    setIsFavorite(meal.isFavorite || false);
  }, [meal.isFavorite]);

  const getMealTypeInfo = (type) => {
    const mealTypes = {
      veg: {
        icon: "leaf",
        color: COLORS.vegIcon,
        backgroundColor: COLORS.vegBackground,
        label: "Veg",
        borderColor: COLORS.vegBorder,
      },
      "non-veg": {
        icon: "chicken",
        color: COLORS.nonVegIcon,
        backgroundColor: COLORS.nonVegBackground,
        label: "Non-Veg",
        borderColor: COLORS.nonVegBorder,
      },
      egg: {
        icon: "egg",
        color: COLORS.eggIcon,
        backgroundColor: COLORS.eggBackground,
        label: "Egg",
        borderColor: COLORS.eggBorder,
      },
      vegan: {
        icon: "sprout",
        color: COLORS.veganIcon,
        backgroundColor: COLORS.veganBackground,
        label: "Vegan",
        borderColor: COLORS.veganBorder,
      },
    };
    return mealTypes[type] || mealTypes.veg;
  };

  const mealTypeInfo = getMealTypeInfo(meal.mealType || "veg");

  const handleFavoritePress = (e) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onFavoritePress && onFavoritePress(newFavoriteState);
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
          {/* Show star - editable in MealsScreen, read-only only if favorited elsewhere */}
          {isEditableStar ? (
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.starButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name={isFavorite ? "star" : "star-outline"}
                size={22}
                color={isFavorite ? COLORS.favorite : COLORS.unfavorite}
              />
            </TouchableOpacity>
          ) : isFavorite ? (
            <MaterialCommunityIcons
              name="star"
              size={22}
              color={COLORS.favorite}
              style={styles.starButton}
            />
          ) : null}
          {onMenuPress && showPlusIcon ? (
            isAdded ? (
              <MaterialCommunityIcons
                name="check-circle"
                size={28}
                color={COLORS.success}
              />
            ) : (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onMenuPress();
                }}
                style={styles.menuButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )
          ) : onMenuPress ? (
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
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Bottom Row: Stats Badges */}
      <View style={styles.bottomRow}>
        <StatBadge
          icon="fire"
          label="cal"
          value={meal.calories}
          unit=""
          iconColor={COLORS.calories}
          backgroundColor={COLORS.calories60}
        />
        <StatBadge
          icon="dumbbell"
          label="protein"
          value={meal.protein}
          unit="g"
          iconColor={COLORS.protein}
          backgroundColor={COLORS.protein60}
        />
        <StatBadge
          icon="bread-slice"
          label="carbs"
          value={meal.carbs}
          unit="g"
          iconColor={COLORS.carbs}
          backgroundColor={COLORS.carbs60}
        />
        <StatBadge
          icon="water-percent"
          label="fats"
          value={meal.fats}
          unit="g"
          iconColor={COLORS.fats}
          backgroundColor={COLORS.fats60}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    flexDirection: "column",
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusXL,
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    marginBottom: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.secondaryBackground,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: SPACING.small,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.small,
  },
  mealName: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    lineHeight: 22,
    letterSpacing: 0.3,
    flex: 1,
  },
  topRowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  starButton: {
    padding: SPACING.xs,
    marginRight: -4,
  },
  bottomRow: {
    flexDirection: "row",
    gap: SPACING.small,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  menuButton: {
    padding: SPACING.xs,
    marginRight: -8,
  },
});
