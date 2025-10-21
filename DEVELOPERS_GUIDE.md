# Developers Guide

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.js
│   ├── WorkoutsScreen.js (Legacy - individual workout logging)
│   ├── MealsScreen.js
│   ├── ProfileScreen.js
│   ├── WorkoutPlansScreen.js (NEW - Plan list/management)
│   ├── CreatePlanScreen.js (NEW - Create new plan)
│   ├── PlanDetailScreen.js (NEW - Plan details & exercises)
│   └── WorkoutExecutionScreen.js (NEW - Workout logging)
├── hooks/
│   ├── useWorkouts.js (Existing - individual workout logging)
│   ├── useMeals.js (Existing)
│   └── useWorkoutPlans.js (NEW - Plan state management)
├── services/
│   ├── dummyData.js (Existing - individual workouts)
│   └── dummyDataPlans.js (NEW - Plan data service)
├── navigation/
│   └── AppNavigator.js (UPDATED - Stack nav for workouts)
├── components/
│   ├── (Existing components)
├── constants/
│   ├── colors.js
│   ├── spacing.js
│   └── design.js
└── utils/
    ├── helpers.js
    └── validation.js

App.js (Entry point)
app.json (Expo config)
package.json (Dependencies)
```

## File Locations & Purposes

### New Files

#### 1. src/services/dummyDataPlans.js (269 lines)
**Purpose:** In-memory data storage and CRUD operations for workout plans

**Key Functions:**
- `getAllPlans()` - Fetch all plans
- `getPlanById(planId)` - Get specific plan
- `createPlan(planData)` - Create new plan
- `updatePlan(planId, planData)` - Update plan
- `deletePlan(planId)` - Delete plan
- `addExerciseToPlan(planId, exerciseData)` - Add exercise
- `removeExerciseFromPlan(planId, exerciseId)` - Remove exercise
- `updateExerciseInPlan(planId, exerciseId, data)` - Update exercise
- `resetAllPlans()` - Clear all data
- `getPlansStats()` - Get statistics

**Data Structure:**
- `workoutPlans[]` - Array of all plans
- `nextPlanId` - Auto-increment ID counter
- `nextExerciseId` - Auto-increment exercise ID counter

#### 2. src/hooks/useWorkoutPlans.js (250 lines)
**Purpose:** React custom hook for plan state management

**State Variables:**
```javascript
const [plans, setPlans] = useState([])
const [currentPlan, setCurrentPlan] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

**Functions:**
- `loadPlans()` - Load all plans
- `loadPlanById(planId)` - Load specific plan
- `createNewPlan(planData)` - Create plan
- `updateCurrentPlan(planData)` - Update current plan
- `deletePlanById(planId)` - Delete plan
- `addExercise(exerciseData)` - Add to current plan
- `removeExercise(exerciseId)` - Remove from current plan
- `updateExercise(exerciseId, data)` - Update in current plan
- `clearError()` - Clear error state

**Usage:**
```javascript
const { plans, currentPlan, loading, error, createNewPlan, ... } = useWorkoutPlans()
```

#### 3. src/screens/WorkoutPlansScreen.js (244 lines)
**Purpose:** Display list of all workout plans

**Key Features:**
- FlatList for plan display
- Plan card component
- Create button (FAB)
- Delete with confirmation
- Loading and error states
- Empty state

**Props:**
- `navigation` - React Navigation prop

**Local State:**
- None (all from hook)

#### 4. src/screens/CreatePlanScreen.js (192 lines)
**Purpose:** Form to create new workout plan

**Key Features:**
- TextInput for plan name
- TextInput for description
- Character counters
- Form validation
- Tips section
- Cancel and Create buttons

**Props:**
- `navigation` - React Navigation prop

**Local State:**
```javascript
const [planName, setPlanName] = useState('')
const [description, setDescription] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
```

#### 5. src/screens/PlanDetailScreen.js (503 lines)
**Purpose:** View and manage exercises in a plan

**Key Features:**
- Plan header display
- Exercise list with FlatList
- Add/Edit/Delete exercises
- Modal for exercise form
- Start Workout button
- Loading and error states

**Props:**
- `navigation` - React Navigation
- `route` - Route params (planId)

**Local State:**
```javascript
const [isAddingExercise, setIsAddingExercise] = useState(false)
const [editingExercise, setEditingExercise] = useState(null)
const [exerciseForm, setExerciseForm] = useState({...})
```

#### 6. src/screens/WorkoutExecutionScreen.js (514 lines)
**Purpose:** Log actual workout performance

**Key Features:**
- Exercise list from plan
- Set/rep/weight inputs per exercise
- Add/remove sets
- Checkbox to mark complete
- Workout duration timer
- Add exercise progressively
- Save workout

**Props:**
- `navigation` - React Navigation
- `route` - Route params (planId)

**Local State:**
```javascript
const [workoutStart, setWorkoutStart] = useState(new Date())
const [exerciseLogs, setExerciseLogs] = useState([])
const [isAddingExercise, setIsAddingExercise] = useState(false)
const [newExerciseForm, setNewExerciseForm] = useState({...})
```

### Modified Files

