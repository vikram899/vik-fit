import React from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import { formStyles, COLORS } from "../styles";

const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const FOOD_TYPES = ["veg", "nonveg", "vegan", "egg"];

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
    nonveg: "Non-Veg",
    vegan: "Vegan",
    egg: "Egg",
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Meal Name */}
      <View style={formStyles.formGroup}>
        {showLabels && <Text style={formStyles.label}>Meal Name *</Text>}
        <TextInput
          style={formStyles.input}
          placeholder="Enter meal name"
          placeholderTextColor="#999"
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
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {MEAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={{
                width: "48%",
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 2,
                borderColor:
                  mealType === type ? COLORS.primary : COLORS.mediumGray,
                backgroundColor:
                  mealType === type ? COLORS.primary : COLORS.lightGray,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
              onPress={() => onMealTypeChange(type)}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: mealType === type ? COLORS.white : COLORS.textPrimary,
                }}
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
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {FOOD_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={{
                width: "48%",
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 2,
                borderColor:
                  foodType === type ? COLORS.primary : COLORS.mediumGray,
                backgroundColor:
                  foodType === type ? COLORS.primary : COLORS.lightGray,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
              onPress={() => onFoodTypeChange(type)}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: foodType === type ? COLORS.white : COLORS.textPrimary,
                }}
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
            placeholderTextColor="#999"
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
            placeholderTextColor="#999"
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
            placeholderTextColor="#999"
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
            placeholderTextColor="#999"
            value={form.fats}
            onChangeText={(value) => onFormChange({ ...form, fats: value })}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {showLabels && (
        <Text style={{ fontSize: 12, color: "#999", marginTop: 12 }}>
          * Required fields
        </Text>
      )}
    </ScrollView>
  );
};

export default MealForm;
