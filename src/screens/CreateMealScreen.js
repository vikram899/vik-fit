import React from "react";
import { View, ScrollView } from "react-native";
import { useMealCreation } from "../shared/hooks";
import { BottomSheet } from "../shared/components/ui";
import CreateMealHeader from "../components/CreateMealHeader";
import CreateMealButtons from "../components/CreateMealButtons";
import MealForm from "../components/MealForm";
import { SPACING } from "../shared/constants";

/**
 * CreateMealScreen
 * Screen for creating and logging new meals
 *
 * Uses generic BottomSheet wrapper with modular components:
 * - BottomSheet: Animated bottom sheet container (shared)
 * - CreateMealHeader: Header with title and close button
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
    <BottomSheet
      visible={true}
      title="Add New Meal"
      onClose={handleClose}
      heightPercent={0.9}
      hasFixedFooter={true}
    >
      {/* Scrollable Form Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.element }}
        showsVerticalScrollIndicator={false}
      >
        <MealForm
          form={form}
          onFormChange={setForm}
          mealType={mealType}
          onMealTypeChange={setMealType}
          foodType={foodType}
          onFoodTypeChange={setFoodType}
        />
      </ScrollView>

      {/* Fixed Footer with Buttons */}
      <View style={{ paddingHorizontal: SPACING.element, paddingVertical: SPACING.element }}>
        <CreateMealButtons
          onAdd={handleAddMeal}
          onCancel={handleClose}
          isLoading={isLoading}
        />
      </View>
    </BottomSheet>
  );
};

export default CreateMealScreen;
