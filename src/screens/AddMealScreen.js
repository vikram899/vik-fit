import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles';
import {
  getAllMeals,
  getDailyTotals,
  getMacroGoals,
  deleteMeal,
} from '../services/database';
import AddMealModal from '../components/AddMealModal';
import EditMealDetailsModal from '../components/EditMealDetailsModal';

/**
 * AddMealScreen
 * Shows all available meals with search, filter, and sort functionality
 */
export default function AddMealScreen({ navigation, route }) {
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [addMealModalVisible, setAddMealModalVisible] = useState(route?.params?.openAddModal || false);
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
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, [fadeAnim]);

  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
    }, [loadMeals])
  );

  // Watch for route params to open modal when plus button is pressed
  React.useEffect(() => {
    if (route?.params?.openAddModal) {
      setAddMealModalVisible(true);
      // Reset the param after opening modal
      navigation.setParams({ openAddModal: false });
    }
  }, [route?.params?.openAddModal, navigation]);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...meals];

    if (searchText.trim()) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (sortOption === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'calories') {
      filtered.sort((a, b) => (b.calories || 0) - (a.calories || 0));
    } else if (sortOption === 'recent') {
      filtered.reverse();
    }

    setFilteredMeals(filtered);
  }, [meals, searchText, sortOption]);

  React.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleLogMeal = (meal) => {
    navigation.navigate('LogMeals', { mealId: meal.id });
  };

  const handleEditMeal = (meal) => {
    setSelectedMealForEdit(meal);
    setEditMealModalVisible(true);
  };

  const handleMealAdded = async () => {
    setAddMealModalVisible(false);
    // Reload meals after a new meal is created
    await loadMeals();
  };

  const handleMealUpdated = async (updatedMeals) => {
    setEditMealModalVisible(false);
    setSelectedMealForEdit(null);
    setMeals(updatedMeals);
    applyFiltersAndSort();
  };

  const handleDeleteMeal = (meal) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${meal.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteMeal(meal.id);
              await loadMeals();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleMealMenu = (meal) => {
    Alert.alert(
      'Meal Options',
      meal.name,
      [
        {
          text: 'Edit',
          onPress: () => handleEditMeal(meal),
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteMeal(meal),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
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
                onPress={() => setSearchText('')}
                style={styles.clearButton}
              >
                <MaterialCommunityIcons name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Control */}
          <View style={styles.controlsContainer}>
            {/* Sort Dropdown */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                Alert.alert(
                  'Sort',
                  'Sort by:',
                  [
                    {
                      text: 'Name (A-Z)',
                      onPress: () => setSortOption('name'),
                    },
                    {
                      text: 'Highest Calories',
                      onPress: () => setSortOption('calories'),
                    },
                    {
                      text: 'Recently Created',
                      onPress: () => setSortOption('recent'),
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="sort" size={16} color={COLORS.primary} />
              <Text style={styles.controlButtonText}>
                {sortOption === 'name' ? 'Name' : sortOption === 'calories' ? 'Calories' : 'Recent'}
              </Text>
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
                {meals.length === 0 ? 'No Meals Created' : 'No Meals Found'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {meals.length === 0
                  ? 'Create your first meal'
                  : 'Try adjusting your search'}
              </Text>
              {meals.length === 0 && (
                <TouchableOpacity
                  onPress={() => setAddMealModalVisible(true)}
                  style={styles.emptyStateButton}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                  <Text style={styles.emptyStateButtonText}>Create Meal</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredMeals.map(meal => {
              return (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      {meal.calories && (
                        <Text style={styles.caloriesDisplay}>
                          {Math.round(meal.calories)} kcal
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleMealMenu(meal)}
                      style={styles.kebabButton}
                    >
                      <MaterialCommunityIcons
                        name="dots-vertical"
                        size={24}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Macros Display */}
                  {(meal.protein || meal.carbs || meal.fats) && (
                    <View style={styles.macrosContainer}>
                      {meal.protein && (
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>Protein</Text>
                          <Text style={styles.macroValue}>{Math.round(meal.protein)}g</Text>
                        </View>
                      )}
                      {meal.carbs && (
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>Carbs</Text>
                          <Text style={styles.macroValue}>{Math.round(meal.carbs)}g</Text>
                        </View>
                      )}
                      {meal.fats && (
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>Fats</Text>
                          <Text style={styles.macroValue}>{Math.round(meal.fats)}g</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Action Button */}
                  <TouchableOpacity
                    style={styles.logButton}
                    onPress={() => handleLogMeal(meal)}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.logButtonText}>Log Meal</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>

      {/* Add Meal Modal */}
      <AddMealModal
        visible={addMealModalVisible}
        onClose={() => setAddMealModalVisible(false)}
        onMealAdded={handleMealAdded}
      />

      {/* Edit Meal Modal */}
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
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  mealCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  caloriesDisplay: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  kebabButton: {
    padding: 8,
    marginRight: -8,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
