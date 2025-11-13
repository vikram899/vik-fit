import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
} from "react-native";
import { BlurView } from "expo-blur";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";

/**
 * GlassyTabBar
 * True glass morphism tab bar with BlurView
 * Creates a realistic frosted glass effect with blurred content behind
 */
const GlassyTabBar = ({ state, descriptors, navigation, insets }) => {
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom - 8, 4),
        },
      ]}
    >
      {/* 🔹 Blur Background */}
      <BlurView
        intensity={80}
        tint={Platform.OS === "ios" ? "default" : "light"}
        style={StyleSheet.absoluteFill}
      />

      {/* 🔹 Optional semi-transparent glass tint */}
      <View style={styles.glassOverlay} />

      {/* 🔹 Tab bar items */}
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title || route.name;
          if (options.tabBarButton) {
            return (
              <View key={route.key} style={styles.tabButton}>
                {options.tabBarButton({
                  onPress: onPress,
                  onLongPress: onLongPress,
                })}
              </View>
            );
          }
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? COLORS.primary : COLORS.textSecondary,
                  size: 24,
                })}
              {label && (
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? COLORS.primary : COLORS.textSecondary,
                    },
                  ]}
                >
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: "transparent",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // soft white tint
  },
  borderTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  tabBarContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.small,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.xs,
  },
});

export default GlassyTabBar;
