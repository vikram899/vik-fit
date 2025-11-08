import React from "react";
import { View } from "react-native";
import { COLORS, SPACING } from "../shared/constants";
import Button from "../shared/components/ui/Button";

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
      <View style={{ flex: 1 }}>
        <Button
          label="Add"
          icon="check"
          iconPosition="left"
          variant="primary"
          size="medium"
          onPress={onAdd}
          isLoading={isLoading}
          isDisabled={isLoading}
          fullWidth
        />
      </View>

      <View style={{ flex: 1 }}>
        <Button
          label="Cancel"
          variant="cancel"
          size="medium"
          onPress={onCancel}
          isDisabled={isLoading}
          fullWidth
        />
      </View>
    </View>
  );
};

export default CreateMealButtons;
