# Decimal Weight Picker - Visual Explanation

## The Concept: Index to Weight Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                 WEIGHT ARRAY (Generated Once)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Index:  0    1    2    3   ...  553   554   555   ...  1700│
│ Weight: 30.0 30.1 30.2 30.3 ... 85.3 85.4 85.5 ... 200.0 │
│                                                             │
│ Total: 1701 values from 30.0 to 200.0 kg                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## How the Picker Works

### Step 1: Generate Weight Array

```javascript
WEIGHT_ARRAY = [30.0, 30.1, 30.2, ..., 85.3, 85.4, ..., 200.0]
```

### Step 2: Find Current Index

```
currentWeight = "85.3"
↓
findIndex(w => |w - 85.3| < 0.05)
↓
index = 553
```

### Step 3: Show Picker with Index Range

```
HorizontalPicker(
  minimumValue: 0        ← First index
  maximumValue: 1700     ← Last index
  focusValue: 553        ← Current position
)
```

### Step 4: Convert Index Back to Weight

```
User scrolls → onChangeValue(index)
↓
weight = WEIGHT_ARRAY[Math.round(index)]
↓
setCurrentWeight(weight.toFixed(1))
```

## Example: User Interaction

### Scenario: User at 85.3 kg scrolls down (left)

```
┌─────────────────────────────────────────────────────────────┐
│                      BEFORE SCROLL                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Display: 85.3 kg                                          │
│  Index: 553                                                │
│  Array[553]: 85.3                                          │
│                                                             │
│  Visible picker items: 85.1  85.2  85.3  85.4  85.5       │
│                                           ↑                │
│                                        (focused)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

USER SCROLLS LEFT (down in array)
↓

┌─────────────────────────────────────────────────────────────┐
│                      AFTER SCROLL                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Display: 85.4 kg                                          │
│  Index: 554                                                │
│  Array[554]: 85.4                                          │
│                                                             │
│  Visible picker items: 85.2  85.3  85.4  85.5  85.6       │
│                                           ↑                │
│                                        (focused)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────┐
│  User Scrolls   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   onChangeValue(index: number)      │
│   e.g., index = 554                 │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   Math.round(index)                 │
│   → 554                             │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   WEIGHT_ARRAY[554]                 │
│   → 85.4                            │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   toFixed(1)                        │
│   → "85.4"                          │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   setCurrentWeight("85.4")          │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   Display Updates: "85.4 kg"        │
└─────────────────────────────────────┘
```

## Array Index Distribution

```
Weight Range: 30.0 to 200.0 kg
Step: 0.1 kg
Total Values: 1701

Distribution:
├── 30.0 - 40.0 kg     → Index 0 - 100
├── 40.0 - 50.0 kg     → Index 100 - 200
├── 50.0 - 60.0 kg     → Index 200 - 300
├── 60.0 - 70.0 kg     → Index 300 - 400
├── 70.0 - 80.0 kg     → Index 400 - 500
├── 80.0 - 90.0 kg     → Index 500 - 600    ← Most common range
├── 90.0 - 100.0 kg    → Index 600 - 700
├── 100.0 - 150.0 kg   → Index 700 - 1200
└── 150.0 - 200.0 kg   → Index 1200 - 1700
```

## Precision: 0.1 kg

```
Each scroll increment changes by:

30.0 ─ 0.1 ─ 30.1 ─ 0.1 ─ 30.2 ─ 0.1 ─ 30.3 ...

Index increments: 0 → 1 → 2 → 3 → ...
Weight increments: 30.0 → 30.1 → 30.2 → 30.3 → ...
```

## Focus Value Calculation

When loading saved weight:

```
Saved Weight: 85.3 kg

WEIGHT_ARRAY.findIndex(w => |w - 85.3| < 0.05)
                                    ↑
                                Tolerance of 0.05

This finds the closest value in array
Usually exact match: 85.3 → Index 553
```

## Display Section

```
┌────────────────────────────────────┐
│      Display: 85.3                 │
│      Unit: kg                      │
├────────────────────────────────────┤
│  Current Weight: 85.3              │
│  (Updated from WEIGHT_ARRAY[553])  │
│                                    │
│  Format: toFixed(1) = "85.3"       │
│  Storage: string "85.3"            │
│  Database: number 85.3             │
└────────────────────────────────────┘
```

## Picker Index vs Display

```
What User Sees (Display):
┌──────────────────┐
│  85.3            │
│  kg              │
└──────────────────┘

What Picker Uses (Index):
┌──────────────────┐
│  Index: 553      │
│  (hidden)        │
└──────────────────┘

Mapping:
WEIGHT_ARRAY[553] = 85.3 ← Display shows this
```

## Edge Cases

### Near Minimum (30.0 kg)

```
Weight: 30.0 kg
Index: 0
WEIGHT_ARRAY[0]: 30.0
Can't go lower ✓
```

### Near Maximum (200.0 kg)

```
Weight: 200.0 kg
Index: 1700
WEIGHT_ARRAY[1700]: 200.0
Can't go higher ✓
```

### Between Values (shouldn't happen)

```
Weight: 85.25 kg (not in array)
findIndex searches for closest
Finds: 85.2 or 85.3
Matches to nearest ✓
```

## Performance Impact

```
Array Generation:
  ├─ Time: <1ms
  ├─ Memory: ~10KB
  └─ Runs: Once on mount

Each Scroll:
  ├─ Time: <1ms
  ├─ Operations: Array lookup + string conversion
  └─ Smooth 60fps ✓
```

---

**Summary**: The picker uses index-based scrolling mapped to decimal weight values, providing smooth 0.1 kg increments across the 30-200 kg range.
