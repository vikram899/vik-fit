import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WeekCalendar } from "../components/layouts";
import { AssignDaysModal } from "../components/modals";
import { SearchFilterSort } from "../components/meals";
import { COLORS } from "../constants/colors";
import { SPACING } from "../constants/spacing";
import { STRINGS } from "../constants/strings";
import {
  getAllPlans,
  getExercisesByPlanId,
  getPlansForDay,
  getScheduledDaysForPlan,
  assignPlanToDays,
  markPlanCompleted,
  getPlanExecutionStatus,
  deletePlan,
} from "../services/database";

/**
 * WorkoutDayScheduleScreen
 * Display plans scheduled for each day of the week with scheduling functionality
 */
export default function WorkoutDayScheduleScreen({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [plansForDay, setPlansForDay] = useState([]);
  const [filteredPlansForDay, setFilteredPlansForDay] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [scheduledDays, setScheduledDays] = useState({});
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort state
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [filterOptions, setFilterOptions] = useState({
    starred: false,
    veg: false,
    "non-veg": false,
    egg: false,
    vegan: false,
  });

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState(null);

  // Set header options
  React.useEffect(() => {
    navigation.setOptions({
      title: "Log Workouts",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingLeft: 16 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("CreatePlan")}
          style={{
            paddingRight: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600" }}>Create</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Load plans and their schedules
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Get all plans
      const plans = await getAllPlans();
      setAllPlans(plans);

      // Get scheduled days for each plan
      const daysMap = {};
      for (const plan of plans) {
        const days = await getScheduledDaysForPlan(plan.id);
        daysMap[plan.id] = days;
      }
      setScheduledDays(daysMap);

      // Get plans for selected day
      const dayPlans = await getPlansForDay(selectedDay);
      setPlansForDay(dayPlans);
    } catch (error) {
      Alert.alert("Error", "Failed to load workout plans");
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  // Load data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [selectedDay])
  );

  // Apply search, filter, and sort to plans
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...plansForDay];

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    if (sortOption === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "calories") {
      // If workouts have difficulty/intensity, sort by that
      filtered.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
    } else if (sortOption === "recent") {
      filtered.reverse();
    }

    setFilteredPlansForDay(filtered);
  }, [plansForDay, searchText, sortOption]);

  // Reapply filters and sort whenever plansForDay or search/sort options change
  React.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const handleAssignDays = (plan) => {
    setSelectedPlanForAssign(plan);
    setAssignModalVisible(true);
  };

  const handleSaveDays = async (selectedDays) => {
    try {
      await assignPlanToDays(selectedPlanForAssign.id, selectedDays);
      setAssignModalVisible(false);
      setSelectedPlanForAssign(null);
      loadData();
      Alert.alert("Success", "Workout schedule updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to save plan schedule");
    }
  };

  const handleMarkComplete = async (plan) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await markPlanCompleted(plan.id, today);
      loadData();
      Alert.alert("Success", `${plan.name} marked as completed!`);
    } catch (error) {
      Alert.alert("Error", "Failed to mark plan as completed");
    }
  };

  const handleDeletePlan = (plan) => {
    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${plan.name}"?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePlan(plan.id);
              loadData();
              Alert.alert("Success", "Workout deleted!");
            } catch (error) {
              Alert.alert("Error", "Failed to delete plan");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handlePlanMenu = (plan) => {
    Alert.alert("Workout Options", plan.name, [
      {
        text: "Assign Days",
        onPress: () => handleAssignDays(plan),
      },
      {
        text: "Mark as Complete",
        onPress: () => handleMarkComplete(plan),
      },
      {
        text: "Delete",
        onPress: () => handleDeletePlan(plan),
        style: "destructive",
      },
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
    ]);
  };

  const getScheduledDaysDisplay = (planId) => {
    const days = scheduledDays[planId] || [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((d) => dayNames[d]).join(", ") || "No schedule";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Week Calendar */}
      <WeekCalendar
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        highlightedDays={Object.values(scheduledDays)
          .flat()
          .filter((v, i, a) => a.indexOf(v) === i)}
      />

      {/* Search, Filter, Sort */}
      <SearchFilterSort
        searchText={searchText}
        onSearchChange={setSearchText}
        sortOption={sortOption}
        onSortChange={setSortOption}
        filterOptions={filterOptions}
        onFilterChange={setFilterOptions}
        searchPlaceholder="Search workouts..."
      />

      {/* Plans for Selected Day */}
      <ScrollView
        style={styles.plansList}
        contentContainerStyle={styles.plansContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {filteredPlansForDay.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="dumbbell" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText.trim()
                ? "No workouts found"
                : "No workouts scheduled for this day"}
            </Text>
          </View>
        ) : (
          filteredPlansForDay.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planSchedule}>
                    {getScheduledDaysDisplay(plan.id)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handlePlanMenu(plan)}
                  style={styles.kebabButton}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              {plan.description && (
                <Text style={styles.planDescription}>{plan.description}</Text>
              )}

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                  navigation.navigate("ExecuteWorkout", { planId: plan.id })
                }
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.viewButtonText}>View Exercises</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Assign Days Modal */}
      <AssignDaysModal
        visible={assignModalVisible}
        planName={selectedPlanForAssign?.name || ""}
        selectedDays={scheduledDays[selectedPlanForAssign?.id] || []}
        onSave={handleSaveDays}
        onClose={() => {
          setAssignModalVisible(false);
          setSelectedPlanForAssign(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
  plansList: {
    flex: 1,
  },
  plansContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
    textAlign: "center",
  },
  planCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  planSchedule: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  kebabButton: {
    padding: 8,
    marginRight: -8,
  },
  planDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  viewButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
});
