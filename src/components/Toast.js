import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'error':
        return { name: 'alert-circle', color: '#FF3B30' };
      case 'warning':
        return { name: 'alert', color: '#FF9500' };
      case 'info':
      default:
        return { name: 'information', color: '#007AFF' };
    }
  };

  const icon = getIcon();
  const backgroundColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#FF3B30' : type === 'warning' ? '#FF9500' : '#007AFF';

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            backgroundColor,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <MaterialCommunityIcons name={icon.name} size={20} color="#fff" />
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    maxWidth: '90%',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default Toast;
