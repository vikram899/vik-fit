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
    <View
      style={[
        appStyles.summaryItem,
        { flexDirection: "column" },
      ]}
    >
      <View
        style={[
          styles.progressBar,
          {
            width: `${displayProgress}%`,
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
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 0,
  },
};
