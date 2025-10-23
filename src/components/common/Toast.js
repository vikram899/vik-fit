import React from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toastStyles, COLORS } from '../../styles';

const Toast = ({ message, type = 'info', visible, onHide }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }
  }, [visible, animatedValue, onHide]);

  if (!visible) {
    return null;
  }

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = animatedValue;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return toastStyles.toastSuccess;
      case 'error':
        return toastStyles.toastError;
      case 'warning':
        return toastStyles.toastWarning;
      case 'info':
      default:
        return toastStyles.toastInfo;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'info':
      default:
        return 'information';
    }
  };

  return (
    <View style={toastStyles.container} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[
          toastStyles.toast,
          getToastStyle(),
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <MaterialCommunityIcons name={getIcon()} size={20} color={COLORS.white} />
        <Text style={toastStyles.toastText}>{message}</Text>
      </Animated.View>
    </View>
  );
};

export default Toast;
