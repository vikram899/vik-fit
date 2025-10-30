import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * HelpIcon Component
 * Consistent help icon used throughout the app
 *
 * Props:
 * - onPress: function - Callback when help icon is pressed
 * - size: number - Icon size (default: 18)
 * - color: string - Icon color (default: '#666')
 * - style: object - Additional styles for TouchableOpacity
 */
const HelpIcon = ({
  onPress,
  size = 18,
  color = '#666',
  style = {},
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.helpButton, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <MaterialCommunityIcons
        name="help-circle-outline"
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HelpIcon;
