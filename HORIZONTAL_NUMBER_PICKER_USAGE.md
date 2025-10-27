# HorizontalNumberPicker Component

A reusable React Native component for selecting numbers horizontally with a smooth, iOS-style picker interface.

## Features

✨ **Smooth Horizontal Scrolling** - FlatList-based implementation with snapping
✨ **Large Display Value** - Shows selected value prominently at the top
✨ **Visual Indicators** - White line under selected item and optional center indicator
✨ **Customizable Range** - Set any min/max values with custom step sizes
✨ **Reusable** - Works across your entire app

## Installation

The component is located at `src/components/common/HorizontalNumberPicker.js` and is exported from `src/components/common/index.js`.

## Basic Usage

```javascript
import { HorizontalNumberPicker } from "../components/common";

export default function MyScreen() {
  const [weight, setWeight] = useState(70);

  return (
    <HorizontalNumberPicker
      minValue={30}
      maxValue={200}
      step={0.1}
      selectedValue={weight}
      displayValue={weight}
      onValueChange={(value) => setWeight(value)}
      unit="kg"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minValue` | number | 0 | Minimum value for the picker |
| `maxValue` | number | 100 | Maximum value for the picker |
| `step` | number | 0.1 | Step between values (e.g., 0.1 for decimals, 1 for integers) |
| `selectedValue` | number | - | Currently selected value |
| `onValueChange` | function | - | Callback when value changes: `(newValue) => {}` |
| `unit` | string | '' | Unit to display next to the value (e.g., 'kg', 'cm', 'lbs') |
| `displayValue` | number | - | Value to display at the top (usually same as selectedValue) |

## Real-World Examples

### Weight Tracking
```javascript
<HorizontalNumberPicker
  minValue={30}
  maxValue={200}
  step={0.1}
  selectedValue={currentWeight}
  displayValue={currentWeight}
  onValueChange={(value) => setCurrentWeight(value)}
  unit="kg"
/>
```

### Height Tracking
```javascript
<HorizontalNumberPicker
  minValue={140}
  maxValue={220}
  step={1}
  selectedValue={height}
  displayValue={height}
  onValueChange={(value) => setHeight(value)}
  unit="cm"
/>
```

### Age Selection
```javascript
<HorizontalNumberPicker
  minValue={13}
  maxValue={100}
  step={1}
  selectedValue={age}
  displayValue={age}
  onValueChange={(value) => setAge(value)}
  unit="years"
/>
```

## How It Works

1. **FlatList Implementation** - Uses a horizontal FlatList with snapping enabled
2. **Large Display** - Large number displayed at the top (48px font size)
3. **Item Rendering** - Each item is 50px wide, centered in viewport
4. **Selection Detection** - Uses `onMomentumScrollEnd` to detect which item is centered
5. **Visual Feedback** - Selected item shows white underline, unselected items are grayed out

## Styling

The component uses absolute styling and isn't meant to be heavily customized via props. To modify styles:

1. Edit `src/components/common/HorizontalNumberPicker.js`
2. Modify the `StyleSheet.create()` at the bottom
3. Key styles to customize:
   - `displayValue` - Font size/color of main display (currently 48px, bold)
   - `selectedItemText` - Font size/color of selected item in list
   - `itemText` - Font size/color of unselected items
   - `selectedIndicator` - Style of white underline

## Used In

- **WeightTrackingScreen.js** - For setting today's weight
- Can be reused for: height, age, measurements, prices, etc.

## Performance

- Optimized with `scrollEventThrottle={16}` for smooth 60fps scrolling
- Uses `decelerationRate="fast"` for snappy feel
- Memoization not needed as component is lightweight

## Future Enhancements

- Support for custom display formatting
- Haptic feedback on selection
- Animation customization options
- Decimal place control
