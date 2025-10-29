import React from "react";
import { View, StyleSheet } from "react-native";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import SortButton from "./SortButton";

/**
 * SearchFilterSort Component
 * Combined component with search, filter, and sort in one line
 * filterLabels: optional object mapping filter keys to display labels
 * filterAlertTitle: optional title for the filter alert dialog
 * sortOptions: optional array of sort options [{value: "name", label: "Name (A-Z)"}, ...]
 * sortAlertTitle: optional title for the sort alert dialog
 */
export default function SearchFilterSort({
  searchText,
  onSearchChange,
  sortOption,
  onSortChange,
  filterOptions,
  onFilterChange,
  searchPlaceholder = "Search meals...",
  filterLabels = null,
  filterAlertTitle = "Filter Meals",
  sortOptions = null,
  sortAlertTitle = "Sort",
}) {
  return (
    <View style={styles.headerRow}>
      <SearchBar
        searchText={searchText}
        onSearchChange={onSearchChange}
        placeholder={searchPlaceholder}
      />
      <FilterButton
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
        filterLabels={filterLabels}
        alertTitle={filterAlertTitle}
      />
      <SortButton
        sortOption={sortOption}
        onSortChange={onSortChange}
        sortOptions={sortOptions}
        alertTitle={sortAlertTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 10,
  },
});
