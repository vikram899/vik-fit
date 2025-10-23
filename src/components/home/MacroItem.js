import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../../styles/app.styles";

export default function MacroItem({
  icon,
  iconColor,
  label,
  value,
  goal,
  unit = "",
  progress,
  progressColor,
}) {
  // Allow progress to exceed 100% to show full fill when goal is exceeded
  const displayProgress = Math.min(progress, 100);

  return (
    <View style={[appStyles.summaryItem, { overflow: "visible" }]}>
      {/* Progress background - fills from left proportionally */}
      <View
        style={[
          styles.progressBackground,
          {
            width: `${displayProgress}%`,
            backgroundColor: progressColor,
          },
        ]}
      />

      {/* Content overlay */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={iconColor}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={appStyles.summaryLabel}>{label}</Text>
          <View style={appStyles.summaryValueRow}>
            <Text style={appStyles.summaryValue}>{value}</Text>
            <Text style={appStyles.summaryGoalSmall}>
              / {goal}
              {unit}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = {
  progressBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.2,
    zIndex: 0,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    zIndex: 1,
    padding: 10,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 0,
  },
};
