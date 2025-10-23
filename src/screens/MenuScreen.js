import React from "react";
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../styles/app.styles";
import { COLORS } from "../styles";

/**
 * MenuScreen
 * Menu page with options like profile, macro goals, settings
 */
export default function MenuScreen({ navigation }) {
  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: "account-circle",
      onPress: () => {
        // Navigate to profile screen when created
        console.log("Profile pressed");
      },
    },
    {
      id: "weight_tracking",
      label: "Weight Tracking",
      icon: "scale-bathroom",
      onPress: () => {
        navigation.navigate("WeightTracking");
      },
    },
    {
      id: "macro_goals",
      label: "Macro Goals",
      icon: "target",
      onPress: () => {
        navigation.navigate("MacroGoals");
      },
    },
    {
      id: "settings",
      label: "Settings",
      icon: "cog",
      onPress: () => {
        // Navigate to settings screen when created
        console.log("Settings pressed");
      },
    },
    {
      id: "about",
      label: "About",
      icon: "information",
      onPress: () => {
        // Navigate to about screen when created
        console.log("About pressed");
      },
    },
  ];

  return (
    <View style={appStyles.screenContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#ccc"
              style={styles.chevron}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  chevron: {
    marginLeft: 8,
  },
});