#### src/navigation/AppNavigator.js
**Changes:**
- Added `createNativeStackNavigator` import
- Added 4 new screen imports
- Created `WorkoutStackNavigator()` function
- Changed Workouts tab to use `WorkoutStackNavigator`
- Tab name changed from "Workouts" to "WorkoutsTab"

**New Stack Screens:**
- WorkoutPlans (initial)
- CreatePlan
- PlanDetail
- WorkoutExecution
- Workouts (legacy)

## Key Commands

### Start Development
```bash
npm start -- --clear
```
Starts Metro bundler with clean cache

### Install Dependencies
```bash
npm install
```

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Run on Web
```bash
npm run web
```

### Test
```bash
npm test
```

### Clean
```bash
# Remove node_modules
rm -rf node_modules

# Remove cache
rm -rf .expo

# Full clean
rm -rf node_modules .expo package-lock.json
npm install
```

## Using the Hook

### Basic Usage
```javascript
import { useWorkoutPlans } from '../hooks/useWorkoutPlans'

export const MyComponent = () => {
  const {
    plans,
    currentPlan,
    loading,
    error,
    loadPlans,
    createNewPlan,
    addExercise,
    // ... more functions
  } = useWorkoutPlans()

  useEffect(() => {
    loadPlans()
  }, [])

  return (
    // Component JSX
  )
}
```

### Creating a Plan
```javascript
const result = await createNewPlan({
  name: 'My Plan',
  description: 'My description'
})
// Returns: { success: true/false, plan: {...} }
```

### Adding Exercise
```javascript
const result = await addExercise({
  name: 'Bench Press',
  sets: 4,
  reps: 8,
  weight: 100
})
// Returns: { success: true/false, exercise: {...} }
```

## Data Service Usage

### Import Service
```javascript
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  addExerciseToPlan,
  removeExerciseFromPlan,
  updateExerciseInPlan
} from '../services/dummyDataPlans'
```

### Service Calls
```javascript
// Get all plans
const { data, error } = await getAllPlans()

// Create plan
const { data, error } = await createPlan({
  name: 'New Plan',
  description: 'Description'
})

// Add exercise
const { data, error } = await addExerciseToPlan(planId, {
  name: 'Bench Press',
  sets: 4,
  reps: 8,
  weight: 100
})
```

## Navigation

### Navigate to Plan Detail
```javascript
navigation.navigate('PlanDetail', { planId: plan.id })
```

### Navigate to Create Plan
```javascript
navigation.navigate('CreatePlan')
```

### Navigate to Workout Execution
```javascript
navigation.navigate('WorkoutExecution', { planId: plan.id })
```

### Go Back
```javascript
navigation.goBack()
```

### Replace Screen
```javascript
navigation.replace('PlanDetail', { planId: plan.id })
```

## Styling

### Import Colors
```javascript
import { COLORS } from '../constants/design'

// Use colors
backgroundColor: COLORS.primary
color: COLORS.text
```

### Import Spacing
```javascript
import { SPACING, TYPOGRAPHY } from '../constants/design'

// Use spacing
padding: SPACING.md
marginBottom: SPACING.lg

// Use typography
fontSize: TYPOGRAPHY.sizes.lg
fontWeight: TYPOGRAPHY.weights.bold
```

## Common Patterns

### Loading & Error States
```javascript
if (loading && !data) {
  return <ActivityIndicator />
}

if (error) {
  return <ErrorView error={error} />
}

return <Content data={data} />
```

### Form Validation
```javascript
const validateForm = () => {
  if (!input.trim()) {
    Alert.alert('Error', 'Field required')
    return false
  }
  return true
}

const handleSubmit = () => {
  if (!validateForm()) return
  // Submit
}
```

### useCallback Pattern
```javascript
const handleDelete = useCallback(async (id) => {
  setLoading(true)
  try {
    const result = await deleteItem(id)
    // Handle result
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [])
```

## Debugging

### Check Console Logs
```bash
npm start
# Watch terminal output
```

### React DevTools
```bash
# Install globally
npm install -g react-devtools
react-devtools
```

### React Native Debugger
Download from: https://github.com/jhen0409/react-native-debugger

### Print State
```javascript
console.log('Plans:', plans)
console.log('Error:', error)
```

## Version Info

- **React:** 19.1.0
- **React Native:** 0.81.4
- **Expo:** ^54.0.0
- **React Navigation:** 6.x

## File Dependencies

```
WorkoutPlansScreen.js
  ├─ useWorkoutPlans hook
  ├─ COLORS, SPACING, TYPOGRAPHY constants
  └─ MaterialIcons

CreatePlanScreen.js
  ├─ useWorkoutPlans hook
  ├─ constants/design
  └─ MaterialIcons

PlanDetailScreen.js
  ├─ useWorkoutPlans hook
  ├─ constants/design
  ├─ FlatList component
  └─ Modal component

WorkoutExecutionScreen.js
  ├─ useWorkoutPlans hook
  ├─ useWorkouts hook
  ├─ constants/design
  └─ Modal component

useWorkoutPlans.js
  ├─ dummyDataPlans service
  └─ useState, useCallback

dummyDataPlans.js
  └─ (No external dependencies)

AppNavigator.js
  ├─ createBottomTabNavigator
  ├─ createNativeStackNavigator
  └─ All 4 new screens
```
