import React from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import { formStyles } from "../styles/app.styles";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";

const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const FOOD_TYPES = ["veg", "non-veg", "vegan", "egg"];

const MealForm = ({
  form,
  onFormChange,
  mealType,
  onMealTypeChange,
  foodType,
  onFoodTypeChange,
  showLabels = true,
}) => {
  const FOOD_TYPE_LABELS = {
    veg: "Veg",
    "non-veg": "Non-Veg",
    vegan: "Vegan",
    egg: "Egg",
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: SPACING.element }}
      showsVerticalScrollIndicator={false}
    >
      {/* Meal Name */}
      <View style={formStyles.formGroup}>
        {showLabels && <Text style={formStyles.label}>Meal Name *</Text>}
        <TextInput
          style={formStyles.input}
          placeholder="Enter meal name"
          placeholderTextColor={COLORS.textSecondary}
          value={form.name}
          onChangeText={(value) => onFormChange({ ...form, name: value })}
        />
      </View>

      {/* Meal Type */}
      <View style={formStyles.formGroup}>
        {showLabels && <Text style={formStyles.label}>Meal Type *</Text>}
        <View
          style={{
            flexDirection: "row",
            gap: SPACING.xs,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {MEAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                formStyles.mealTypeButton,
                mealType === type
                  ? formStyles.mealTypeButtonActive
                  : formStyles.mealTypeButtonInactive,
              ]}
              onPress={() => onMealTypeChange(type)}
            >
              <Text
                style={[
                  formStyles.mealTypeButtonText,
                  mealType === type
                    ? formStyles.mealTypeButtonTextActive
                    : formStyles.mealTypeButtonTextInactive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Food Type (Veg/Nonveg/Vegan/Egg) */}
      <View style={formStyles.formGroup}>
        {showLabels && <Text style={formStyles.label}>Food Type *</Text>}
        <View
          style={{
            flexDirection: "row",
            gap: SPACING.xs,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {FOOD_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                formStyles.mealTypeButton,
                foodType === type
                  ? formStyles.mealTypeButtonActive
                  : formStyles.mealTypeButtonInactive,
              ]}
              onPress={() => onFoodTypeChange(type)}
            >
              <Text
                style={[
                  formStyles.mealTypeButtonText,
                  foodType === type
                    ? formStyles.mealTypeButtonTextActive
                    : formStyles.mealTypeButtonTextInactive,
                ]}
              >
                {FOOD_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Calories and Protein (mandatory) */}
      <View style={formStyles.rowGroup}>
        <View style={[formStyles.formGroup, { flex: 1 }]}>
          {showLabels && <Text style={formStyles.label}>Calories *</Text>}
          <TextInput
            style={formStyles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
            value={form.calories}
            onChangeText={(value) => onFormChange({ ...form, calories: value })}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[formStyles.formGroup, { flex: 1 }]}>
          {showLabels && <Text style={formStyles.label}>Protein (g) *</Text>}
          <TextInput
            style={formStyles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
            value={form.protein}
            onChangeText={(value) => onFormChange({ ...form, protein: value })}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Carbs and Fats (optional) */}
      <View style={formStyles.rowGroup}>
        <View style={[formStyles.formGroup, { flex: 1 }]}>
          {showLabels && <Text style={formStyles.label}>Carbs (g)</Text>}
          <TextInput
            style={formStyles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
            value={form.carbs}
            onChangeText={(value) => onFormChange({ ...form, carbs: value })}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[formStyles.formGroup, { flex: 1 }]}>
          {showLabels && <Text style={formStyles.label}>Fats (g)</Text>}
          <TextInput
            style={formStyles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
            value={form.fats}
            onChangeText={(value) => onFormChange({ ...form, fats: value })}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {showLabels && (
        <Text style={formStyles.helperText}>
          * Required fields
        </Text>
      )}
    </ScrollView>
  );
};

export default MealForm;
