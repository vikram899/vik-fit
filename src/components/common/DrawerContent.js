import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * Custom Drawer Content
 * Beautiful drawer menu with smooth interactions
 */
export default function DrawerContent({ navigation }) {
  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: "home-outline",
      screen: "Home",
    },
    {
      id: "workouts",
      label: "Workouts",
      icon: "dumbbell",
      screen: "Workouts",
    },
    {
      id: "meals",
      label: "Meals",
      icon: "silverware-fork-knife",
      screen: "Meals",
    },
    {
      id: "macroGoals",
      label: "Macro Goals",
      icon: "nutrition",
      screen: "MacroGoals",
    },
    {
      id: "progress",
      label: "Progress",
      icon: "chart-line",
      screen: "Progress",
    },
  ];

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userAvatar}>
          <MaterialCommunityIcons
            name="account-circle"
            size={60}
            color={COLORS.primary}
          />
        </View>
        <Text style={styles.userName}>VikFit</Text>
        <Text style={styles.userEmail}>Fitness Tracker</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemContent}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={COLORS.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.mediumGray}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={COLORS.textSecondary}
          />
          <Text style={styles.footerLabel}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={COLORS.textSecondary}
          />
          <Text style={styles.footerLabel}>About</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
  },
  header: {
    paddingVertical: SPACING.container,
    paddingHorizontal: SPACING.element,
    backgroundColor: COLORS.secondaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
    alignItems: "center",
  },
  userAvatar: {
    marginBottom: SPACING.medium,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: SPACING.medium,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    borderRadius: SPACING.borderRadius,
    marginHorizontal: SPACING.medium,
    marginVertical: SPACING.xs,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: SPACING.element,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    marginVertical: SPACING.xs,
  },
  footerLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
    marginLeft: SPACING.element,
  },
});
