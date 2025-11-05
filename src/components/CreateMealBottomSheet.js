import React from "react";
import {
  View,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { COLORS, SPACING } from "../shared/constants";

/**
 * CreateMealBottomSheet
 * Reusable bottom sheet container for create meal modal
 *
 * Props:
 * - slideAnim: Animated.Value for slide animation
 * - panResponder: PanResponder handlers
 * - bottomSheetHeight: Height of the bottom sheet
 * - onOverlayPress: Callback when overlay is pressed
 * - children: Content to render inside bottom sheet
 */
const CreateMealBottomSheet = ({
  slideAnim,
  panResponder,
  bottomSheetHeight,
  onOverlayPress,
  children,
}) => {
  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            opacity: slideAnim.interpolate({
              inputRange: [0, bottomSheetHeight],
              outputRange: [1, 0],
            }),
            zIndex: 999,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={onOverlayPress}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: bottomSheetHeight,
            backgroundColor: COLORS.background,
            borderTopLeftRadius: SPACING.borderRadius,
            borderTopRightRadius: SPACING.borderRadius,
            overflow: "hidden",
            zIndex: 1000,
          },
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag handle indicator */}
        <View
          style={{
            alignItems: "center",
            paddingTop: SPACING.xs,
            paddingBottom: SPACING.xs,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: COLORS.mediumGray,
              borderRadius: 2,
            }}
          />
        </View>

        {/* Content */}
        {children}
      </Animated.View>
    </>
  );
};

export default CreateMealBottomSheet;
