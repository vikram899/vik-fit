import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Card = ({
  title,
  subtitle,
  onPress,
  rightIcon,
  rightAction,
  onRightActionPress,
  disabled = false,
  style,
  variant = 'default', // default, highlighted
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        style={[
          styles.card,
          variant === 'highlighted' && styles.cardHighlighted,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightIcon && (
          <MaterialCommunityIcons name={rightIcon} size={24} color="#007AFF" />
        )}
      </TouchableOpacity>

      {rightAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRightActionPress}
          disabled={disabled}
        >
          <MaterialCommunityIcons name={rightAction} size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHighlighted: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#FF3B30',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Card;
