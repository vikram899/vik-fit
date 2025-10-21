import React, { useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const SwipeableCard = ({ children, onDelete }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          pan.x.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50) {
          Animated.timing(pan, {
            toValue: { x: -100, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start();
          setDeleteConfirm(true);
        } else {
          Animated.timing(pan, {
            toValue: { x: 0, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start();
          setDeleteConfirm(false);
        }
      },
    })
  ).current;

  const resetSwipe = () => {
    Animated.timing(pan, {
      toValue: { x: 0, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start();
    setDeleteConfirm(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.deleteAction}>
        {deleteConfirm && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              onDelete();
              resetSwipe();
            }}
          >
            <MaterialCommunityIcons name="trash-can" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={resetSwipe}
          activeOpacity={1}
          style={{ flex: 1 }}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 10,
  },
  cardContainer: {
    width: '100%',
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeableCard;
