import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../styles";

const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];

const SelectMealTimePopup = ({
  visible,
  mealName,
  selectedMealType = "Breakfast",
  onMealTypeChange,
  onConfirm,
  onCancel,
}) => {
  const [localSelectedMealType, setLocalSelectedMealType] =
    React.useState(selectedMealType);

  React.useEffect(() => {
    setLocalSelectedMealType(selectedMealType);
  }, [selectedMealType]);

  const handleConfirm = () => {
    onConfirm?.(localSelectedMealType);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  width: "90%",
                  marginHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#999",
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  Select Meal Time
                </Text>
                {mealName && (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#333",
                      marginBottom: 20,
                    }}
                  >
                    {mealName}
                  </Text>
                )}

                {/* Meal Type Selection */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginBottom: 24,
                    justifyContent: "space-between",
                    rowGap: 12,
                  }}
                >
                  {MEAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={{
                        width: "47%",
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor:
                          localSelectedMealType === type
                            ? COLORS.primary
                            : "#ddd",
                        backgroundColor:
                          localSelectedMealType === type
                            ? COLORS.primary
                            : "#f5f5f5",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        setLocalSelectedMealType(type);
                        onMealTypeChange?.(type);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color:
                            localSelectedMealType === type ? "#fff" : "#333",
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Buttons */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.success,
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                    }}
                    onPress={handleConfirm}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#fff"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#fff",
                      }}
                    >
                      Add
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#f5f5f5",
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleCancel}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SelectMealTimePopup;
