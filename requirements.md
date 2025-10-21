claude "I'm building VikFit - a fitness tracking mobile app using React Native with Expo.

=== APP OVERVIEW ===
VikFit is a simple, modern fitness tracking app focused on EASY logging of workouts and meals. The key differentiator is minimal clicks - users should log activities in 3 taps or less.

=== CORE PHILOSOPHY ===

1. Simplicity First - No complex features, just tracking
2. Speed - Every action should be fast (< 3 taps)
3. Modern UX - Clean, minimalist, premium feel
4. Mobile-First - Designed for thumb-friendly one-handed use

=== TARGET USERS ===

- Fitness enthusiasts who want simple tracking
- People tired of complex apps like MyFitnessPal
- Beginners starting their fitness journey
- Indian audience (Hindi/English friendly)

=== TECH STACK ===

- React Native with Expo
- Supabase for backend/database
- React Navigation (bottom tabs)
- AsyncStorage for local caching
- Functional components with Hooks only
- No class components

=== DESIGN SYSTEM ===
Colors:

- Primary: #0066FF (Electric Blue)
- Secondary: #000000 (Black)
- Background: #FFFFFF (White)
- Gray: #F5F5F5 (Light Gray for cards)
- Text Primary: #000000
- Text Secondary: #666666
- Success: #00C853
- Error: #FF3B30

Typography:

- Large Titles: 32px, Bold
- Screen Titles: 24px, Bold
- Body: 16px, Regular
- Buttons: 18px, Semi-Bold
- Captions: 14px, Regular

Spacing:

- Container padding: 20px
- Element spacing: 16px
- Button height: 56px (thumb-friendly)
- Input height: 48px
- Border radius: 12px
- Card elevation: subtle shadow

Touch Targets:

- Minimum: 44x44px
- Buttons: 56px height, full width
- Icons: 24x24px minimum

=== PHASE 1: CORE FEATURES (MVP) ===

1. NAVIGATION

- Bottom tab navigation with 4 tabs
- Tab icons (use simple Ionicons or emoji)
- Tabs: Home, Workouts, Meals, Profile
- Active tab highlight in blue
- Smooth transitions

2. HOME SCREEN
   Layout:

- Header with app name "VikFit" (32px bold)
- Current date display (16px gray)
- Two large action buttons:
  - "Log Workout" (blue background, white text, 56px height)
  - "Log Meal" (blue background, white text, 56px height)
- Today's Summary Card:
  - "Today's Progress" heading
  - Workouts logged: [count]
  - Meals logged: [count]
  - Display in clean card with light gray background
- Spacing: 20px padding, 16px between elements

UX Requirements:

- Buttons should have subtle press animation (scale 0.95)
- Card should have soft shadow
- Date updates automatically
- Tapping buttons navigates to respective screens

3. WORKOUTS SCREEN
   Layout:

- Screen title "Log Workout" (24px bold)
- Form with clean spacing:

  Exercise Name Input:

  - Text input with placeholder "e.g., Bench Press"
  - 48px height, rounded corners
  - Clear icon on right (X button when filled)

  Sets Input:

  - Label "Sets"
  - Number display in center (large 24px)
  - Minus button on left (50x50px circle)
  - Plus button on right (50x50px circle)
  - Default value: 3

  Reps Input:

  - Label "Reps"
  - Same layout as Sets
  - Default value: 10

  Weight Input:

  - Label "Weight (kg)"
  - Same layout as above
  - Default value: 0
  - Allow decimal (e.g., 22.5)

- Large "Save Workout" button at bottom (blue, 56px)

UX Requirements:

- Auto-focus on exercise name when screen loads
- Plus/Minus buttons have haptic feedback (if possible)
- Numbers increment/decrement smoothly
- Can't go below 0 for any value
- After save:
  - Show success toast "Workout logged!"
  - Clear form
  - Return to Home or stay (user choice)
- Show loading state on save button
- Validate: exercise name required
- Keyboard dismisses on tapping outside

Data to Save:

- exercise_name (string)
- sets (integer)
- reps (integer)
- weight (float)
- date (auto - current date/time)
- user_id (from auth, later)

4. MEALS SCREEN
   Layout:

- Screen title "Log Meal" (24px bold)
- Form:

  Meal Name Input:

  - Placeholder "e.g., Chicken Salad"
  - 48px height

  Description Input:

  - Multiline text area
  - Placeholder "What's in this meal?"
  - 100px height minimum
  - Auto-expand

  Meal Type Picker:

  - Label "Meal Type"
  - Options: Breakfast, Lunch, Dinner, Snack
  - Show as horizontal pills/chips
  - Single select, blue when selected

  Optional: Photo

  - "Add Photo" button (outline style)
  - Shows thumbnail if added
  - Can remove photo

- "Save Meal" button at bottom (blue, 56px)

UX Requirements:

- Meal type defaults to current time appropriate (morning=breakfast)
- After save: success toast, clear form
- Photo upload optional (implement later)
- Validate: meal name required
- Loading state on save

Data to Save:

