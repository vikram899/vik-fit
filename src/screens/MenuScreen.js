import React from "react";
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../styles/app.styles";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";

/**
 * MenuScreen
 * Menu page with options like profile, macro goals, settings
 */
export default function MenuScreen({ navigation }) {
  const menuItems = [
    {
      id: "profile_setup",
      label: "Profile Setup",
      icon: "account-edit",
      onPress: () => {
        navigation.navigate("ProfileSetup");
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
      },
    },
    {
      id: "about",
      label: "About",
      icon: "information",
      onPress: () => {
        // Navigate to about screen when created
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
              color={COLORS.mediumGray}
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
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
    backgroundColor: COLORS.mainBackground,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondaryBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.element,
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
  },
  chevron: {
    marginLeft: SPACING.small,
  },
});
