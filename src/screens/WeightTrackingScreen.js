import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../styles";
import HorizontalNumberPicker from "../components/HorizontalNumberPicker";
import {
  addWeightEntry,
  getWeightEntryForDate,
  getAllWeightEntries,
} from "../services/database";

/**
 * WeightTrackingScreen
 * Screen for users to enter and track their weight
 */
export default function WeightTrackingScreen({ navigation }) {
  const today = new Date().toISOString().split("T")[0];

  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [todayEntry, setTodayEntry] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [weightChange, setWeightChange] = useState(null);

  // Load today's weight entry and history when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      const loadWeightData = async () => {
        try {
          // Load today's entry
          const todayData = await getWeightEntryForDate(today);
          if (todayData) {
            setTodayEntry(todayData);
            setCurrentWeight(todayData.currentWeight.toString());
            setTargetWeight(todayData.targetWeight.toString());
          } else {
            setTodayEntry(null);
            setCurrentWeight("");
            setTargetWeight("");
          }

          // Load weight history (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const startDate = thirtyDaysAgo.toISOString().split("T")[0];

          const allEntries = await getAllWeightEntries();
          const recentEntries = allEntries.filter(
            (entry) => entry.weightDate >= startDate
          );
          setWeightHistory(recentEntries);

          // Calculate weight change from first to latest entry
          if (recentEntries.length > 1) {
            const firstWeight = recentEntries[recentEntries.length - 1].currentWeight;
            const latestWeight = recentEntries[0].currentWeight;
            const change = latestWeight - firstWeight;
            setWeightChange(change);
          }
        } catch (error) {
          console.error("Error loading weight data:", error);
        }
      };

      loadWeightData();
    }, [])
  );

  const handleSaveWeight = async () => {
    if (!currentWeight || !targetWeight) {
      Alert.alert("Missing Data", "Please enter both current and target weight");
      return;
    }

    const current = parseFloat(currentWeight);
    const target = parseFloat(targetWeight);

    if (current <= 0 || target <= 0) {
      Alert.alert("Invalid Input", "Weight values must be greater than 0");
      return;
    }

    try {
      await addWeightEntry(today, current, target);
      Alert.alert("Success", "Weight entry saved successfully");

      // Reload the data
      const todayData = await getWeightEntryForDate(today);
      setTodayEntry(todayData);
    } catch (error) {
      console.error("Error saving weight entry:", error);
      Alert.alert("Error", "Failed to save weight entry");
    }
  };

  const renderWeightHistory = () => {
    if (weightHistory.length === 0) {
      return (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons
            name="scale-bathroom"
            size={48}
            color="#ccc"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyHistoryText}>
            No weight history yet. Start tracking your weight!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Weight History (Last 30 Days)</Text>
        {weightHistory.map((entry, index) => {
          const diffFromTarget = entry.currentWeight - entry.targetWeight;
          return (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.dateText}>{entry.weightDate}</Text>
              </View>
              <View style={styles.historyWeight}>
                <Text style={styles.weightText}>{entry.currentWeight} kg</Text>
                <Text style={styles.targetText}>
                  Target: {entry.targetWeight} kg
                </Text>
              </View>
              <View style={styles.historyDiff}>
                <Text
                  style={[
                    styles.diffText,
                    {
                      color:
                        diffFromTarget > 0
                          ? "#FF6B6B"
                          : diffFromTarget < 0
                          ? "#51CF66"
                          : "#666",
                    },
                  ]}
                >
                  {diffFromTarget > 0 ? "+" : ""}{diffFromTarget.toFixed(1)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Today's Weight Picker */}
        <HorizontalNumberPicker
          minValue={30}
          maxValue={200}
          increment={0.5}
          currentValue={currentWeight}
          onValueChange={setCurrentWeight}
          title="Today's Weight"
          icon="scale-bathroom"
          showHeader={true}
        />

        {/* Goal Weight Card (keep as TextInput for now) */}
        <View style={styles.halfCard}>
          <View style={styles.halfCardHeader}>
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.halfCardTitle}>Goal Weight</Text>
          </View>
          <View style={styles.weightInputField}>
            <TextInput
              style={styles.weightInput}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={targetWeight}
              onChangeText={setTargetWeight}
            />
            <Text style={styles.weightUnit}>kg</Text>
          </View>
        </View>

        {/* Difference Display */}
        {currentWeight && targetWeight && (
          <View style={styles.differenceContainer}>
            {parseFloat(currentWeight) > parseFloat(targetWeight) ? (
              <Text style={[styles.differenceValue, { color: "#333" }]}>
                Reduce{" "}
                <Text style={{ color: "#FF6B6B" }}>
                  {(parseFloat(currentWeight) - parseFloat(targetWeight)).toFixed(1)} kgs
                </Text>
              </Text>
            ) : parseFloat(currentWeight) < parseFloat(targetWeight) ? (
              <Text style={[styles.differenceValue, { color: "#333" }]}>
                Gain{" "}
                <Text style={{ color: "#51CF66" }}>
                  {(parseFloat(targetWeight) - parseFloat(currentWeight)).toFixed(1)} kgs
                </Text>
              </Text>
            ) : (
              <Text style={[styles.differenceValue, { color: "#51CF66" }]}>
                You're at your goal!
              </Text>
            )}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveWeight}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Weight Entry</Text>
        </TouchableOpacity>

        {/* Weight Change Summary */}
        {weightChange !== null && weightHistory.length > 1 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Progress</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Weight Change (30 Days)</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: weightChange > 0 ? "#FF6B6B" : "#51CF66",
                  },
                ]}
              >
                {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Latest Entry</Text>
              <Text style={styles.summaryValue}>{weightHistory[0].weightDate}</Text>
            </View>
          </View>
        )}

        {/* Weight History */}
        {renderWeightHistory()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  halfCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  halfCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  halfCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  weightInputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  weightInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  differenceContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  differenceLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  differenceValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  historyDate: {
    flex: 0.3,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  historyWeight: {
    flex: 0.45,
  },
  weightText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  targetText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  historyDiff: {
    flex: 0.25,
    alignItems: "flex-end",
  },
  diffText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyHistoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
