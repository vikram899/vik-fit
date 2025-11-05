import React from "react";
import { Modal } from "react-native";
import { useMealCreation } from "../shared/hooks";
import CreateMealBottomSheet from "../components/CreateMealBottomSheet";
import CreateMealHeader from "../components/CreateMealHeader";
import CreateMealButtons from "../components/CreateMealButtons";
import MealForm from "../components/MealForm";

/**
 * CreateMealScreen
 * Screen for creating and logging new meals
 *
 * Uses modular components:
 * - CreateMealBottomSheet: Animated bottom sheet container
 * - CreateMealHeader: Header with title and close button
 * - MealForm: Form inputs for meal details
 * - CreateMealButtons: Action buttons (Add/Cancel)
 */
const CreateMealScreen = ({ navigation }) => {
  const {
    form,
    setForm,
    mealType,
    setMealType,
    foodType,
    setFoodType,
    slideAnim,
    panResponder,
    handleAddMeal,
    handleCloseBottomSheet,
    handleClose,
    isLoading,
    bottomSheetHeight,
  } = useMealCreation(navigation);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      onRequestClose={handleCloseBottomSheet}
    >
      <CreateMealBottomSheet
        slideAnim={slideAnim}
        panResponder={panResponder}
        bottomSheetHeight={bottomSheetHeight}
        onOverlayPress={handleCloseBottomSheet}
      >
        <CreateMealHeader title="Add New Meal" onClose={handleClose} />

        <MealForm
          form={form}
          onFormChange={setForm}
          mealType={mealType}
          onMealTypeChange={setMealType}
          foodType={foodType}
          onFoodTypeChange={setFoodType}
        />

        <CreateMealButtons
          onAdd={handleAddMeal}
          onCancel={handleClose}
          isLoading={isLoading}
        />
      </CreateMealBottomSheet>
    </Modal>
  );
};

export default CreateMealScreen;
