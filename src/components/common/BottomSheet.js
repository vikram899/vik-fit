import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

const screenHeight = Dimensions.get("window").height;
const MAX_HEIGHT = screenHeight * 0.7;
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.6; // Fixed large height

/**
 * Reusable BottomSheet Component
 * Dynamically slides up from bottom (30% - 70% of screen height)
 * Content height determines actual sheet height
 * Supports swipe-down gesture to close
 *
 * Props:
 * - visible: boolean - Whether bottom sheet is visible
 * - onClose: function - Called when bottom sheet is closed
 * - title: string - Title of the bottom sheet
 * - children: ReactNode - Content to display in bottom sheet
 */
const BottomSheet = ({ visible, onClose, title, children }) => {
  const slideAnim = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const panResponder = useRef(null);

  // Create pan responder for swipe-down gesture
  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to downward swipes
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          gestureState.dy > 0
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped down more than 50px or velocity is high, close the sheet
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          // Snap back to open position
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }, [slideAnim]);

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(BOTTOM_SHEET_HEIGHT);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: BOTTOM_SHEET_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Overlay with fade animation */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            opacity: slideAnim.interpolate({
              inputRange: [0, BOTTOM_SHEET_HEIGHT],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Bottom Sheet Container */}
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.current?.panHandlers}
      >
        {/* Handle Bar - Swipe indicator */}
        <View style={styles.handleContainer}>
          <View style={styles.handleBar} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Content with Scrolling */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: COLORS.secondaryBackground,
    borderTopLeftRadius: SPACING.borderRadiusLarge,
    borderTopRightRadius: SPACING.borderRadiusLarge,
    overflow: "hidden",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: SPACING.small,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.small,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.container,
    paddingBottom: SPACING.xxxl,
  },
});

export default BottomSheet;
