import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../../styles/app.styles";

/**
 * OptionsMenu
 * Reusable kebab menu component for displaying action options
 *
 * Props:
 * - visible: boolean - whether menu is visible
 * - onClose: function - callback to close menu
 * - options: array of objects - menu options
 *   - Each option: { label: string, icon: string, color?: string, onPress: function }
 * - title?: string - optional menu title (default: "Options")
 */
export default function OptionsMenu({
  visible,
  onClose,
  options,
  title = "Options",
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={appStyles.menuOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={appStyles.menuContent}>
              <Text style={appStyles.menuTitle}>{title}</Text>

              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    appStyles.menuItem,
                    index === options.length - 1 && appStyles.menuItemLast,
                  ]}
                  onPress={() => {
                    onClose();
                    option.onPress();
                  }}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={20}
                    color={option.color || "#007AFF"}
                  />
                  <Text
                    style={[
                      appStyles.menuItemText,
                      option.color && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
