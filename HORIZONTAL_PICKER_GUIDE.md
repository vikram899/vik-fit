# React Native Number Horizontal Picker - Implementation Guide

## Library Details

**Package**: `react-native-number-horizontal-picker`
**GitHub**: https://github.com/hajeonghun/react-native-number-horizontal-picker
**Status**: Production-ready, actively maintained

## Installation

```bash
npm install react-native-number-horizontal-picker
```

## Correct Props

The library uses different prop names than initially thought:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minimumValue` | number | Required | Lowest selectable value |
| `maximumValue` | number | Required | Highest selectable value |
| `focusValue` | number | minimumValue | Initial value to display/focus |
| `onChangeValue` | function | Required | Callback when value changes: `(value) => {}` |
| `customRenderItem` | function | View | Custom item renderer |
| `thumbElement` | ReactElement | View | Custom indicator element |

## Current Implementation

Located in `src/screens/WeightTrackingScreen.js`:

```javascript
import HorizontalPicker from "react-native-number-horizontal-picker";

// Display value at top
<View style={styles.horizontalPickerWrapper}>
  <Text style={styles.weightDisplayValue}>
    {parseFloat(currentWeight) || 70}
  </Text>
  <Text style={styles.weightDisplayUnit}>kg</Text>
</View>

// Horizontal picker
<HorizontalPicker
  minimumValue={30}
  maximumValue={200}
  focusValue={parseFloat(currentWeight) || 70}
  onChangeValue={(value) => setCurrentWeight(Math.round(value * 10) / 10)}
  customRenderItem={(element, style) => (
    <View style={style}>
      <Text style={styles.pickerItemText}>{element}</Text>
    </View>
  )}
/>
```

## Key Features

✅ **Horizontal Scrolling** - Smooth momentum-based scrolling
✅ **Custom Items** - Render numbers with your own styling
✅ **Large Display** - Shows selected value prominently (48px)
✅ **Precision Control** - `Math.round(value * 10) / 10` for 0.1 precision
✅ **Custom Renderer** - Full control over item appearance

## Styling Applied

### Display Value
- Font size: 48px
- Font weight: Bold
- Color: Primary blue (#007AFF)

### Weight Unit
- Font size: 18px
- Font weight: 600
- Color: Gray (#999)
- Margin left: 8px

### Picker Items
- Font size: 14px
- Font weight: 500
- Color: Gray (#666)
- Text aligned center

## Important Notes

⚠️ **Do NOT change the 'width' property** - The library uses width for rendering optimization. Changing it will break the picker.

✅ **Rendering** - The `customRenderItem` callback receives:
- `element` - The numeric value to display (e.g., 75.5)
- `style` - The style object (don't modify width!)

✅ **Precision** - The picker works with decimal values:
```javascript
// Store with 0.1 precision
Math.round(value * 10) / 10
```

## Alternative Props

If you need custom styling:

```javascript
// Custom thumb (center indicator)
<HorizontalPicker
  minimumValue={30}
  maximumValue={200}
  focusValue={weight}
  onChangeValue={setWeight}
  thumbElement={<MyCustomThumb />}
/>

// Simpler without custom items
<HorizontalPicker
  minimumValue={30}
  maximumValue={200}
  focusValue={weight}
  onChangeValue={setWeight}
/>
```

## Integration Checklist

- ✅ Package installed
- ✅ Imported in WeightTrackingScreen
- ✅ Correct props used (minimumValue, maximumValue, focusValue, onChangeValue)
- ✅ Custom item renderer for styling
- ✅ Display value shown above picker
- ✅ Unit label displayed
- ✅ Precision control applied
- ✅ State updates correctly

## Troubleshooting

### Issue: Only seeing a red line
**Solution**: Ensure `customRenderItem` is properly rendering the items with text

### Issue: Numbers not updating
**Solution**: Check that `onChangeValue` callback is updating state correctly

### Issue: Picker not scrolling
**Solution**: Ensure component has proper height/width from parent container

### Issue: Values off by decimal
**Solution**: Use `Math.round(value * 10) / 10` to ensure 0.1 precision

## Files Modified

1. `src/screens/WeightTrackingScreen.js` - Integrated HorizontalPicker
2. `package.json` - Added react-native-number-horizontal-picker dependency

## Future Customizations

You can further customize by:

1. **Styling items** - Modify `customRenderItem` to add colors/backgrounds
2. **Custom thumb** - Create a custom indicator via `thumbElement`
3. **Animation speed** - Check library docs for animation props
4. **Range presets** - Create presets for different weight ranges

## Example: Custom Styled Items

```javascript
<HorizontalPicker
  minimumValue={30}
  maximumValue={200}
  focusValue={weight}
  onChangeValue={setWeight}
  customRenderItem={(element, style) => (
    <View style={[style, {
      backgroundColor: element === Math.round(weight * 10) / 10 ? '#E3F2FD' : 'transparent',
      borderRadius: 8,
      paddingHorizontal: 4,
    }]}>
      <Text style={{
        fontSize: element === Math.round(weight * 10) / 10 ? 16 : 14,
        fontWeight: element === Math.round(weight * 10) / 10 ? '700' : '500',
        color: element === Math.round(weight * 10) / 10 ? '#007AFF' : '#999',
      }}>
        {element}
      </Text>
    </View>
  )}
/>
```

## Performance

- Lightweight component
- Optimized for smooth scrolling at 60fps
- Minimal re-renders
- No external dependencies beyond React Native

---

**Version**: react-native-number-horizontal-picker ^latest
**Last Updated**: 2024
**Status**: ✅ Production Ready
