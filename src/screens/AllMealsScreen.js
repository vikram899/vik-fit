import React, { useState, useCallback } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";
import {
  getAllMeals,
  deleteMeal,
  toggleMealFavorite,
} from "../services/database";
import { EditMealDetailsModal } from "../components/modals";
import { SearchFilterSort, AllMealsEmptyState } from "../components/meals";
import MealCard from "../components/MealCard";

/**
 * AllMealsScreen
 * Shows all available meals with search, filter, and sort functionality
 */
export default function AllMealsScreen({ navigation, route }) {
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [filterOptions, setFilterOptions] = useState({
    starred: false,
    veg: false,
    "non-veg": false,
    egg: false,
    vegan: false,
  });
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

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Check if any filter is active
    const hasActiveFilters =
      filterOptions.starred ||
      filterOptions.veg ||
      filterOptions["non-veg"] ||
      filterOptions.egg ||
      filterOptions.vegan;

    // Apply meal type and starred filters
    if (hasActiveFilters) {
      filtered = filtered.filter((m) => {
        if (filterOptions.starred && !m.isFavorite) {
          return false;
        }
        // If meal type filters are selected, at least one must match
        const mealTypeFilters =
          filterOptions.veg ||
          filterOptions["non-veg"] ||
          filterOptions.egg ||
          filterOptions.vegan;

        if (mealTypeFilters) {
          const mealType = m.mealType || "veg";
          if (!filterOptions[mealType]) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply sorting
    if (sortOption === "name") {
      filtered.sort((a, b) => {
        // First sort by favorite status (starred on top) - only if not filtering by starred
        if (
          !filterOptions.starred &&
          (b.isFavorite || 0) !== (a.isFavorite || 0)
        ) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        // Then sort by name
        return a.name.localeCompare(b.name);
      });
    } else if (sortOption === "calories") {
      filtered.sort((a, b) => {
        // First sort by favorite status (starred on top) - only if not filtering by starred
        if (
          !filterOptions.starred &&
          (b.isFavorite || 0) !== (a.isFavorite || 0)
        ) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        // Then sort by calories
        return (b.calories || 0) - (a.calories || 0);
      });
    } else if (sortOption === "recent") {
      filtered.sort((a, b) => {
        // First sort by favorite status (starred on top) - only if not filtering by starred
        if (
          !filterOptions.starred &&
          (b.isFavorite || 0) !== (a.isFavorite || 0)
        ) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        // Then sort by recent
        return 0; // Maintain original order for recent
      });
    }

    setFilteredMeals(filtered);
  }, [meals, searchText, sortOption, filterOptions]);

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
      // Update in database
      await toggleMealFavorite(mealId, isFavorite);

      // Update local state
      setMeals((prevMeals) => {
        const updated = prevMeals.map((meal) => {
          if (meal.id === mealId) {
            return { ...meal, isFavorite: isFavorite ? 1 : 0 };
          }
          return meal;
        });
        return updated;
      });
    } catch (error) {
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
          {/* Search, Filter, Sort Combined */}
          <SearchFilterSort
            searchText={searchText}
            onSearchChange={setSearchText}
            sortOption={sortOption}
            onSortChange={setSortOption}
            filterOptions={filterOptions}
            onFilterChange={setFilterOptions}
          />

          {/* Meals List */}
          {filteredMeals.length === 0 ? (
            <AllMealsEmptyState
              hasAnyMeals={meals.length > 0}
              onCreatePress={() => navigation.navigate("AddNewMeal")}
            />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.container,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
  },
  mealCardWrapper: {
    marginHorizontal: SPACING.element,
    marginBottom: SPACING.small,
  },
});
