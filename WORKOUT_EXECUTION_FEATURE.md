# Workout Execution Feature - Implementation Guide

## Overview

This document describes the complete workout execution feature that allows users to perform exercises turn-by-turn, log their performance (sets, reps, weight), and automatically start rest timers between sets.

## Feature Highlights

### 1. **Real-Time Set Logging**

- **Minimal Input UI**: Users log reps, weight, and RPE (Rate of Perceived Exertion) for each set
- **Auto-Focus**: Primary input field (reps) is auto-focused to reduce tapping
- **Pre-Filled Values**: Fields pre-fill with exercise target values and previous set data
- **Quick Logging**: Large, tap-friendly buttons for fast logging during workouts

### 2. **Intelligent Timer System**

- **Automatic Set Timer**: Timer starts after logging first set, displays remaining time
- **Rest Timer**: Automatically begins after set completes (default 90 seconds, customizable)
- **Auto-Advance**: Moves to next set automatically when rest timer finishes
- **Visual Feedback**: Large countdown display with progress bar
- **Manual Controls**: Skip, Pause/Resume buttons for flexibility

### 3. **Progress Tracking**

- **Live Progress**: Shows current exercise/set progress (e.g., "Exercise 3/5, Set 1/3")
- **Visual Indicators**: Progress bar showing workout completion percentage
- **Activity Log**: Tab showing all logged sets with timestamps and details
- **Undo Capability**: Can edit sets before advancing to next exercise (in future versions)

### 4. **Workout Completion Screen**

- **Success Feedback**: Celebratory completion screen with achievements
- **Workout Summary**: Shows:
  - Total duration in human-readable format (e.g., "23m 45s")
  - Estimated calories burned
  - Total exercises completed
  - Total sets logged
- **Exercise Breakdown**: For each exercise:
  - Total reps across all sets
  - Maximum weight lifted
  - Average RPE
- **Personal Records**: Achievement badges for PRs (future enhancement)

## User Flow

```
LogWorkoutScreen
    ↓
  [Today's Workouts Tab] → View Today's Assigned Workouts
    ↓
  [Start Button] → Navigate to WorkoutExecutionScreen
    ↓
WorkoutExecutionScreen
    ├─ Header: Workout name, pause/exit, progress bar
    ├─ Tabs: Exercise | Activity Log
    ├─ Exercise Tab:
    │   ├─ WorkoutTimer Component
    │   │   └─ Displays current set, timer, progress
    │   └─ ExerciseSetLogger Component
    │       └─ Input fields for reps, weight, RPE, notes
    └─ Activity Log Tab:
        └─ Chronological list of all logged sets
    ↓
  [Log Set Button] → Save to database, start timer
    ↓
  [Timer finishes] → Auto-advance to next set/exercise
    ↓
  [All exercises complete] → Navigate to WorkoutCompletionScreen
    ↓
WorkoutCompletionScreen
    ├─ Success animation
    ├─ Workout stats and summary
    ├─ Exercise breakdown
    └─ Achievement section with home button
```

## Implementation Details

### Database Schema

#### New Tables

```sql
-- Track individual workout sessions
workout_logs:
  id INTEGER PRIMARY KEY
  planId INTEGER (FOREIGN KEY)
  logDate TEXT (YYYY-MM-DD)
  status TEXT ('in_progress', 'completed', 'cancelled')
  totalDurationSeconds INTEGER
  startedAt TIMESTAMP
  completedAt TIMESTAMP
  createdAt TIMESTAMP

-- Track individual set performance data
set_logs:
  id INTEGER PRIMARY KEY
  workoutLogId INTEGER (FOREIGN KEY)
  exerciseId INTEGER (FOREIGN KEY)
  setNumber INTEGER
  repsCompleted INTEGER
  weightUsed REAL
  rpe INTEGER (1-10)
  durationSeconds INTEGER
  restTimeUsedSeconds INTEGER
  notes TEXT
  createdAt TIMESTAMP
```

### Key Components

#### 1. **WorkoutTimer.js** (`src/components/WorkoutTimer.js`)

**Purpose**: Displays and manages workout timers

**Props**:

- `exerciseName`: Current exercise name
- `currentSet`: Current set number
- `totalSets`: Total sets for exercise
- `timerDuration`: Set duration in seconds
- `restDuration`: Rest duration in seconds
- `onSetComplete`: Callback when set timer finishes
- `onRestComplete`: Callback when rest timer finishes
- `isPaused`: Whether workout is paused
- `onStatusChange`: Callback for pause/resume

