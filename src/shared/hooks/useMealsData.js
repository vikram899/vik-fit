/**
 * CUSTOM HOOK: useMealsData
 *
 * Manages meals data loading, filtering, sorting, and favorites.
 * Encapsulates all meals-related state and logic.
 *
 * @returns {Object} Meals data and handlers
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getAllMeals,
  deleteMeal,
  toggleMealFavorite,
} from '../../services/database';

export const useMealsData = () => {
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [filterOptions, setFilterOptions] = useState({
    starred: false,
    veg: false,
    'non-veg': false,
    egg: false,
    vegan: false,
  });

  // Load meals from database
  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      const mealsList = await getAllMeals();
      setMeals(mealsList);
    } catch (error) {
      console.error('Failed to load meals:', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and sorting
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
      filterOptions['non-veg'] ||
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
          filterOptions['non-veg'] ||
          filterOptions.egg ||
          filterOptions.vegan;

        if (mealTypeFilters) {
          const mealType = m.mealType || 'veg';
          if (!filterOptions[mealType]) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply sorting
    if (sortOption === 'name') {
      filtered.sort((a, b) => {
        if (!filterOptions.starred && (b.isFavorite || 0) !== (a.isFavorite || 0)) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        return a.name.localeCompare(b.name);
      });
    } else if (sortOption === 'calories') {
      filtered.sort((a, b) => {
        if (!filterOptions.starred && (b.isFavorite || 0) !== (a.isFavorite || 0)) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        return (b.calories || 0) - (a.calories || 0);
      });
    } else if (sortOption === 'recent') {
      filtered.sort((a, b) => {
        if (!filterOptions.starred && (b.isFavorite || 0) !== (a.isFavorite || 0)) {
          return (b.isFavorite || 0) - (a.isFavorite || 0);
        }
        return 0;
      });
    }

    setFilteredMeals(filtered);
  }, [meals, searchText, sortOption, filterOptions]);

  // Update filtered meals when filters/sort/search change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Handle meal deletion
  const handleDeleteMeal = useCallback(
    async (mealId) => {
      try {
        await deleteMeal(mealId);
        await loadMeals();
      } catch (error) {
        console.error('Failed to delete meal:', error);
        throw error;
      }
    },
    [loadMeals]
  );

  // Handle favorite toggle
  const handleFavoritePress = useCallback(
    async (mealId, isFavorite) => {
      try {
        await toggleMealFavorite(mealId, isFavorite);
        setMeals((prevMeals) =>
          prevMeals.map((meal) => {
            if (meal.id === mealId) {
              return { ...meal, isFavorite: isFavorite ? 1 : 0 };
            }
            return meal;
          })
        );
      } catch (error) {
        console.error('Failed to update favorite status:', error);
        throw error;
      }
    },
    []
  );

  // Update meals list after edit
  const updateMealsList = useCallback((updatedMeals) => {
    setMeals(updatedMeals);
  }, []);

  return {
    meals,
    filteredMeals,
    loading,
    searchText,
    setSearchText,
    sortOption,
    setSortOption,
    filterOptions,
    setFilterOptions,
    loadMeals,
    handleDeleteMeal,
    handleFavoritePress,
    updateMealsList,
  };
};
