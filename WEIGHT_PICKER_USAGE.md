# Horizontal Number Picker for Weight Tracking

Your app now uses the **react-native-number-horizontal-picker** library - a well-maintained, battle-tested component for horizontal number selection.

## Installation

Already installed! The library was added to `package.json`:

```bash
npm install react-native-number-horizontal-picker
```

## Usage

### Basic Usage in WeightTrackingScreen

```javascript
import HorizontalPicker from "react-native-number-horizontal-picker";

export default function WeightTrackingScreen() {
  const [currentWeight, setCurrentWeight] = useState(70);

  return (
    <View>
      <HorizontalPicker
        min={30}
        max={200}
        step={0.1}
        value={currentWeight}
        onChange={(value) => setCurrentWeight(value)}
      />
    </View>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | number | - | Minimum value |
| `max` | number | - | Maximum value |
| `step` | number | 1 | Step increment between values |
| `value` | number | - | Current selected value |
| `onChange` | function | - | Callback when value changes: `(newValue) => {}` |

## Features

✨ **Smooth Horizontal Scrolling** - Native feel with momentum scrolling
✨ **Snap-to-Item** - Automatically snaps to nearest value when scrolling stops
✨ **Large Display** - Selected value shown prominently
✨ **Fast & Lightweight** - Optimized for performance
✨ **Cross-Platform** - Works on iOS and Android
✨ **Production-Ready** - Used in many apps

## Current Integration

The picker is integrated into your WeightTrackingScreen:

```javascript
<HorizontalPicker
  min={30}
  max={200}
  step={0.1}
  value={parseFloat(currentWeight) || 70}
  onChange={(value) => setCurrentWeight(value.toString())}
/>
```

## Use Cases

### Weight Tracking
```javascript
<HorizontalPicker
  min={30}
  max={200}
  step={0.1}
  value={weight}
  onChange={setWeight}
/>
```

### Height Selection
```javascript
<HorizontalPicker
  min={140}
  max={220}
  step={1}
  value={height}
  onChange={setHeight}
/>
```

### Age Picker
```javascript
<HorizontalPicker
  min={13}
  max={100}
  step={1}
  value={age}
  onChange={setAge}
/>
```

### Price Selection
```javascript
<HorizontalPicker
  min={10}
  max={1000}
  step={5}
  value={price}
  onChange={setPrice}
/>
```

## Styling

The library handles its own styling internally and matches the Dribbble design you wanted. If you need to customize appearance:

1. Check the GitHub repo: https://github.com/hajeonghun/react-native-number-horizontal-picker
2. The component uses standard React Native styling
3. You can wrap it in your own styling containers

## Why This Library?

✅ **Already Built** - No need to maintain custom code
✅ **Well-Maintained** - Active development and bug fixes
✅ **Battle-Tested** - Used in production apps
✅ **Lightweight** - Minimal dependencies
✅ **Clean API** - Simple prop-based configuration
✅ **Great UX** - Smooth, responsive interaction

## Documentation

For more details, see the official GitHub repo:
https://github.com/hajeonghun/react-native-number-horizontal-picker

## Migration from Custom Component

The old custom `HorizontalNumberPicker` component has been removed from:
- `src/components/common/HorizontalNumberPicker.js` (file still exists but not exported)

The library version (`react-native-number-horizontal-picker`) is now the standard across your app.

If you were using the custom component elsewhere, update imports from:
```javascript
// OLD
import { HorizontalNumberPicker } from "../components/common";

// NEW
import HorizontalPicker from "react-native-number-horizontal-picker";
```

And update usage:
```javascript
// OLD
<HorizontalNumberPicker
  minValue={30}
  maxValue={200}
  step={0.1}
  selectedValue={value}
  displayValue={value}
  onValueChange={onChange}
  unit="kg"
/>

// NEW
<HorizontalPicker
  min={30}
  max={200}
  step={0.1}
  value={value}
  onChange={onChange}
/>
```
