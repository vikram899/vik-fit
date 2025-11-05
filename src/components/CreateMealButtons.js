import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { buttonStyles } from "../styles";
import { COLORS, SPACING } from "../shared/constants";

/**
 * CreateMealButtons
 * Action buttons component for create meal form (Add/Cancel)
 *
 * Props:
 * - onAdd: Callback when Add button is pressed
 * - onCancel: Callback when Cancel button is pressed
 * - isLoading: Optional boolean to disable buttons during submission
 */
const CreateMealButtons = ({ onAdd, onCancel, isLoading = false }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: SPACING.element,
        paddingBottom: SPACING.container,
        backgroundColor: COLORS.mainBackground,
        gap: SPACING.small,
        borderTopWidth: 1,
        borderTopColor: COLORS.secondaryBackground,
      }}
    >
      <TouchableOpacity
        style={[
          buttonStyles.button,
          buttonStyles.buttonHalf,
          buttonStyles.buttonPrimary,
          isLoading && { opacity: 0.6 },
        ]}
        onPress={onAdd}
        disabled={isLoading}
      >
        <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
        <Text style={buttonStyles.buttonText}>Add</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          buttonStyles.button,
          buttonStyles.buttonHalf,
          buttonStyles.cancelButton,
          isLoading && { opacity: 0.6 },
        ]}
        onPress={onCancel}
        disabled={isLoading}
      >
        <Text style={buttonStyles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateMealButtons;
