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
import { COLORS } from "../../styles";

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
              color="#ccc"
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
            color="#666"
          />
          <Text style={styles.footerLabel}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color="#666"
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
    backgroundColor: "#fff",
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    alignItems: "center",
  },
  userAvatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginVertical: 4,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginLeft: 16,
  },
});
