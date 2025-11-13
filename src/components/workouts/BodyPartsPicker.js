import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BODY_PARTS_LIST, COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * BodyPartsPicker
 * Component for selecting multiple body parts with ability to add custom values
 *
 * Props:
 * - selectedBodyParts: Array<string> - currently selected body parts
 * - onSelectionChange: function - callback when selection changes
 */
export default function BodyPartsPicker({ selectedBodyParts = [], onSelectionChange }) {
  const [searchText, setSearchText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customBodyPart, setCustomBodyPart] = useState("");

  // Filter body parts based on search text
  const filteredBodyParts = BODY_PARTS_LIST.filter((part) =>
    part.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleToggleBodyPart = (bodyPart) => {
    if (selectedBodyParts.includes(bodyPart)) {
      onSelectionChange(selectedBodyParts.filter((p) => p !== bodyPart));
    } else {
      onSelectionChange([...selectedBodyParts, bodyPart]);
    }
  };

  const handleAddCustomBodyPart = () => {
    const trimmedPart = customBodyPart.trim();
    if (trimmedPart && !selectedBodyParts.includes(trimmedPart)) {
      onSelectionChange([...selectedBodyParts, trimmedPart]);
      setCustomBodyPart("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveBodyPart = (bodyPart) => {
    onSelectionChange(selectedBodyParts.filter((p) => p !== bodyPart));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Target Body Parts</Text>

      {/* Selected Tags */}
      {selectedBodyParts.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          {selectedBodyParts.map((bodyPart, index) => (
            <TouchableOpacity
              key={index}
              style={styles.selectedTag}
              onPress={() => handleRemoveBodyPart(bodyPart)}
            >
              <Text style={styles.selectedTagText}>{bodyPart}</Text>
              <MaterialCommunityIcons
                name="close"
                size={14}
                color={COLORS.white}
                style={{ marginLeft: SPACING.xs }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={18}
          color={COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search body parts..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Body Parts List */}
      <ScrollView style={styles.bodyPartsScroll} nestedScrollEnabled>
        {filteredBodyParts.map((bodyPart, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.bodyPartItem,
              selectedBodyParts.includes(bodyPart) && styles.bodyPartItemSelected,
            ]}
            onPress={() => handleToggleBodyPart(bodyPart)}
          >
            <View style={styles.bodyPartCheckbox}>
              {selectedBodyParts.includes(bodyPart) && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={COLORS.white}
                />
              )}
            </View>
            <Text
              style={[
                styles.bodyPartText,
                selectedBodyParts.includes(bodyPart) && styles.bodyPartTextSelected,
              ]}
            >
              {bodyPart}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Add Custom Body Part */}
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setShowCustomInput(!showCustomInput)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.addCustomText}>Add Custom Body Part</Text>
        </TouchableOpacity>

        {/* Custom Input */}
        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Enter custom body part..."
              placeholderTextColor={COLORS.textSecondary}
              value={customBodyPart}
              onChangeText={setCustomBodyPart}
            />
            <TouchableOpacity
              style={[
                styles.customAddButton,
                !customBodyPart.trim() && styles.customAddButtonDisabled,
              ]}
              onPress={handleAddCustomBodyPart}
              disabled={!customBodyPart.trim()}
            >
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={customBodyPart.trim() ? COLORS.white : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.medium,
  },
  label: {
    ...TYPOGRAPHY.medium,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadiusRound,
  },
  selectedTagText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tertiaryBackground,
    borderRadius: SPACING.borderRadiusMD,
    paddingHorizontal: SPACING.small,
    marginBottom: SPACING.medium,
    height: 40,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
    padding: 0,
  },
  bodyPartsScroll: {
    maxHeight: 200,
    borderRadius: SPACING.borderRadiusMD,
    backgroundColor: COLORS.tertiaryBackground,
  },
  bodyPartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryBackground,
  },
  bodyPartItemSelected: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  bodyPartCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.small,
  },
  bodyPartText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  bodyPartTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondaryBackground,
  },
  addCustomText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING.small,
  },
  customInputContainer: {
    flexDirection: "row",
    padding: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondaryBackground,
    gap: SPACING.small,
    alignItems: "center",
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusMD,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
    height: 36,
  },
  customAddButton: {
    width: 36,
    height: 36,
    borderRadius: SPACING.borderRadiusMD,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  customAddButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
});
