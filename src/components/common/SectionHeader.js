import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HelpIcon from './HelpIcon';

/**
 * SectionHeader Component
 * Consistent header used for sections like "Weekly Streak" and "Stats"
 * Includes title and optional help icon
 *
 * Props:
 * - title: string - The section title
 * - onHelpPress: function (optional) - Callback when help icon is pressed
 * - style: object (optional) - Additional styles for the container
 */
const SectionHeader = ({ title, onHelpPress, style }) => {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.title}>{title}</Text>
      {onHelpPress && <HelpIcon onPress={onHelpPress} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    flex: 0,
  },
});

export default SectionHeader;
