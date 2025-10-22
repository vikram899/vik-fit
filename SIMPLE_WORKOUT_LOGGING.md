# Simple Workout Logging Feature

## Overview
A straightforward workout logging system where users perform exercises one-by-one and log reps & weight for each set.

**No complex timers. No overcomplicated UI. Just focused logging.**

---

## How It Works

### User Flow
1. **LogWorkoutScreen** → View today's assigned workouts
2. Click **Start Button** → Opens **StartWorkoutScreen**
3. For each exercise:
   - See exercise name and target reps/weight
   - Input: Reps completed, Weight used
   - Click "Log Set"
   - Automatically moves to next set
4. After all sets/exercises → Success message, save logged data

---

## Files Created

### 1. `src/screens/StartWorkoutScreen.js` (387 lines)
**Purpose**: Main workout logging interface

**Key Features**:
- Header: Workout name, progress bar, exit button
- Current exercise display with target values
- Simple form: Reps + Weight inputs
- "Log Set" button - logs and auto-advances
- Activity log showing all logged sets below form

**State Management**:
```javascript
- currentExerciseIndex: Which exercise (0 to n)
- currentSetNumber: Which set (1 to exercise.sets)
- repsInput: User entered reps
- weightInput: User entered weight
- loggedSets: Array of all logged sets
```

**Flow on Log Set**:
1. Validate reps > 0
2. Save to database
3. Add to local activity log
4. Auto-advance to next set OR next exercise OR complete

---

## Database

### Tables Added
```sql
workout_logs:
  id, planId, logDate, status, totalDurationSeconds,
  startedAt, completedAt

set_logs:
  id, workoutLogId, exerciseId, setNumber,
  repsCompleted, weightUsed, createdAt
```

### Functions Added (7)
- `startWorkoutLog(planId)` - Create session
- `logExerciseSet(workoutLogId, exerciseId, setNumber, reps, weight)` - Log set
- `getExerciseSetLogs(workoutLogId, exerciseId)` - Get sets for exercise
- `getWorkoutSetLogs(workoutLogId)` - Get all sets
- `completeWorkoutLog(workoutLogId, duration)` - Mark complete
- `cancelWorkoutLog(workoutLogId)` - Mark cancelled
- `getWorkoutHistory(planId)` - Get past workouts

---

## Integration Points

### LogWorkoutScreen Updates
Added two buttons per workout card:
- **View Button**: Shows exercise details (existing feature)
- **Start Button**: Launches StartWorkoutScreen (NEW)

```javascript
const handleStartWorkout = (workout) => {
  navigation.navigate('StartWorkout', { planId: workout.id });
};
```

### App.js Updates
```javascript
// Import
import StartWorkoutScreen from "./src/screens/StartWorkoutScreen";

// Navigation
<Stack.Screen
  name="StartWorkout"
  component={StartWorkoutScreen}
  options={{ headerShown: false }}
/>
```

---

## UI Components

### Exercise Card
```
┌─────────────────────┐
│ Bench Press         │
│ Set 2 of 3          │
│ Target: 10 reps @ 60kg│
└─────────────────────┘
```

### Input Form
```
┌─────────────────────┐
│ Reps [12]   Wt [60]│
│  [Log Set Button]   │
└─────────────────────┘
```

### Activity Log
```
Bench Press - Set 1: 10 reps @ 60kg
Bench Press - Set 2: 12 reps @ 60kg
Incline DB - Set 1: 8 reps @ 30kg
```

---

## What Gets Logged

For each set:
- ✅ Exercise ID
- ✅ Set Number
- ✅ Reps Completed
- ✅ Weight Used
- ✅ Timestamp
- ❌ RPE (Rate of Perceived Exertion) - Too much complexity
- ❌ Notes - Keep it simple
- ❌ Duration - Auto-calculated

---

## Future Enhancements (If Needed)

1. **Rest Timer**: Simple "Start Rest" button after logging set
2. **Previous Data**: Show last workout's weight/reps for reference
3. **Quick Weight Buttons**: Buttons for +/- 2.5kg adjustments
4. **Voice Input**: Optional voice input for reps
5. **Summary Screen**: Show workout stats after completion

---

## Known Limitations

- ❌ No audio cues or timers (keep it simple)
- ❌ No RPE tracking
- ❌ No notes field
- ❌ No PR tracking
- ❌ No detailed analytics

**These can be added later if needed.**

---

## Testing Checklist

- [ ] Start workout from LogWorkoutScreen
- [ ] Log reps for first set
- [ ] Log weight
- [ ] Click "Log Set"
- [ ] Advances to set 2
- [ ] Activity log updates
- [ ] Complete all sets
- [ ] Success message appears
- [ ] Exit without completing
- [ ] Data saved to database

---

## Code Stats

**New Files**: 1
- `src/screens/StartWorkoutScreen.js` - 387 lines

**Modified Files**: 2
- `src/services/database.js` - Added 7 functions
- `src/screens/LogWorkoutScreen.js` - Added Start button
- `App.js` - Added import and route

**Total Lines**: ~500 lines of code

**Complexity**: LOW ✅
**Maintainability**: HIGH ✅
**User Experience**: FOCUSED ✅

---

## Version
v1.0 - Simplified Workout Logging
Last Updated: 2025-10-22
