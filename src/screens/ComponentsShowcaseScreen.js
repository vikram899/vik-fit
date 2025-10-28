import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { COLORS } from "../styles";
import HorizontalNumberPicker from "../components/HorizontalNumberPicker";
import MealCard from "../components/MealCard";

/**
 * ComponentsShowcaseScreen
 * Displays all reusable components in the app
 */
export default function ComponentsShowcaseScreen({ navigation }) {
  const [weight, setWeight] = useState("70.0");

  // Demo meals for MealCardItem
  const demoMeals = [
    {
      id: 1,
      name: "Grilled Chicken Salad",
      calories: 450,
      protein: 35,
      carbs: 25,
      fats: 15,
      mealType: "non-veg",
      isFavorite: false,
    },
    {
      id: 2,
      name: "Scrambled Eggs & Toast",
      calories: 320,
      protein: 18,
      carbs: 30,
      fats: 12,
      mealType: "egg",
      isFavorite: false,
    },
    {
      id: 3,
      name: "Quinoa Buddha Bowl",
      calories: 420,
      protein: 15,
      carbs: 52,
      fats: 16,
      mealType: "vegan",
      isFavorite: false,
    },
    {
      id: 4,
      name: "Paneer Tikka Masala",
      calories: 520,
      protein: 28,
      carbs: 35,
      fats: 24,
      mealType: "veg",
      isFavorite: false,
    },
    {
      id: 5,
      name: "Salmon & Brown Rice",
      calories: 580,
      protein: 48,
      carbs: 45,
      fats: 18,
      mealType: "non-veg",
      isFavorite: false,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Horizontal Number Picker Component */}
        <View style={styles.componentSection}>
          <Text style={styles.componentTitle}>Horizontal Number Picker</Text>
          <HorizontalNumberPicker
            minValue={30}
            maxValue={200}
            increment={0.5}
            currentValue={weight}
            onValueChange={setWeight}
            title="Demo Number Picker"
            icon="scale-bathroom"
            showHeader={true}
          />
        </View>

        {/* Meal Card Item Component */}
        <View style={styles.componentSection}>
          <Text style={styles.componentTitle}>Meal Card (Premium Design)</Text>
          <Text style={styles.componentDescription}>
            Color-coded meal type indicators (Veg, Non-Veg, Egg, Vegan) with complete macros (Calories, Protein, Carbs, Fats) and favorite star. Tap the star to mark as favorite.
          </Text>
          {demoMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() => console.log("Meal pressed:", meal.name)}
              onMenuPress={() => console.log("Meal menu pressed:", meal.name)}
              onFavoritePress={(isFavorite) => console.log("Favorite toggled:", meal.name, "Is Favorite:", isFavorite)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  componentsListSection: {
    marginBottom: 24,
  },
  componentCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  componentCardActive: {
    backgroundColor: "#fff",
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  componentCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  componentCardText: {
    marginLeft: 16,
    flex: 1,
  },
  componentCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  componentCardNameActive: {
    color: COLORS.primary,
  },
  componentCardDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  componentDemo: {
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  demoContainer: {
    marginBottom: 24,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  propertiesSection: {
    marginBottom: 24,
  },
  propertiesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  propertyItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  propertyType: {
    fontSize: 11,
    color: "#999",
    marginRight: 8,
  },
  propertyValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  usageSection: {
    marginBottom: 24,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 16,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#d4d4d4",
    lineHeight: 18,
  },
  featureSection: {
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    flex: 1,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  componentSection: {
    marginBottom: 24,
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  componentDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
});
