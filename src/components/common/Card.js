import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cardStyles, COLORS } from '../../styles';

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
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>
      <TouchableOpacity
        style={[
          cardStyles.card,
          cardStyles.cardRow,
          variant === 'highlighted' && cardStyles.cardHighlighted,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={cardStyles.cardContent}>
          <Text style={cardStyles.cardTitle}>{title}</Text>
          {subtitle && <Text style={cardStyles.cardSubtitle}>{subtitle}</Text>}
        </View>
        {rightIcon && (
          <MaterialCommunityIcons name={rightIcon} size={24} color={COLORS.primary} />
        )}
      </TouchableOpacity>

      {rightAction && (
        <TouchableOpacity
          style={cardStyles.cardAction}
          onPress={onRightActionPress}
          disabled={disabled}
        >
          <MaterialCommunityIcons name={rightAction} size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Card;
