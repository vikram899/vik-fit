import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MealProgressScreen from "./MealProgressScreen";
import WorkoutProgressScreen from "./WorkoutProgressScreen";
import { appStyles } from "../styles/app.styles";

/**
 * ProgressScreen
 * Shows workout and meal progress with tab switching
 */
export default function ProgressScreen({ navigation }) {
  const [activeTab, setActiveTab] = React.useState("workout");

  return (
    <View style={appStyles.screenContainer}>
      {/* Tab Control */}
      <View style={appStyles.progressTabsContainer}>
        <TouchableOpacity
          style={[
            appStyles.progressTab,
            activeTab === "workout" && appStyles.progressTabActive,
          ]}
          onPress={() => setActiveTab("workout")}
        >
          <Text
            style={[
              appStyles.progressTabText,
              activeTab === "workout" && appStyles.progressTabTextActive,
            ]}
          >
            Workouts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            appStyles.progressTab,
            activeTab === "meal" && appStyles.progressTabActive,
          ]}
          onPress={() => setActiveTab("meal")}
        >
          <Text
            style={[
              appStyles.progressTabText,
              activeTab === "meal" && appStyles.progressTabTextActive,
            ]}
          >
            Meals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={appStyles.progressContentContainer}>
        {activeTab === "workout" ? (
          <WorkoutProgressScreen navigation={navigation} />
        ) : (
          <MealProgressScreen navigation={navigation} />
        )}
      </View>
    </View>
  );
}
