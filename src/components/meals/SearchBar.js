import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        color="#999"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={searchText}
        onChangeText={onSearchChange}
        placeholderTextColor="#999"
      />
      {searchText.length > 0 && (
        <TouchableOpacity
          onPress={() => onSearchChange("")}
          style={styles.clearButton}
        >
          <MaterialCommunityIcons name="close" size={18} color="#999" />
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
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  clearButton: { padding: 4 },
});