**Features**:

- Large, easy-to-read timer display (MM:SS format)
- Circular progress indicator with color-coded states
- Set progress label showing "Set X of Y"
- Skip and Pause/Resume buttons
- Pulse animation on timer completion
- Progress bar showing timer progress

#### 2. **ExerciseSetLogger.js** (`src/components/ExerciseSetLogger.js`)

**Purpose**: Minimal UI for logging individual set data

**Props**:

- `exercise`: Exercise object with target sets/reps/weight
- `currentSet`: Current set number
- `totalSets`: Total sets for exercise
- `onSetLogged`: Callback with logged data
- `previousSetData`: Data from previous set to pre-fill
- `autoFocusFirstInput`: Auto-focus reps input field

**Logged Data**:

```javascript
{
  repsCompleted: number,
  weightUsed: number,
  rpe: number (1-10) | null,
  notes: string
}
```

**UX Features**:

- Three input fields: Reps (primary), Weight, RPE
- Optional notes field (max 100 chars)
- Target values shown in header
- Input validation (reps required)
- Large "Log Set & Start Timer" button
- Keyboard navigation with return keys

#### 3. **WorkoutExecutionScreen.js** (`src/screens/WorkoutExecutionScreen.js`)

**Purpose**: Main workout interface managing the entire session

**Key State**:

- `workoutLogId`: Current workout session ID
- `currentExerciseIndex`: Index of current exercise
- `currentSetNumber`: Current set number
- `isPaused`: Workout pause state
- `activityLog`: Array of logged sets
- `activeTab`: 'exercise' or 'history'

**Navigation to this screen**:

```javascript
navigation.navigate("WorkoutExecution", { planId: plan.id });
```

**Core Flow**:

1. On mount: Check for existing active workout or create new one
2. Display current exercise with timer and logger
3. On set logged: Save to DB and start timer
4. On timer complete: Auto-advance to next set/exercise
5. On final exercise complete: Navigate to completion screen

**Key Features**:

- Real-time progress tracking
- Two tabs: Exercise (logging) and Activity Log
- Exit confirmation dialog
- Pause/resume functionality
- Dynamic header with progress bar

#### 4. **WorkoutCompletionScreen.js** (`src/screens/WorkoutCompletionScreen.js`)

**Purpose**: Display workout summary and achievements

**Navigation from WorkoutExecutionScreen**:

```javascript
navigation.replace("WorkoutCompletionScreen", {
  planId,
  workoutLogId,
  totalDurationSeconds,
  exercisesCompleted,
});
```

**Displays**:

- Success animation with checkmark
- Quick stats grid: Duration, Calories, Exercises, Sets
- Exercise breakdown: reps, max weight, avg RPE per exercise
- Achievement message
- Navigation buttons: Details (future), Home

**Calculations**:

- **Duration**: Formatted from seconds to human-readable (e.g., "23m 45s")
- **Calories**: Rough estimate of 6 cal/min for weight training
- **Exercise Summary**: Aggregates all set data per exercise

### Navigation Integration

#### LogWorkoutScreen Updates

Added new `handleStartWorkout` function:

```javascript
const handleStartWorkout = (workout) => {
  navigation.navigate("WorkoutExecution", { planId: workout.id });
};
```

Updated action buttons in workout cards:

- **View Button**: Shows exercise details (original functionality)
- **Start Button**: Launches WorkoutExecutionScreen (new)

#### App.js Additions

```javascript
// Import new screens
import WorkoutExecutionScreen from "./src/screens/WorkoutExecutionScreen";
import WorkoutCompletionScreen from "./src/screens/WorkoutCompletionScreen";

// Register navigation routes in HomeStackNavigator
<Stack.Screen
  name="WorkoutExecution"
  component={WorkoutExecutionScreen}
  options={{ headerShown: false, animationEnabled: true }}
/>
<Stack.Screen
  name="WorkoutCompletionScreen"
  component={WorkoutCompletionScreen}
  options={{ headerShown: false, animationEnabled: true }}
/>
```

## Database Functions Added

All located in `src/services/database.js`:

### Workout Management

- `startWorkoutLog(planId, logDate)`: Create new workout session
- `getActiveWorkoutLog(planId)`: Get in-progress workout for today
- `completeWorkoutLog(workoutLogId, totalDurationSeconds)`: Mark workout complete
- `cancelWorkoutLog(workoutLogId)`: Cancel workout session
- `getWorkoutHistory(planId, limit)`: Get past workouts

