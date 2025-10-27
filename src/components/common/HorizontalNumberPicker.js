import React, { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 50;
const ITEM_HEIGHT = 60;

/**
 * HorizontalNumberPicker - A reusable horizontal number picker component
 *
 * Props:
 * - minValue: number - Minimum value for the picker
 * - maxValue: number - Maximum value for the picker
 * - step: number - Step between values (default: 0.1)
 * - selectedValue: number - Currently selected value
 * - onValueChange: function - Callback when value changes (receives new value)
 * - unit: string - Unit to display (e.g., 'kg', 'cm')
 * - displayValue: number - Value to display at the top (usually the selected value)
 *
 * Example:
 * <HorizontalNumberPicker
 *   minValue={40}
 *   maxValue={120}
 *   step={0.5}
 *   selectedValue={85}
 *   onValueChange={(value) => setCurrentWeight(value)}
 *   unit="kg"
 *   displayValue={85}
 * />
 */
const HorizontalNumberPicker = ({
  minValue = 0,
  maxValue = 100,
  step = 0.1,
  selectedValue,
  onValueChange,
  unit = '',
  displayValue,
}) => {
  const flatListRef = useRef(null);

  // Generate array of numbers based on min, max, and step
  const generateNumberArray = () => {
    const numbers = [];
    for (let i = minValue; i <= maxValue; i += step) {
      numbers.push(parseFloat(i.toFixed(1)));
    }
    return numbers;
  };

  const numbers = generateNumberArray();

  // Find the closest index to the selected value
  const findClosestIndex = () => {
    if (!selectedValue) return 0;
    return numbers.findIndex((num) => Math.abs(num - selectedValue) < step / 2);
  };

  const initialIndex = findClosestIndex();

  // Scroll to selected value on mount
  useEffect(() => {
    if (flatListRef.current && initialIndex >= 0) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({
            index: initialIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (error) {
          // Silently fail if index is out of range
          console.warn('scrollToIndex failed:', error);
        }
      }, 100);
    }
  }, []);

  // Handle scroll end to detect which value is in the middle
  const handleMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / ITEM_WIDTH);

    if (index >= 0 && index < numbers.length) {
      const value = numbers[index];
      onValueChange?.(value);
    }
  };

  // Render individual number item
  const renderItem = ({ item, index }) => {
    const isSelected = Math.abs(item - displayValue) < step / 2;

    return (
      <View style={styles.itemContainer}>
        <View
          style={[
            styles.item,
            isSelected && styles.selectedItem,
          ]}
        >
          <Text
            style={[
              styles.itemText,
              isSelected && styles.selectedItemText,
            ]}
          >
            {item.toFixed(1)}
          </Text>

          {/* White line indicator for selected item */}
          {isSelected && <View style={styles.selectedIndicator} />}
        </View>
      </View>
    );
  };

  // Required for scrollToIndex to work
  const getItemLayout = (data, index) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  const contentInset = {
    left: (width / 2) - (ITEM_WIDTH / 2),
    right: (width / 2) - (ITEM_WIDTH / 2),
  };

  return (
    <View style={styles.container}>
      {/* Display selected value at top */}
      <View style={styles.displayContainer}>
        <Text style={styles.displayValue}>
          {displayValue || selectedValue}
        </Text>
        <Text style={styles.displayUnit}>{unit}</Text>
      </View>

      {/* Horizontal number picker */}
      <View style={styles.pickerContainer}>
        <FlatList
          ref={flatListRef}
          data={numbers}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          scrollEnabled
          decelerationRate="fast"
          snapToInterval={ITEM_WIDTH}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentInset={contentInset}
          contentOffset={{ x: -(contentInset.left) }}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={() => {
            // Silently handle scroll to index failures
            console.warn('onScrollToIndexFailed');
          }}
        />
      </View>

      {/* Optional: Center indicator line */}
      <View style={styles.centerIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  displayValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  displayUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginLeft: 8,
  },
  pickerContainer: {
    height: ITEM_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  selectedItem: {
    borderBottomWidth: 3,
    borderBottomColor: '#fff',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ccc',
  },
  selectedItemText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  selectedIndicator: {
    height: 3,
    backgroundColor: '#fff',
    marginTop: 8,
    width: ITEM_WIDTH - 10,
  },
  centerIndicator: {
    position: 'absolute',
    top: 0,
    left: width / 2 - 1.5,
    width: 3,
    height: ITEM_HEIGHT,
    backgroundColor: '#007AFF',
    opacity: 0.3,
  },
});

export default HorizontalNumberPicker;
