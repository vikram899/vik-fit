import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

const { height: screenHeight } = Dimensions.get("window");
const MAX_HEIGHT = screenHeight * 0.7;
const MIN_HEIGHT = screenHeight * 0.3;
const HEADER_HEIGHT = 70; // handle bar + header

/**
 * Reusable BottomSheet Component
 * Dynamically slides up from bottom (30% - 70% of screen height)
 * Content height determines actual sheet height
 *
 * Props:
 * - visible: boolean - Whether bottom sheet is visible
 * - onClose: function - Called when bottom sheet is closed
 * - title: string - Title of the bottom sheet
 * - children: ReactNode - Content to display in bottom sheet
 */
const BottomSheet = ({ visible, onClose, title, children }) => {
  const [contentHeight, setContentHeight] = useState(0);

  // Calculate the actual height based on content
  const getTotalHeight = () => {
    // Total height = content + header/handle
    const totalWithHeader = contentHeight + HEADER_HEIGHT;

    // Apply min/max constraints
    if (totalWithHeader < MIN_HEIGHT) {
      return MIN_HEIGHT;
    }
    if (totalWithHeader > MAX_HEIGHT) {
      return MAX_HEIGHT;
    }
    return totalWithHeader;
  };

  const sheetHeight = getTotalHeight();
  const shouldScroll = contentHeight + HEADER_HEIGHT > MAX_HEIGHT;

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Bottom Sheet Container */}
        <View
          style={[
            styles.bottomSheetContainer,
            {
              height: sheetHeight,
            },
          ]}
        >
          {/* Handle Bar */}
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

          {/* Content with Dynamic Measurement */}
          <ScrollView
            scrollEnabled={shouldScroll}
            showsVerticalScrollIndicator={true}
            onContentSizeChange={(width, height) => {
              setContentHeight(height);
            }}
          >
            <View style={styles.content}>{children}</View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    width: "100%",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 32,
  },
});

export default BottomSheet;
