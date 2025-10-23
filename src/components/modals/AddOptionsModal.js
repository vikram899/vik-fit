import React from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

/**
 * AddOptionsModal
 * Popup modal with options to add workouts or meals
 */
const AddOptionsModal = ({ visible, onLogWorkout, onLogMeal, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>What would you like to add?</Text>

              {/* Log Workout Option */}
              <TouchableOpacity
                style={styles.option}
                onPress={onLogWorkout}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={32}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Log Workout</Text>
                  <Text style={styles.optionDescription}>
                    Add a new workout session
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#ccc"
                />
              </TouchableOpacity>

              {/* Log Meal Option */}
              <TouchableOpacity
                style={styles.option}
                onPress={onLogMeal}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={32}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Log Meal</Text>
                  <Text style={styles.optionDescription}>
                    Add a new meal entry
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#ccc"
                />
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 24,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default AddOptionsModal;
