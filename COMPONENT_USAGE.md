# Search, Filter, Sort Components - Usage Guide

## Overview
These components provide reusable search, filter, and sort functionality for meals and other lists in the app.

## Components

### 1. SearchBar
Individual search input component

**Location:** `src/components/meals/SearchBar.js`

**Props:**
- `searchText` (string) - Current search text value
- `onSearchChange` (function) - Callback when search text changes
- `placeholder` (string, optional) - Input placeholder text (default: "Search meals...")

**Example Usage:**
```javascript
import { SearchBar } from '../components/meals';

const [searchText, setSearchText] = useState("");

<SearchBar
  searchText={searchText}
  onSearchChange={setSearchText}
  placeholder="Search workouts..."
/>
```

---

### 2. FilterButton
Individual filter button with multiple filter options

**Location:** `src/components/meals/FilterButton.js`

**Props:**
- `filterOptions` (object) - Filter state object with keys:
  - `starred` (boolean)
  - `veg` (boolean)
  - `non-veg` (boolean)
  - `egg` (boolean)
  - `vegan` (boolean)
- `onFilterChange` (function) - Callback when filter changes

**Example Usage:**
```javascript
import { FilterButton } from '../components/meals';

const [filterOptions, setFilterOptions] = useState({
  starred: false,
  veg: false,
  "non-veg": false,
  egg: false,
  vegan: false,
});

<FilterButton
  filterOptions={filterOptions}
  onFilterChange={setFilterOptions}
/>
```

---

### 3. SortButton
Individual sort button with three sorting options

**Location:** `src/components/meals/SortButton.js`

**Props:**
- `sortOption` (string) - Current sort option ("name", "calories", "recent")
- `onSortChange` (function) - Callback when sort option changes

**Sorting Options:**
- "name" - Alphabetical (A-Z)
- "calories" - Highest calories first
- "recent" - Recently created first

**Example Usage:**
```javascript
import { SortButton } from '../components/meals';

const [sortOption, setSortOption] = useState("name");

<SortButton
  sortOption={sortOption}
  onSortChange={setSortOption}
/>
```

---

### 4. SearchFilterSort (Combined Component)
Combined component with search, filter, and sort all in one row

**Location:** `src/components/meals/SearchFilterSort.js`

**Props:**
- `searchText` (string) - Current search text
- `onSearchChange` (function) - Callback for search text
- `sortOption` (string) - Current sort option
- `onSortChange` (function) - Callback for sort option
- `filterOptions` (object) - Filter state object
- `onFilterChange` (function) - Callback for filter changes
- `searchPlaceholder` (string, optional) - Custom search placeholder

**Example Usage:**
```javascript
import { SearchFilterSort } from '../components/meals';

const [searchText, setSearchText] = useState("");
const [sortOption, setSortOption] = useState("name");
const [filterOptions, setFilterOptions] = useState({
  starred: false,
  veg: false,
  "non-veg": false,
  egg: false,
  vegan: false,
});

<SearchFilterSort
  searchText={searchText}
  onSearchChange={setSearchText}
  sortOption={sortOption}
  onSortChange={setSortOption}
  filterOptions={filterOptions}
  onFilterChange={setFilterOptions}
  searchPlaceholder="Search meals..."
/>
```

---

## Implementation in MealsListScreen

The MealsListScreen shows a complete implementation:

```javascript
import { EditMealDetailsModal, SearchFilterSort } from "../components/meals";

export default function MealsListScreen({ navigation, route }) {
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [filterOptions, setFilterOptions] = useState({
    starred: false,
    veg: false,
    "non-veg": false,
    egg: false,
    vegan: false,
  });
  const [filteredMeals, setFilteredMeals] = useState([]);

  // Apply filters and sorting logic
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...meals];

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply meal type and starred filters
    const hasActiveFilters = Object.values(filterOptions).some((v) => v);
    if (hasActiveFilters) {
      filtered = filtered.filter((m) => {
        if (filterOptions.starred && !m.isFavorite) return false;

        const mealTypeFilters =
          filterOptions.veg ||
          filterOptions["non-veg"] ||
          filterOptions.egg ||
          filterOptions.vegan;

        if (mealTypeFilters) {
          const mealType = m.mealType || "veg";
          if (!filterOptions[mealType]) return false;
        }
        return true;
      });
    }

    // Apply sorting
    if (sortOption === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "calories") {
      filtered.sort((a, b) => (b.calories || 0) - (a.calories || 0));
    } else if (sortOption === "recent") {
      filtered.reverse();
    }

    setFilteredMeals(filtered);
  }, [meals, searchText, sortOption, filterOptions]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Use the combined component */}
        <SearchFilterSort
          searchText={searchText}
          onSearchChange={setSearchText}
          sortOption={sortOption}
          onSortChange={setSortOption}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
        />

        {/* Render filtered/sorted meals */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## How to Use in Other Screens

### Option 1: Use Combined Component (Recommended)
```javascript
import { SearchFilterSort } from '../components/meals';

// In your screen component
<SearchFilterSort
  searchText={searchText}
  onSearchChange={setSearchText}
  sortOption={sortOption}
  onSortChange={setSortOption}
  filterOptions={filterOptions}
  onFilterChange={setFilterOptions}
  searchPlaceholder="Search workouts..."
/>
```

### Option 2: Use Individual Components
```javascript
import { SearchBar, FilterButton, SortButton } from '../components/meals';

// In your screen component's render method
<View style={{ flexDirection: 'row', gap: 10 }}>
  <SearchBar
    searchText={searchText}
    onSearchChange={setSearchText}
  />
  <FilterButton
    filterOptions={filterOptions}
    onFilterChange={setFilterChange}
  />
  <SortButton
    sortOption={sortOption}
    onSortChange={setSortOption}
  />
</View>
```

---

## Filter Options Detail

The `filterOptions` object supports the following keys:

```javascript
{
  starred: boolean,      // Show only favorited items
  veg: boolean,          // Show vegetarian items
  "non-veg": boolean,    // Show non-vegetarian items
  egg: boolean,          // Show egg items
  vegan: boolean         // Show vegan items
}
```

Multiple filters can be active at the same time, and items matching ANY of the meal type filters will be shown.

---

## Integration Notes

- All components are styled consistently with the app's design
- Components use `COLORS.primary` from `src/styles` for consistency
- SearchBar automatically shows/hides a clear button
- FilterButton highlights when active (background becomes primary color)
- All components are responsive and work on different screen sizes

---

## Future Enhancements

- Keep filter dialog open while selecting multiple filters
- Add custom filter templates
- Save favorite filter combinations
- Add filter presets (e.g., "Protein-rich", "Low-carb")