### Set Logging

- `logExerciseSet(workoutLogId, exerciseId, setNumber, repsCompleted, weightUsed, rpe, notes)`: Log a single set
- `updateSetLog(setLogId, durationSeconds, restTimeUsedSeconds)`: Update set with timing data
- `getExerciseSetLogs(workoutLogId, exerciseId)`: Get all sets for an exercise in workout
- `getWorkoutSetLogs(workoutLogId)`: Get all sets logged in workout

## UX/UI Design Principles

### 1. **Minimize Distractions**

- Large, clear typography (56px+ button targets)
- Reduced visual clutter in exercise view
- Less critical info in collapsible sections
- Portrait lock to prevent accidental rotation

### 2. **One-Handed Operation**

- All controls reachable from thumb position
- Primary action button at bottom
- Timer and logging form vertically stacked
- Minimal horizontal scrolling

### 3. **Continuous Feedback**

- Real-time progress display
- Haptic feedback on button presses (future)
- Visual progress bars
- Audio cues on timer completion (future)
- Color-coded status (red=timer running, green=resting)

### 4. **Workflow Optimization**

- Auto-focus primary input field
- Pre-filled values from exercise template
- Tab navigation between inputs
- Single button to complete logging and start timer

### 5. **Undo & Edit Capability**

- View previous set data in activity log
- Edit capability before advancing (future)
- Notes field for observations

## Future Enhancements

### Tier 1 (High Priority)

- [ ] Audio cues and voice guidance integration (expo-av)
- [ ] Haptic feedback on timer milestones
- [ ] Configurable rest timer per exercise
- [ ] Edit previous set data before advancing
- [ ] Personal Records (PR) tracking

### Tier 2 (Medium Priority)

- [ ] Workout history analytics dashboard
- [ ] Export workout data (CSV, PDF)
- [ ] Share workout achievements
- [ ] Video form guidance per exercise
- [ ] Workout notes and observations

### Tier 3 (Nice to Have)

- [ ] Interval training with multiple timer phases
- [ ] RPE-based auto-weight adjustment
- [ ] Voice-activated logging
- [ ] Leaderboards and challenges
- [ ] Integration with wearables (heart rate, steps)

## Testing Checklist

- [ ] Create new workout session successfully
- [ ] Log multiple sets with varying reps/weight
- [ ] Timer starts automatically after logging set
- [ ] Timer progresses correctly (countdown)
- [ ] Auto-advance works when timer finishes
- [ ] Rest timer shows after set completes
- [ ] Activity log updates in real-time
- [ ] Tab switching between Exercise and History
- [ ] Pause/Resume functionality works
- [ ] Exit confirmation dialog appears
- [ ] Completion screen shows correct stats
- [ ] Navigation back to home from completion
- [ ] Database records created correctly
- [ ] Workout marked as completed in plan_execution

## Performance Considerations

- **Database Queries**: Efficient async/await pattern with error handling
- **Animations**: Hardware-accelerated (useNativeDriver: true)
- **Re-renders**: Minimal with proper state management
- **Memory**: Large arrays (set logs) not loaded all at once
- **Timer Accuracy**: Using setInterval with manual timestamp tracking

## File Manifest

**New Files Created**:

1. `src/components/WorkoutTimer.js` - 249 lines
2. `src/components/ExerciseSetLogger.js` - 318 lines
3. `src/screens/WorkoutExecutionScreen.js` - 424 lines
4. `src/screens/WorkoutCompletionScreen.js` - 429 lines

**Modified Files**:

1. `src/services/database.js` - Added 163 lines (tables + functions)
2. `src/screens/LogWorkoutScreen.js` - Updated action buttons
3. `App.js` - Added imports and navigation routes

**Total Lines Added**: ~1,700+ lines

## Known Limitations & Future Improvements

1. **Audio**: Currently uses console.log placeholders - needs expo-av integration
2. **Voice**: Voice guidance not yet implemented
3. **Haptics**: Vibration feedback uses console.log - needs react-native-haptics
4. **Rest Timer**: Fixed 90 seconds - should be customizable per exercise
5. **Calculations**: Calorie estimate is rough - should use user weight and exercise type
6. **PRs**: Personal record tracking not yet implemented
7. **Recovery**: No between-session recovery data tracking

## References

- React Native Navigation: https://reactnavigation.org/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- React Native Timers: https://reactnative.dev/docs/timers

---

**Version**: 1.0
**Last Updated**: 2025-10-22
**Status**: Complete - Ready for Testing
