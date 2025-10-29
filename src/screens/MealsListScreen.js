import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../styles";
import {
  getAllMeals,
  getDailyTotals,
  getMacroGoals,
  deleteMeal,
  toggleMealFavorite,
} from "../services/database";
import { EditMealDetailsModal } from "../components/meals";
import MealCard from "../components/MealCard";

/**
 * MealsListScreen
 * Shows all available meals with search, filter, and sort functionality
 */
export default function MealsListScreen({ navigation, route }) {
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [editMealModalVisible, setEditMealModalVisible] = useState(false);
  const [selectedMealForEdit, setSelectedMealForEdit] = useState(null);

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);

      const mealsList = await getAllMeals();
      setMeals(mealsList);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error loading meals:", error);
      Alert.alert("Error", "Failed to load meals");
    } finally {
      setLoading(false);
    }
  }, [fadeAnim]);

  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
      // Handle navigation to AddNewMeal screen
      if (route?.params?.openAddModal) {
        navigation.navigate("AddNewMeal");
        navigation.setParams({ openAddModal: false });
      }
    }, [loadMeals, route?.params?.openAddModal, navigation])
  );

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...meals];

    if (searchText.trim()) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (sortOption === "name") {
      filtered.sort((a, b) => {
        // First sort by favorite status (starred on top)
        if ((b.isFavorite || 0) !== (a.isFavorite || 0)) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        // Then sort by name
        return a.name.localeCompare(b.name);
      });
    } else if (sortOption === "calories") {
      filtered.sort((a, b) => {
        // First sort by favorite status (starred on top)
        if ((b.isFavorite || 0) !== (a.isFavorite || 0)) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        // Then sort by calories
        return (b.calories || 0) - (a.calories || 0);
      });
    } else if (sortOption === "recent") {
      filtered.sort((a, b) => {
        // First sort by favorite status (starred on top)
        if ((b.isFavorite || 0) !== (a.isFavorite || 0)) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        // Then sort by recent
        return 0; // Maintain original order for recent
      });
    }

    setFilteredMeals(filtered);
  }, [meals, searchText, sortOption]);

  React.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleEditMeal = (meal) => {
    setSelectedMealForEdit(meal);
    setEditMealModalVisible(true);
  };

  const handleMealUpdated = async (updatedMeals) => {
    setEditMealModalVisible(false);
    setSelectedMealForEdit(null);
    setMeals(updatedMeals);
    applyFiltersAndSort();
  };

  const handleDeleteMeal = (meal) => {
    Alert.alert(
      "Delete Meal",
      `Are you sure you want to delete "${meal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteMeal(meal.id);
              await loadMeals();
            } catch (error) {
              console.error("Error deleting meal:", error);
              Alert.alert("Error", "Failed to delete meal");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleMealMenu = (meal) => {
    Alert.alert("Meal Options", meal.name, [
      { text: "Edit", onPress: () => handleEditMeal(meal) },
      {
        text: "Delete",
        onPress: () => handleDeleteMeal(meal),
        style: "destructive",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleFavoritePress = async (mealId, isFavorite) => {
    try {
      console.log("Toggling favorite for meal:", mealId, "isFavorite:", isFavorite);

      // Update in database
      await toggleMealFavorite(mealId, isFavorite);

      // Update local state
      setMeals((prevMeals) => {
        const updated = prevMeals.map((meal) => {
          if (meal.id === mealId) {
            console.log("Updated meal:", meal.name, "to isFavorite:", isFavorite ? 1 : 0);
            return { ...meal, isFavorite: isFavorite ? 1 : 0 };
          }
          return meal;
        });
        return updated;
      });
    } catch (error) {
      console.error("Error toggling meal favorite:", error);
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Search Bar + Sort Control in Same Row */}
          <View style={styles.headerRow}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search meals..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  style={styles.clearButton}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Sort Control */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                Alert.alert("Sort", "Sort by:", [
                  { text: "Name (A-Z)", onPress: () => setSortOption("name") },
                  {
                    text: "Highest Calories",
                    onPress: () => setSortOption("calories"),
                  },
                  {
                    text: "Recently Created",
                    onPress: () => setSortOption("recent"),
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <MaterialCommunityIcons
                name="sort"
                size={18}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Meals List */}
          {filteredMeals.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={64}
                color="#ccc"
              />
              <Text style={styles.emptyStateTitle}>
                {meals.length === 0 ? "No Meals Created" : "No Meals Found"}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {meals.length === 0
                  ? "Create your first meal"
                  : "Try adjusting your search"}
              </Text>
              {meals.length === 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("AddNewMeal")}
                  style={styles.emptyStateButton}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                  <Text style={styles.emptyStateButtonText}>Create Meal</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredMeals.map((meal) => {
              return (
                <View key={meal.id} style={styles.mealCardWrapper}>
                  <MealCard
                    meal={meal}
                    onMenuPress={() => handleMealMenu(meal)}
                    isEditableStar={true}
                    onFavoritePress={(isFavorite) =>
                      handleFavoritePress(meal.id, isFavorite)
                    }
                  />
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>

      {/* Modals */}
      <EditMealDetailsModal
        visible={editMealModalVisible}
        meal={selectedMealForEdit}
        onClose={() => {
          setEditMealModalVisible(false);
          setSelectedMealForEdit(null);
        }}
        onMealUpdated={handleMealUpdated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#999" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  clearButton: { padding: 4 },

  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  mealCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
});
