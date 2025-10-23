import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { buttonStyles, COLORS } from '../../styles';

const Button = ({
  onPress,
  disabled = false,
  variant = 'primary', // primary, secondary, danger
  icon,
  iconSize = 20,
  title,
  style,
  textStyle,
  fullWidth = false,
  flex = false,
}) => {
  const getVariantStyle = () => {
    if (disabled) return buttonStyles.buttonDisabled;
    if (variant === 'secondary') return buttonStyles.buttonSecondary;
    if (variant === 'danger') return buttonStyles.buttonDanger;
    return buttonStyles.buttonPrimary; // primary
  };

  return (
    <TouchableOpacity
      style={[
        buttonStyles.button,
        getVariantStyle(),
        {
          width: fullWidth ? '100%' : 'auto',
          flex: flex ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={buttonStyles.buttonContent}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={iconSize}
            color={COLORS.white}
            style={buttonStyles.buttonIcon}
          />
        )}
        <Text style={[buttonStyles.buttonText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Button;
