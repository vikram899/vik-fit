import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles";
import { appStyles } from "../../styles/app.styles";

export default function WorkoutCard({ workout, isCompleted, onPress }) {
  return (
    <TouchableOpacity
      style={appStyles.workoutCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={appStyles.workoutCardHeader}>
        <View style={appStyles.workoutCardIcon}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={20}
            color={COLORS.primary}
          />
        </View>
        <Text style={appStyles.workoutCardName} numberOfLines={1}>
          {workout.name}
        </Text>
      </View>

      <View
        style={[
          appStyles.workoutCardStatus,
          isCompleted && appStyles.workoutCardStatusCompleted,
        ]}
      >
        <MaterialCommunityIcons
          name={isCompleted ? "check-circle" : "clock-outline"}
          size={14}
          color={isCompleted ? "#fff" : "#666"}
        />
        <Text
          style={[
            appStyles.workoutCardStatusText,
            isCompleted && appStyles.workoutCardStatusTextCompleted,
          ]}
        >
          {isCompleted ? "Done" : "Pending"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
