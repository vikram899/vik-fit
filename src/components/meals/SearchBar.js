import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * SearchBar Component
 * Reusable search input with clear button
 */
export default function SearchBar({
  searchText,
  onSearchChange,
  placeholder = "Search meals...",
}) {
  return (
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={COLORS.textTertiary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={searchText}
        onChangeText={onSearchChange}
        placeholderTextColor={COLORS.textTertiary}
      />
      {searchText.length > 0 && (
        <TouchableOpacity
          onPress={() => onSearchChange("")}
          style={styles.clearButton}
        >
          <MaterialCommunityIcons
            name="close"
            size={18}
            color={COLORS.textTertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.small,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.secondaryBackground,
  },
  searchIcon: { marginRight: SPACING.xs },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.small,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  clearButton: { padding: SPACING.xs },
});
