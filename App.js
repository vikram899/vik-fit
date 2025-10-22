import React, { useEffect } from "react";
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "./src/components/Toast";
import ExerciseCard from "./src/components/ExerciseCard";
import ProgressBadges from "./src/components/ProgressBadges";
import {
  initializeDatabase,
  seedDummyData,
  getAllPlans,
  getExerciseCount,
  getExercisesByPlanId,
  deletePlan,
  addPlan,
  addExercise,
  deleteExercise,
  updateExercise,
  addMeal,
  getAllMeals,
  searchMeals,
  logMeal,
  getMealLogsForDate,
  getDailyTotals,
  updateMealLog,
  deleteMealLog,
  getMacroGoals,
  setMacroGoals,
  updateMeal,
} from "./src/services/database";
import MealCard from "./src/components/MealCard";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Screen Components
function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().split("T")[0];

  const [dailyTotals, setDailyTotals] = React.useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [macroGoals, setMacroGoalsState] = React.useState(null);

  // Load today's meal data
  React.useEffect(() => {
    const loadTodayData = async () => {
      try {
        const totals = await getDailyTotals(today);
        setDailyTotals(totals);

        const goals = await getMacroGoals(today);
        setMacroGoalsState(goals);
      } catch (error) {
        console.error("Error loading today's data:", error);
      }
    };

    loadTodayData();
  }, []);

  // Reload data when screen is focused
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const totals = await getDailyTotals(today);
        setDailyTotals(totals);

        const goals = await getMacroGoals(today);
        setMacroGoalsState(goals);
      } catch (error) {
        console.error("Error loading today's data:", error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View
      style={[
        styles.screenContainer,
        { justifyContent: "flex-start", paddingTop: 0 },
      ]}
    >
      <View style={[styles.headerWithButton, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Welcome to VikFit</Text>
      </View>

      {/* Today's Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Summary</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={24}
              color="#007AFF"
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.summaryLabel}>Calories</Text>
              <Text style={styles.summaryValue}>
                {Math.round(dailyTotals.totalCalories)}
              </Text>
              {macroGoals && (
                <Text style={styles.summaryGoal}>
                  Goal: {macroGoals.calorieGoal}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="flash" size={24} color="#FF9800" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.summaryLabel}>Protein</Text>
              <Text style={styles.summaryValue}>
                {Math.round(dailyTotals.totalProtein)}g
              </Text>
              {macroGoals && (
                <Text style={styles.summaryGoal}>
                  Goal: {macroGoals.proteinGoal}g
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Progress Bars */}
        {macroGoals && (
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Protein Progress</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(
                        (dailyTotals.totalProtein / macroGoals.proteinGoal) *
                          100,
                        100
                      )}%`,
                      backgroundColor: "#FF9800",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(
                  (dailyTotals.totalProtein / macroGoals.proteinGoal) * 100
                )}
                %
              </Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Calorie Progress</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(
                        (dailyTotals.totalCalories / macroGoals.calorieGoal) *
                          100,
                        100
                      )}%`,
                      backgroundColor: "#007AFF",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(
                  (dailyTotals.totalCalories / macroGoals.calorieGoal) * 100
                )}
                %
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("LogWorkout")}
        >
          <MaterialCommunityIcons name="dumbbell" size={24} color="#fff" />
          <Text style={styles.buttonText}>Log Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("LogMeals")}
        >
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={24}
            color="#fff"
          />
          <Text style={styles.buttonText}>Log Meals</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LogWorkoutScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch plans from database
  const loadPlans = async () => {
    try {
      setLoading(true);
      const allPlans = await getAllPlans();

      // Get exercise count for each plan
      const plansWithCount = await Promise.all(
        allPlans.map(async (plan) => {
          const exerciseCount = await getExerciseCount(plan.id);
          return {
            ...plan,
            exercises: exerciseCount,
          };
        })
      );

      setPlans(plansWithCount);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load plans when component mounts or when returning from other screens
  React.useEffect(() => {
    loadPlans();
  }, []);

  // Refresh plans when screen is focused
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadPlans();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View
      style={[
        styles.screenContainer,
        { justifyContent: "flex-start", paddingTop: 0 },
      ]}
    >
      <View style={[styles.headerWithButton, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Your Plans</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreatePlan")}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.plansList}>
        {loading ? (
          <Text style={styles.loadingText}>Loading plans...</Text>
        ) : plans.length === 0 ? (
          <Text style={styles.emptyText}>
            No plans yet. Create one to get started!
          </Text>
        ) : (
          plans.map((plan) => (
            <View key={plan.id} style={styles.planCardWrapper}>
              <TouchableOpacity
                style={styles.planCard}
                onPress={() =>
                  navigation.navigate("ExecuteWorkout", {
                    planId: plan.id,
                    planName: plan.name,
                  })
                }
              >
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planExercises}>
                    {plan.exercises} exercises
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function CreatePlanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [planName, setPlanName] = React.useState("");
  const [exercises, setExercises] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState("info");

  // Modal state
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalExercise, setModalExercise] = React.useState({
    name: "",
    sets: "3",
    reps: "10",
    weight: "",
    time: "",
  });

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const openAddExerciseModal = () => {
    if (!planName.trim()) {
      showToast("Please enter a plan name first", "warning");
      return;
    }
    setModalExercise({ name: "", sets: "3", reps: "10", weight: "", time: "" });
    setModalVisible(true);
  };

  const addExerciseFromModal = () => {
    if (!modalExercise.name.trim()) {
      showToast("Please enter an exercise name", "warning");
      return;
    }

    const newExerciseId = Date.now();
    setExercises([
      ...exercises,
      {
        id: newExerciseId,
        name: modalExercise.name.trim(),
        sets: modalExercise.sets,
        reps: modalExercise.reps,
        weight: modalExercise.weight,
        time: modalExercise.time,
      },
    ]);
    setModalVisible(false);
    showToast("Exercise added!", "success");
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalExercise({ name: "", sets: "3", reps: "10", weight: "", time: "" });
  };

  const updateExercise = (id, field, value) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      showToast("Please enter a plan name", "error");
      return;
    }

    try {
      setLoading(true);
      const planId = await addPlan(planName.trim(), "");

      // Add all exercises to the plan
      for (const exercise of exercises) {
        if (exercise.name.trim()) {
          await addExercise(
            planId,
            exercise.name.trim(),
            parseInt(exercise.sets) || 3,
            parseInt(exercise.reps) || 10,
            parseFloat(exercise.weight) || 0,
            parseInt(exercise.time) || 0,
            ""
          );
        }
      }

      showToast("Plan created successfully!", "success");
      setTimeout(() => {
        setPlanName("");
        setExercises([]);
        navigation.goBack();
      }, 1500);
    } catch (error) {
      showToast("Failed to create plan", "error");
      console.error("Error creating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={[
          styles.screenContainer,
          { justifyContent: "flex-start", paddingTop: 0, paddingBottom: 0 },
        ]}
      >
        <ScrollView
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Plan Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Upper Body, Lower Body"
              placeholderTextColor="#999"
              value={planName}
              onChangeText={setPlanName}
              editable={!loading}
            />
          </View>

          <View style={styles.exercisesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <TouchableOpacity
                onPress={openAddExerciseModal}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={24}
                  color={loading ? "#ccc" : "#007AFF"}
                />
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <Text style={styles.emptyExercisesText}>
                No exercises yet. Tap + to add one.
              </Text>
            ) : (
              exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onDelete={() => removeExercise(exercise.id)}
                  showDeleteButton={true}
                  disabled={loading}
                />
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonGroupFixed}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonHalf,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleCreatePlan}
            disabled={loading}
          >
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {loading ? "Creating..." : "Create Plan"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonHalf, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Exercise</Text>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Exercise Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., Bench Press"
                        placeholderTextColor="#999"
                        value={modalExercise.name}
                        onChangeText={(value) =>
                          setModalExercise({ ...modalExercise, name: value })
                        }
                      />
                    </View>

                    <View style={styles.rowGroup}>
                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Sets</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="3"
                          placeholderTextColor="#999"
                          value={modalExercise.sets}
                          onChangeText={(value) =>
                            setModalExercise({ ...modalExercise, sets: value })
                          }
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Reps</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="10"
                          placeholderTextColor="#999"
                          value={modalExercise.reps}
                          onChangeText={(value) =>
                            setModalExercise({ ...modalExercise, reps: value })
                          }
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Weight</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="0"
                          placeholderTextColor="#999"
                          value={modalExercise.weight}
                          onChangeText={(value) =>
                            setModalExercise({
                              ...modalExercise,
                              weight: value,
                            })
                          }
                          keyboardType="decimal-pad"
                        />
                      </View>

                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Time (s)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="0"
                          placeholderTextColor="#999"
                          value={modalExercise.time}
                          onChangeText={(value) =>
                            setModalExercise({
                              ...modalExercise,
                              time: value,
                            })
                          }
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <View style={styles.modalButtonGroup}>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonHalf]}
                        onPress={addExerciseFromModal}
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.buttonText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.buttonHalf,
                          styles.cancelButton,
                        ]}
                        onPress={closeModal}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

function ExecuteWorkoutScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { planId, planName } = route.params;
  const [exercises, setExercises] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingExerciseId, setEditingExerciseId] = React.useState(null);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = React.useState(null);
  const [editExercise, setEditExercise] = React.useState({
    name: "",
    sets: "3",
    reps: "10",
    weight: "",
    time: "",
  });

  // Load exercises for this plan
  React.useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        const planExercises = await getExercisesByPlanId(planId);
        setExercises(planExercises);
      } catch (error) {
        console.error("Error loading exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [planId]);

  // Handle open kebab menu
  const openKebabMenu = () => {
    setMenuVisible(true);
  };

  // Handle enable edit mode
  const handleEnableEditMode = () => {
    setMenuVisible(false);
    setIsEditMode(true);
  };

  // Handle disable edit mode
  const handleDisableEditMode = () => {
    setIsEditMode(false);
  };

  // Handle delete plan
  const handleDeletePlan = () => {
    Alert.alert(
      "Delete Plan",
      `Are you sure you want to delete "${planName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePlan(planId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete plan");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle delete exercise
  const handleDeleteExercise = (exerciseId, exerciseName) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteExercise(exerciseId);
              setExercises(exercises.filter((ex) => ex.id !== exerciseId));
            } catch (error) {
              Alert.alert("Error", "Failed to delete exercise");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle edit exercise
  const handleEditExercise = (exercise) => {
    setEditingExerciseId(exercise.id);
    setEditExercise({
      name: exercise.name,
      sets: exercise.sets.toString(),
      reps: exercise.reps.toString(),
      weight: exercise.weight.toString(),
      time: exercise.time ? exercise.time.toString() : "",
    });
    setEditModalVisible(true);
  };

  // Save edited exercise
  const saveEditedExercise = async () => {
    if (!editExercise.name.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    try {
      await updateExercise(
        editingExerciseId,
        editExercise.name.trim(),
        parseInt(editExercise.sets) || 3,
        parseInt(editExercise.reps) || 10,
        parseFloat(editExercise.weight) || 0,
        parseInt(editExercise.time) || 0,
        ""
      );

      const updatedExercises = exercises.map((ex) =>
        ex.id === editingExerciseId
          ? {
              ...ex,
              name: editExercise.name.trim(),
              sets: parseInt(editExercise.sets) || 3,
              reps: parseInt(editExercise.reps) || 10,
              weight: parseFloat(editExercise.weight) || 0,
              time: parseInt(editExercise.time) || 0,
            }
          : ex
      );
      setExercises(updatedExercises);
      setEditModalVisible(false);
      setEditingExerciseId(null);
    } catch (error) {
      Alert.alert("Error", "Failed to update exercise");
    }
  };

  return (
    <View
      style={[
        styles.screenContainer,
        { justifyContent: "flex-start", paddingTop: 0, paddingBottom: 0 },
      ]}
    >
      <View style={styles.compactHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.compactTitle}>{planName}</Text>
          <Text style={styles.compactSubtitle}>
            {exercises.length} exercises
          </Text>
        </View>
        {isEditMode && (
          <TouchableOpacity
            onPress={handleDisableEditMode}
            style={styles.kebabButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
        {!isEditMode && (
          <TouchableOpacity onPress={openKebabMenu} style={styles.kebabButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.plansList}
        contentContainerStyle={styles.plansListContent}
        showsVerticalScrollIndicator={true}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading exercises...</Text>
        ) : exercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises in this plan</Text>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              showDeleteButton={isEditMode}
              showEditButton={isEditMode}
              onDelete={() => handleDeleteExercise(exercise.id, exercise.name)}
              onEdit={() => handleEditExercise(exercise)}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Options</Text>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleEnableEditMode}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.menuItemText}>Edit Exercises</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    handleDeletePlan();
                  }}
                >
                  <MaterialCommunityIcons
                    name="trash-can"
                    size={20}
                    color="#FF3B30"
                  />
                  <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>
                    Delete Plan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemLast]}
                  onPress={() => setMenuVisible(false)}
                >
                  <Text style={[styles.menuItemText, { color: "#666" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Exercise</Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Exercise Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Bench Press"
                      placeholderTextColor="#999"
                      value={editExercise.name}
                      onChangeText={(value) =>
                        setEditExercise({ ...editExercise, name: value })
                      }
                    />
                  </View>

                  <View style={styles.rowGroup}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Sets</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="3"
                        placeholderTextColor="#999"
                        value={editExercise.sets}
                        onChangeText={(value) =>
                          setEditExercise({ ...editExercise, sets: value })
                        }
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Reps</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="10"
                        placeholderTextColor="#999"
                        value={editExercise.reps}
                        onChangeText={(value) =>
                          setEditExercise({ ...editExercise, reps: value })
                        }
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Weight</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor="#999"
                        value={editExercise.weight}
                        onChangeText={(value) =>
                          setEditExercise({ ...editExercise, weight: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Time (s)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor="#999"
                        value={editExercise.time}
                        onChangeText={(value) =>
                          setEditExercise({ ...editExercise, time: value })
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.modalButtonGroup}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonHalf]}
                      onPress={saveEditedExercise}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.buttonHalf,
                        styles.cancelButton,
                      ]}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function LogMealsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().split("T")[0];

  const [addMealModalVisible, setAddMealModalVisible] = React.useState(false);
  const [addExistingMealModalVisible, setAddExistingMealModalVisible] = React.useState(false);
  const [existingMealEditMode, setExistingMealEditMode] = React.useState(false);
  const [editingMealId, setEditingMealId] = React.useState(null);
  const [mealForm, setMealForm] = React.useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [existingMeals, setExistingMeals] = React.useState([]);
  const [todaysMeals, setTodaysMeals] = React.useState([]);
  const [dailyTotals, setDailyTotals] = React.useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });

  // Fetch today's meals and totals when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchTodaysMeals = async () => {
        try {
          const meals = await getMealLogsForDate(today);
          console.log("Fetched meals:", meals);
          setTodaysMeals(meals || []);

          const totals = await getDailyTotals(today);
          console.log("Fetched totals:", totals);
          setDailyTotals(totals);
        } catch (error) {
          console.error("Error fetching meals:", error);
        }
      };

      fetchTodaysMeals();
    }, [today])
  );

  const handleAddMeal = async () => {
    if (!mealForm.name.trim()) {
      Alert.alert("Error", "Please enter meal name");
      return;
    }

    if (!mealForm.calories.trim()) {
      Alert.alert("Error", "Calories is mandatory");
      return;
    }

    if (!mealForm.protein.trim()) {
      Alert.alert("Error", "Protein is mandatory");
      return;
    }

    try {
      const mealName = mealForm.name.trim();

      // Add meal to existing meals table
      const mealId = await addMeal(
        mealName,
        "General",
        parseFloat(mealForm.calories) || 0,
        parseFloat(mealForm.protein) || 0,
        parseFloat(mealForm.carbs) || 0,
        parseFloat(mealForm.fats) || 0
      );

      // Log it to today's meals
      await logMeal(
        mealId,
        today,
        parseFloat(mealForm.calories) || 0,
        parseFloat(mealForm.protein) || 0,
        parseFloat(mealForm.carbs) || 0,
        parseFloat(mealForm.fats) || 0
      );

      // Reset form and close modal
      setMealForm({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      });
      setAddMealModalVisible(false);

      // Refresh meals list
      const meals = await getMealLogsForDate(today);
      console.log("Meals after adding:", meals);
      setTodaysMeals(meals || []);

      const totals = await getDailyTotals(today);
      console.log("Totals after adding:", totals);
      setDailyTotals(totals);

      Alert.alert("Success", `${mealName} added successfully!`);
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert("Error", "Failed to add meal");
    }
  };

  return (
    <View
      style={[
        styles.screenContainer,
        {
          justifyContent: "flex-start",
          paddingTop: 0,
          flex: 1,
          paddingHorizontal: 0,
          alignItems: "stretch",
        },
      ]}
    >
      {/* Date Header - Minimal */}
      <View
        style={{
          paddingHorizontal: 16,

          paddingBottom: 8,
        }}
      >
        <Text style={styles.dateHeader}>{today}</Text>
      </View>

      {/* Macro Cards Grid - 2x2 - Fixed */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={styles.macroGridContainer}>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Calories</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={styles.macroValue}>
                {Math.round(dailyTotals.totalCalories)}
              </Text>
              <Text style={styles.macroGoal}> / 2500</Text>
            </View>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Protein</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={styles.macroValue}>
                {Math.round(dailyTotals.totalProtein)}g
              </Text>
              <Text style={styles.macroGoal}> / 150g</Text>
            </View>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={styles.macroValue}>
                {Math.round(dailyTotals.totalCarbs)}g
              </Text>
              <Text style={styles.macroGoal}> / 300g</Text>
            </View>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Fats</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={styles.macroValue}>
                {Math.round(dailyTotals.totalFats)}g
              </Text>
              <Text style={styles.macroGoal}> / 85g</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Today's Meals Title - Fixed */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#000" }}>
          Today's Meals
        </Text>
      </View>

      {/* Scrollable Meals List */}
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {todaysMeals.map((meal) => (
          <View
            key={meal.id}
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              marginBottom: 12,
              marginHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
              {meal.name}
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
              {Math.round(meal.calories)} cal • {Math.round(meal.protein)}g
              protein
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Meal Buttons - Fixed at Bottom */}
      <View style={{ padding: 16, backgroundColor: "#fff", gap: 12 }}>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => setAddMealModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add New Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#34C759" }]}
          onPress={async () => {
            const meals = await getAllMeals();
            setExistingMeals(meals);
            setAddExistingMealModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="check" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Existing Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Add Meal Modal */}
      <Modal
        visible={addMealModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddMealModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback
            onPress={() => setAddMealModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add New Meal</Text>

                  {/* Meal Name */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Meal Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Chicken Curry"
                      placeholderTextColor="#999"
                      value={mealForm.name}
                      onChangeText={(value) =>
                        setMealForm({ ...mealForm, name: value })
                      }
                    />
                  </View>

                  {/* Calories and Protein (mandatory) */}
                  <View style={styles.rowGroup}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Calories * </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., 350"
                        placeholderTextColor="#999"
                        value={mealForm.calories}
                        onChangeText={(value) =>
                          setMealForm({ ...mealForm, calories: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Protein (g) *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., 35"
                        placeholderTextColor="#999"
                        value={mealForm.protein}
                        onChangeText={(value) =>
                          setMealForm({ ...mealForm, protein: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  {/* Carbs and Fats (optional) */}
                  <View style={styles.rowGroup}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Carbs (g)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., 25"
                        placeholderTextColor="#999"
                        value={mealForm.carbs}
                        onChangeText={(value) =>
                          setMealForm({ ...mealForm, carbs: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Fats (g)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., 12"
                        placeholderTextColor="#999"
                        value={mealForm.fats}
                        onChangeText={(value) =>
                          setMealForm({ ...mealForm, fats: value })
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalButtonGroup}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonHalf]}
                      onPress={handleAddMeal}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.buttonHalf,
                        styles.cancelButton,
                      ]}
                      onPress={() => setAddMealModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Existing Meal Modal */}
      <Modal
        visible={addExistingMealModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddExistingMealModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={() => setAddExistingMealModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <Text style={styles.modalTitle}>Add Existing Meal</Text>
                    <TouchableOpacity
                      onPress={() => setExistingMealEditMode(!existingMealEditMode)}
                      style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                    >
                      <MaterialCommunityIcons
                        name={existingMealEditMode ? "check" : "pencil"}
                        size={24}
                        color={existingMealEditMode ? "#34C759" : "#007AFF"}
                      />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 400, marginBottom: 20 }}>
                    {existingMeals.length === 0 ? (
                      <Text style={{ textAlign: "center", color: "#999", marginVertical: 20 }}>
                        No existing meals found
                      </Text>
                    ) : (
                      existingMeals.map((meal) => (
                        <View key={meal.id} style={{ borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}>
                          {existingMealEditMode && editingMealId === meal.id ? (
                            <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                              <TextInput
                                style={[styles.input, { marginBottom: 10 }]}
                                placeholder="Meal Name"
                                value={mealForm.name}
                                onChangeText={(value) => setMealForm({ ...mealForm, name: value })}
                              />
                              <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                                <TextInput
                                  style={[styles.input, { flex: 1 }]}
                                  placeholder="Calories"
                                  value={mealForm.calories}
                                  onChangeText={(value) => setMealForm({ ...mealForm, calories: value })}
                                  keyboardType="decimal-pad"
                                />
                                <TextInput
                                  style={[styles.input, { flex: 1 }]}
                                  placeholder="Protein (g)"
                                  value={mealForm.protein}
                                  onChangeText={(value) => setMealForm({ ...mealForm, protein: value })}
                                  keyboardType="decimal-pad"
                                />
                              </View>
                              <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                                <TextInput
                                  style={[styles.input, { flex: 1 }]}
                                  placeholder="Carbs (g)"
                                  value={mealForm.carbs}
                                  onChangeText={(value) => setMealForm({ ...mealForm, carbs: value })}
                                  keyboardType="decimal-pad"
                                />
                                <TextInput
                                  style={[styles.input, { flex: 1 }]}
                                  placeholder="Fats (g)"
                                  value={mealForm.fats}
                                  onChangeText={(value) => setMealForm({ ...mealForm, fats: value })}
                                  keyboardType="decimal-pad"
                                />
                              </View>
                              <View style={{ flexDirection: "row", gap: 10 }}>
                                <TouchableOpacity
                                  style={[styles.button, { flex: 1 }]}
                                  onPress={async () => {
                                    await updateMeal(
                                      meal.id,
                                      mealForm.name || meal.name,
                                      "General",
                                      parseFloat(mealForm.calories) || meal.calories,
                                      parseFloat(mealForm.protein) || meal.protein,
                                      parseFloat(mealForm.carbs) || meal.carbs,
                                      parseFloat(mealForm.fats) || meal.fats
                                    );
                                    const meals = await getAllMeals();
                                    setExistingMeals(meals);
                                    setEditingMealId(null);
                                    setMealForm({ name: "", calories: "", protein: "", carbs: "", fats: "" });
                                    Alert.alert("Success", "Meal updated!");
                                  }}
                                >
                                  <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.button, styles.cancelButton, { flex: 1 }]}
                                  onPress={() => {
                                    setEditingMealId(null);
                                    setMealForm({ name: "", calories: "", protein: "", carbs: "", fats: "" });
                                  }}
                                >
                                  <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => {
                                if (existingMealEditMode) {
                                  setEditingMealId(meal.id);
                                  setMealForm({
                                    name: meal.name,
                                    calories: meal.calories.toString(),
                                    protein: meal.protein.toString(),
                                    carbs: meal.carbs.toString(),
                                    fats: meal.fats.toString(),
                                  });
                                } else {
                                  logMeal(
                                    meal.id,
                                    today,
                                    meal.calories || 0,
                                    meal.protein || 0,
                                    meal.carbs || 0,
                                    meal.fats || 0
                                  ).then(async () => {
                                    const meals = await getMealLogsForDate(today);
                                    setTodaysMeals(meals || []);

                                    const totals = await getDailyTotals(today);
                                    setDailyTotals(totals);

                                    Alert.alert("Success", `${meal.name} added to today's meals!`);
                                  });
                                }
                              }}
                              style={{ paddingVertical: 12, paddingHorizontal: 16 }}
                            >
                              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 4 }}>
                                    {meal.name}
                                  </Text>
                                  <Text style={{ fontSize: 13, color: "#666" }}>
                                    {Math.round(meal.calories)} cal • {Math.round(meal.protein)}g protein
                                  </Text>
                                </View>
                                <MaterialCommunityIcons
                                  name={existingMealEditMode ? "pencil" : "plus"}
                                  size={24}
                                  color={existingMealEditMode ? "#007AFF" : "#34C759"}
                                  style={{ marginLeft: 12 }}
                                />
                              </View>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    )}
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setAddExistingMealModalVisible(false);
                      setExistingMealEditMode(false);
                      setEditingMealId(null);
                      setMealForm({ name: "", calories: "", protein: "", carbs: "", fats: "" });
                    }}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: "#007AFF",
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LogWorkout"
        component={LogWorkoutScreen}
        options={{ title: "Log Workout", headerShown: false }}
      />
      <Stack.Screen
        name="CreatePlan"
        component={CreatePlanScreen}
        options={{ title: "Create Plan" }}
      />
      <Stack.Screen
        name="ExecuteWorkout"
        component={ExecuteWorkoutScreen}
        options={{ title: "Execute Workout" }}
      />
      <Stack.Screen
        name="LogMeals"
        component={LogMealsScreen}
        options={{ title: "Log Meals" }}
      />
    </Stack.Navigator>
  );
}

function WorkoutsScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Workouts</Text>
      <Text style={styles.subtitle}>Manage your workouts here</Text>
    </View>
  );
}

function MealsScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Meals</Text>
      <Text style={styles.subtitle}>Track your meals here</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your profile information</Text>
    </View>
  );
}

/**
 * App
 * Main entry point with Bottom Tab Navigation
 */
export default function App() {
  // Initialize database on app start
  React.useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      await seedDummyData();
    };
    initDB();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Workouts") {
                iconName = focused ? "dumbbell" : "dumbbell";
              } else if (route.name === "Meals") {
                iconName = focused
                  ? "silverware-fork-knife"
                  : "silverware-fork-knife";
              } else if (route.name === "Profile") {
                iconName = focused ? "account" : "account-outline";
              }
              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            },
            tabBarActiveTintColor: "#007AFF",
            tabBarInactiveTintColor: "#999",
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
            },
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#fff",
              borderTopColor: "#f0f0f0",
              borderTopWidth: 1,
              paddingBottom: 20,
              paddingTop: 8,
              height: 80,
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStackNavigator}
            options={{ tabBarLabel: "Home" }}
          />
          <Tab.Screen
            name="Workouts"
            component={WorkoutsScreen}
            options={{ tabBarLabel: "Workouts" }}
          />
          <Tab.Screen
            name="Meals"
            component={MealsScreen}
            options={{ tabBarLabel: "Meals" }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarLabel: "Profile" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  plansList: {
    flex: 1,
    width: "100%",
  },
  plansListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
    gap: 24,
  },
  planCardWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 8,
  },
  planCard: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  planExercises: {
    fontSize: 14,
    color: "#666",
  },
  headerWithButton: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  compactHeader: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kebabButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 0,
    paddingTop: 8,
  },
  compactSubtitle: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    marginTop: 1,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
    marginBottom: 16,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 8,
    flexGrow: 1,
  },
  createPlanContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
    gap: 24,
  },
  createPlanHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  exercisesScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    textAlignVertical: "top",
    paddingVertical: 12,
    minHeight: 100,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 30,
  },
  buttonGroupFixed: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  buttonHalf: {
    flex: 1,
  },
  buttonThird: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  exercisesSection: {
    marginTop: 0,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  emptyExercisesText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    padding: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: "100%",
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  rowGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  modalButtonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 0,
    width: "80%",
    overflow: "hidden",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  totalsCard: {
    backgroundColor: "#E8F4FF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B3D9F2",
  },
  totalsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 12,
  },
  totalsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  totalItem: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1E7F5",
  },
  totalLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  goalText: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  divider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  summaryGoal: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  progressContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 16,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  headerWithButton: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  mealsListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryPicker: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#0056D4",
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  existingMealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 12,
    flex: 1,
  },
  existingMealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  existingMealCategory: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  existingMealNutrition: {
    flexDirection: "row",
    gap: 8,
  },
  existingMealNutritionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
    backgroundColor: "#E8F4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  existingMealContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  editMealButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  editModeToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  editModeToggleButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  confirmIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  mealNameConfirm: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  confirmNutritionGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  confirmNutritionItem: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#f9f9f9",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  confirmNutritionLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  confirmNutritionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
    fontWeight: "500",
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  mealItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  mealItemMacros: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
  },
  macroGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  macroCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  macroLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 3,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 2,
  },
  macroGoal: {
    fontSize: 11,
    color: "#999",
    fontWeight: "400",
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
});