- meal_name (string)
- description (string, optional)
- meal_type (enum: breakfast/lunch/dinner/snack)
- photo_url (string, optional - later)
- date (auto)
- user_id (later)

5. PROFILE SCREEN
   Layout (Simple for now):

- Profile icon placeholder
- "Coming Soon" text
- Version number at bottom

Later features:

- User stats
- Settings
- Export data

=== CODING PATTERNS & BEST PRACTICES ===

1. FILE STRUCTURE:
   src/
   ├── screens/
   │ ├── HomeScreen.js
   │ ├── WorkoutsScreen.js
   │ ├── MealsScreen.js
   │ └── ProfileScreen.js
   ├── components/
   │ ├── Button.js (reusable button)
   │ ├── Input.js (reusable input)
   │ ├── NumberPicker.js (plus/minus component)
   │ └── Card.js (reusable card)
   ├── navigation/
   │ └── AppNavigator.js
   ├── services/
   │ └── supabase.js
   ├── hooks/
   │ ├── useWorkouts.js
   │ └── useMeals.js
   ├── constants/
   │ ├── colors.js
   │ └── spacing.js
   └── utils/
   └── helpers.js

2. COMPONENT PATTERNS:

- Always use functional components
- Use hooks: useState, useEffect, useCallback, useMemo
- Props destructuring in function parameters
- PropTypes or TypeScript for type checking (optional)
- Default export for screens, named exports for components

Example:

```javascript
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count: {count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
```

3. STYLING PATTERNS:

- Use StyleSheet.create (not inline styles)
- Create reusable style constants
- Use flexbox for layouts
- SafeAreaView for all screens
- KeyboardAvoidingView for forms
- Platform-specific styles when needed

4. STATE MANAGEMENT:

- useState for local component state
- Context API for global state (later)
- Custom hooks for data fetching
- AsyncStorage for persistence

5. DATA PATTERNS:

- Async/await for all async operations
- Try/catch for error handling
- Loading states for async operations
- Optimistic UI updates
- Cache data locally, sync with Supabase

Example:

```javascript
const saveWorkout = async (workoutData) => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from("workouts")
      .insert([workoutData]);

    if (error) throw error;

    // Show success
    Alert.alert("Success", "Workout logged!");
    // Clear form
    resetForm();
  } catch (error) {
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};
```

6. FORM PATTERNS:

- Controlled inputs (value + onChangeText)
- Form validation before submit
- Disable submit while loading
- Clear form after successful submit
- Show errors inline when possible

7. NAVIGATION PATTERNS:

- Use navigation.navigate() for switching screens
- navigation.goBack() for back action
- Pass params when needed: navigation.navigate('Screen', { id: 123 })
- Access params: route.params.id

8. ERROR HANDLING:

- Try/catch for async operations
- User-friendly error messages
- Don't crash on errors
- Log errors for debugging
- Fallback UI for failed states

9. PERFORMANCE:

- Use React.memo for expensive components
- useCallback for functions passed as props
- useMemo for expensive calculations
- FlatList for long lists (not ScrollView)
- Lazy load images

10. ACCESSIBILITY:

- accessibilityLabel for interactive elements
- accessibilityHint for complex interactions
- Minimum touch target 44x44px
- High contrast text (WCAG AA)
- Screen reader friendly

=== UX PATTERNS ===

1. LOADING STATES:

- Show loading indicator during async operations
- Disable buttons while loading
- Skeleton screens for data loading (later)
- Smooth transitions

2. FEEDBACK:

- Toast messages for success/error
- Haptic feedback on button press (Haptics.impactAsync)
- Visual feedback (button press animation)
- Progress indication for multi-step actions

3. EMPTY STATES:

- Show helpful message when no data
- Suggest action to take
- Use friendly illustration/icon

4. ERROR STATES:

- Clear error message
- Suggest how to fix
- Retry button when applicable

5. GESTURES:

- Swipe to delete (later)
- Pull to refresh (later)
- Smooth scrolling

6. ANIMATIONS:

- Subtle (100-300ms)
- Use LayoutAnimation for simple animations
- Animated API for complex animations
- No janky animations

=== SUPABASE SCHEMA ===

Table: workouts

- id (uuid, primary key)
- user_id (uuid, foreign key - later)
- exercise_name (text)
- sets (integer)
- reps (integer)
- weight (numeric)
- created_at (timestamp)

Table: meals

- id (uuid, primary key)
- user_id (uuid, foreign key - later)
- meal_name (text)
- description (text, nullable)
- meal_type (text)
- photo_url (text, nullable)
- created_at (timestamp)

=== CODE QUALITY ===

- Add comments for complex logic
- Use meaningful variable names
- Keep functions small (< 50 lines)
- DRY principle - no code duplication
- Consistent naming: camelCase for variables, PascalCase for components
- Console.log for debugging (remove before production)

=== DELIVERABLES ===
Generate clean, production-ready code for all screens and components following these requirements. Include:

- Proper imports
- Error handling
- Loading states
- Comments explaining key logic
- Consistent styling
- Reusable components where applicable

Focus on creating a modern, fast, intuitive app that feels premium despite being simple."

Make the code moduler and reusable
