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
  const clampedProgress = Math.min(progress, 100);

  return (
    <View style={appStyles.summaryItem}>
      <View
        style={[
          styles.progressOverlay,
          {
            width: `${clampedProgress}%`,
            backgroundColor: progressColor,
          },
        ]}
      />
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
  progressOverlay: {
    position: "absolute",
    left: -10,
    top: -10,
    right: -10,
    bottom: -10,
    opacity: 0.15,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 0,
  },
};
