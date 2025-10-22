# Workout Logging - Step-by-Step Testing Guide

## Test 1: Load the app and navigate to LogWorkoutScreen

**Steps:**
1. Start the app with `npm start`
2. Press `i` to open iOS simulator (or `a` for Android)
3. Navigate to **Workouts tab** → **Log Workout**
4. You should see **Today's Workouts** with a list of workouts assigned for today

**Expected Result:**
- ✅ LogWorkoutScreen loads without crashing
- ✅ See today's workouts displayed as cards
- ✅ Each card shows workout name, exercise count, scheduled days

---

## Test 2: Start a workout

**Steps:**
1. Find a workout card (e.g., "Chest Day")
2. Click the **blue "Start" button** on the workout card
3. Screen should navigate to StartWorkoutScreen

**Expected Result:**
- ✅ StartWorkoutScreen opens
- ✅ Header shows workout name (e.g., "Chest Day")
- ✅ Progress bar shows 0%
- ✅ First exercise is displayed (e.g., "Bench Press")
- ✅ Shows "Set 1 of 3"
- ✅ Shows target reps and weight

---

## Test 3: Log first set

**Steps:**
1. In the input form, enter:
   - **Reps**: 10 (or any number)
   - **Weight**: 60 (or any number)
2. Click **"Log Set" button**

**Expected Result:**
- ✅ Set is saved (no error message)
- ✅ Input fields are cleared
- ✅ Screen now shows "Set 2 of 3"
- ✅ Below the form, "Activity Log" shows:
   - `Bench Press - Set 1: 10 reps @ 60kg`

---

## Test 4: Log second set

**Steps:**
1. Enter different values:
   - **Reps**: 12
   - **Weight**: 60
2. Click **"Log Set"**

**Expected Result:**
- ✅ Set 2 is logged
- ✅ Progress bar increases
- ✅ Now shows "Set 3 of 3"
- ✅ Activity log shows both sets:
   - `Bench Press - Set 1: 10 reps @ 60kg`
   - `Bench Press - Set 2: 12 reps @ 60kg`

---

## Test 5: Complete exercise and move to next

**Steps:**
1. Log the final set (Set 3):
   - **Reps**: 8
   - **Weight**: 65
2. Click **"Log Set"**

**Expected Result:**
- ✅ Screen advances to next exercise
- ✅ Now shows exercise 2 name (e.g., "Incline DB Press")
- ✅ Shows "Set 1 of X"
- ✅ Activity log still shows all Bench Press sets

---

## Test 6: Complete entire workout

**Steps:**
1. Continue logging all exercises and sets
2. Log the final set of the final exercise

**Expected Result:**
- ✅ Success alert appears: "Success - Workout completed!"
- ✅ Button "OK" to return
- ✅ Navigate back to LogWorkoutScreen
- ✅ All data should be saved in database

---

## Test 7: Exit workout without completing

**Steps:**
1. Start a new workout
2. Log 1-2 sets
3. Click the **X button** in header (top-left)

**Expected Result:**
- ✅ Confirmation dialog appears:
   - "Exit Workout"
   - "Are you sure? Your logged sets will be saved."
- ✅ If click "Exit" → goes back to LogWorkoutScreen
- ✅ Logged sets are still saved

---

## Test 8: Resume a workout

**Steps:**
1. Start a workout
2. Log 1-2 sets
3. Exit without completing
4. Click "Start" on same workout again

**Expected Result:**
- ✅ No database error
- ✅ Either:
   - Option A: Resume from where you left off
   - Option B: Start fresh (both are acceptable)
- ✅ Previously logged sets should still be in database

---

## Common Issues to Watch For

### Issue 1: Database Error
```
ERROR  Error starting workout log: [Error: UNIQUE constraint failed:
workout_logs.planId, workout_logs.logDate]
```

**Fix**: This is fixed. The app should now check for existing workouts before creating new ones.

### Issue 2: Screen doesn't load
**Check**:
- Are exercises loaded for the workout?
- Is planId being passed correctly?

### Issue 3: Values not appearing in Activity Log
**Check**:
- Was "Log Set" button actually clicked?
- Are there any console errors?

### Issue 4: Wrong exercise showing
**Check**:
- Is currentExerciseIndex being incremented correctly?

---

## Database Verification (Advanced)

After testing, you can check the database to verify data was saved:

```javascript
// In StartWorkoutScreen or browser console
const logs = await getWorkoutSetLogs(workoutLogId);
console.log(logs);
```

You should see an array of set objects with:
```javascript
{
  id: 1,
  workoutLogId: 1,
  exerciseId: 2,
  setNumber: 1,
  repsCompleted: 10,
  weightUsed: 60,
  createdAt: "2025-10-22T16:20:00.000Z"
}
```

---

## Success Criteria ✅

All tests pass when:
- [ ] Can start a workout
- [ ] Can log reps and weight
- [ ] Auto-advances between sets
- [ ] Auto-advances between exercises
- [ ] Completes successfully
- [ ] Can exit without completing
- [ ] Can resume a workout
- [ ] Data is saved to database

---

## Next Steps

Once all tests pass:
1. Add a simple summary screen
2. Add ability to view past workouts
3. Add rest timer (optional)
4. Add voice guidance (optional)

For now, focus on getting the core logging working perfectly.
