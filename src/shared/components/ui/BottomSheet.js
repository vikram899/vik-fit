/**
 * REUSABLE BOTTOM SHEET COMPONENT
 *
 * Generic bottom sheet wrapper that slides up from the bottom with customizable content.
 * Used throughout the app for displaying modals with animations.
 *
 * Features:
 * - Animated bottom sheet with smooth slide animation
 * - Drag to dismiss functionality with pan responder
 * - Customizable header with title and close button
 * - Optional drag handle indicator
 * - Semi-transparent overlay
 * - Full customization of inner content via children
 *
 * @example
 * <BottomSheet
 *   visible={isVisible}
 *   title="Quick Add Meals"
 *   onClose={() => setIsVisible(false)}
 * >
 *   <View>
 *     Custom content here
 *   </View>
 * </BottomSheet>
 */

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../shared/constants";

const screenHeight = Dimensions.get("window").height;

const BottomSheet = ({
  // Content
  title,
  children,

  // Behavior
  visible = false,
  onClose,
  heightPercent = 0.9, // 90% of screen height by default

  // Appearance
  showDragHandle = false, // Hidden by default since dragging is disabled
  draggable = false, // Disabled by default to prevent conflicts with scrollable content (use close button instead)
  hasFixedFooter = false, // Whether the last child should be fixed at bottom
}) => {
  const bottomSheetHeight = screenHeight * heightPercent;
  const slideAnim = React.useRef(new Animated.Value(bottomSheetHeight)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out
      Animated.timing(slideAnim, {
        toValue: bottomSheetHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, bottomSheetHeight]);

  const handleCloseBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: bottomSheetHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  // Pan responder for general drag (disabled by default)
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => draggable,
      onMoveShouldSetPanResponder: (_, { dy }) =>
        draggable && Math.abs(dy) > 10,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          slideAnim.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > 50) {
          handleCloseBottomSheet();
        } else {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Pan responder for header drag (always enabled to allow closing from header)
  const headerPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 10,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          slideAnim.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > 50) {
          handleCloseBottomSheet();
        } else {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleCloseBottomSheet}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: COLORS.mainBackground,
            opacity: slideAnim.interpolate({
              inputRange: [0, bottomSheetHeight],
              outputRange: [1, 0],
            }),
            zIndex: 999,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={handleCloseBottomSheet}>
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
            backgroundColor: COLORS.secondaryBackground,
            borderTopLeftRadius: SPACING.borderRadiusXL,
            borderTopRightRadius: SPACING.borderRadiusXL,
            overflow: "hidden",
            zIndex: 1000,
            flexDirection: "column",
          },
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...(draggable ? panResponder.panHandlers : {})}
      >
        {/* Drag handle indicator */}
        {showDragHandle && (
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
        )}

        {/* Header with title and close button - draggable to dismiss */}
        {title && (
          <View style={styles.header} {...headerPanResponder.panHandlers}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleCloseBottomSheet}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={SPACING.iconSize}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Content wrapper - handles both scrollable content and fixed footer */}
        {hasFixedFooter ? (
          <>
            {/* Get all children except the last one for scrollable area */}
            <View style={styles.scrollableContent}>
              {React.Children.toArray(children).slice(0, -1)}
            </View>
            {/* Last child (footer) is fixed at bottom with padding for iPhone safe area */}
            <View
              style={{
                paddingBottom: SPACING.xxxl,
                backgroundColor: COLORS.tertiaryBackground,
              }}
            >
              {
                React.Children.toArray(children)[
                  React.Children.count(children) - 1
                ]
              }
            </View>
          </>
        ) : (
          <View
            style={[styles.contentWrapper, { paddingBottom: SPACING.xxxl }]}
          >
            {children}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.small,
  },

  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 2,
  },

  header: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.tertiaryBackground,
  },

  title: {
    ...TYPOGRAPHY.compactTitle,
    color: COLORS.textPrimary,
  },

  contentWrapper: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.tertiaryBackground,
  },

  scrollableContent: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.tertiaryBackground,
  },
});

export default BottomSheet;
