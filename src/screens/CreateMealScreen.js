import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useMealCreation } from "../shared/hooks";
import CreateMealButtons from "../components/CreateMealButtons";
import MealForm from "../components/MealForm";
import { COLORS, SPACING } from "../shared/constants";

/**
 * CreateMealScreen
 * Screen for creating and logging new meals as a full page
 *
 * Uses modular components:
 * - MealForm: Form inputs for meal details (scrollable)
 * - CreateMealButtons: Action buttons (fixed at bottom)
 */
const CreateMealScreen = ({ navigation }) => {
  const {
    form,
    setForm,
    mealType,
    setMealType,
    foodType,
    setFoodType,
    handleAddMeal,
    handleClose,
    isLoading,
  } = useMealCreation(navigation);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >
          {/* Meal Form */}
          <MealForm
            form={form}
            onFormChange={setForm}
            mealType={mealType}
            onMealTypeChange={setMealType}
            foodType={foodType}
            onFoodTypeChange={setFoodType}
          />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <CreateMealButtons
              onAdd={handleAddMeal}
              onCancel={handleClose}
              isLoading={isLoading}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.element,
    paddingBottom: SPACING.container,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.element,
    paddingBottom: SPACING.container,
    backgroundColor: COLORS.mainBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondaryBackground,
  },
  buttonWrapper: {
    width: "100%",
  },
});

export default CreateMealScreen;
