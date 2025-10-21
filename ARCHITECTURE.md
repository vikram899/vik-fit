# VikFit App Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     VikFit Application                          │
├─────────────────────────────────────────────────────────────────┤
│                    Navigation Layer                             │
│  ┌─────────┬──────────────┬────────┬─────────┐                │
│  │  Home   │ Workouts ★   │ Meals  │ Profile │  Bottom Tabs   │
│  └─────────┴──────────────┴────────┴─────────┘                │
│                     ↓                                           │
│         WorkoutStack Navigator (New)                          │
│         ├─ WorkoutPlansScreen                                 │
│         ├─ CreatePlanScreen                                   │
│         ├─ PlanDetailScreen                                   │
│         └─ WorkoutExecutionScreen                             │
├─────────────────────────────────────────────────────────────────┤
│                 Screen/Component Layer                          │
│  Individual screens with UI components and event handlers     │
├─────────────────────────────────────────────────────────────────┤
│              State Management (Custom Hook)                     │
│                  useWorkoutPlans()                              │
│  ├─ plans state                                               │
│  ├─ currentPlan state                                         │
│  ├─ loading state                                             │
│  ├─ error state                                               │
│  └─ Action functions (CRUD operations)                        │
├─────────────────────────────────────────────────────────────────┤
│              Data Service Layer                                 │
│                 dummyDataPlans.js                               │
│  ├─ getAllPlans()                                             │
│  ├─ getPlanById()                                             │
│  ├─ createPlan()                                              │
│  ├─ updatePlan()                                              │
│  ├─ deletePlan()                                              │
│  ├─ addExerciseToPlan()                                       │
│  ├─ removeExerciseFromPlan()                                  │
│  └─ updateExerciseInPlan()                                    │
├─────────────────────────────────────────────────────────────────┤
│           In-Memory Storage (JavaScript)                        │
│  workoutPlans array with exercises                            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action (Button Click)
         ↓
Component Handler Function
         ↓
useWorkoutPlans Hook Function
         ↓
dummyDataPlans Service
         ↓
Update In-Memory Data
         ↓
Return Response
         ↓
Hook Updates State (setPlans, etc)
         ↓
Component Re-renders
         ↓
User Sees Update
```

## Navigation Structure

```
Bottom Tab Navigation
├─ Home Tab
│  └─ HomeScreen
├─ Workouts Tab ★ (Uses Stack Navigator)
│  └─ WorkoutStackNavigator
│     ├─ WorkoutPlansScreen (Initial)
│     ├─ CreatePlanScreen
│     ├─ PlanDetailScreen
│     ├─ WorkoutExecutionScreen
│     └─ WorkoutsScreen (Legacy)
├─ Meals Tab
│  └─ MealsScreen
└─ Profile Tab
   └─ ProfileScreen
```

## Screen Flow

```
WorkoutPlansScreen (List Plans)
    ├─ [Tap Plan] → PlanDetailScreen (View/Edit)
    │              ├─ [Edit] → Modal (Edit Exercise)
    │              ├─ [Delete] → Remove with Confirm
    │              └─ [Start] → WorkoutExecutionScreen
    ├─ [+] Button → CreatePlanScreen (New Plan)
    │              └─ [Create] → PlanDetailScreen
    └─ [Delete] → Confirm → Remove
```

## Data Structure

### WorkoutPlan Object
```javascript
{
  id: string,
  name: string,
  description: string,
  createdAt: ISO timestamp,
  exercises: Exercise[]
}
```

### Exercise Object
```javascript
{
  id: string,
  name: string,
  sets: number,
  reps: number,
  weight: number
}
```

### WorkoutLog Object
```javascript
{
  planId: string,
  planName: string,
  startTime: ISO timestamp,
  endTime: ISO timestamp,
  duration: minutes,
  exercises: LoggedExercise[]
}
```

## Component Hierarchy

```
App.js
├─ NavigationContainer
   └─ AppNavigator (BottomTabNavigator)
      ├─ Home Tab
      │  └─ HomeScreen
      ├─ Workouts Tab
      │  └─ WorkoutStackNavigator
      │     ├─ WorkoutPlansScreen
      │     ├─ CreatePlanScreen
      │     ├─ PlanDetailScreen
      │     └─ WorkoutExecutionScreen
      ├─ Meals Tab
      │  └─ MealsScreen
      └─ Profile Tab
         └─ ProfileScreen
```

## State Management Flow

```
useWorkoutPlans Hook
├─ State
│  ├─ plans: []
│  ├─ currentPlan: null
│  ├─ loading: false
│  └─ error: null
├─ Actions
│  ├─ loadPlans()
│  ├─ loadPlanById(id)
│  ├─ createNewPlan(data)
│  ├─ updateCurrentPlan(data)
│  ├─ deletePlanById(id)
│  ├─ addExercise(data)
│  ├─ removeExercise(id)
│  ├─ updateExercise(id, data)
│  └─ clearError()
└─ Returns all to components
```

## Pre-loaded Plans

### Plan 1: Chest & Triceps
- Bench Press (4x8 @ 100kg)
- Incline Dumbbell Press (3x10 @ 35kg)
- Tricep Dips (3x12 @ 0kg)

### Plan 2: Back & Biceps
- Barbell Rows (4x6 @ 120kg)
- Pull-ups (3x10 @ 0kg)
- Barbell Curls (3x8 @ 60kg)

### Plan 3: Legs
- Squats (4x6 @ 150kg)
- Romanian Deadlifts (3x8 @ 140kg)
- Leg Press (3x10 @ 200kg)
