import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../styles/app.styles";
import { COLORS } from "../styles";

/**
 * AddScreen
 * Screen with options to add workouts or meals
 */
export default function AddScreen({ navigation }) {
  return (
    <View style={appStyles.screenContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>What would you like to add?</Text>

        {/* Add Workout Option */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Home", { screen: "LogWorkout" })}
          activeOpacity={0.7}
        >
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={32}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Log Workout</Text>
            <Text style={styles.optionDescription}>
              Add a new workout session
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Add Meal Option */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Meals")}
          activeOpacity={0.7}
        >
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={32}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Log Meal</Text>
            <Text style={styles.optionDescription}>Add a new meal entry</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 32,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
});
