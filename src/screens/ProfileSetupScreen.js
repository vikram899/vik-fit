import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";
import { getUserProfile, updateUserProfile } from "../services/database";

/**
 * ProfileSetupScreen
 * Allows users to set or update their profile information
 * Required for accurate calorie calculations (BMR, step calories)
 */
export default function ProfileSetupScreen({ navigation }) {
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getUserProfile();
      setHeight(profile.height.toString());
      setAge(profile.age.toString());
      setGender(profile.gender);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    const heightNum = parseInt(height, 10);
    const ageNum = parseInt(age, 10);

    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      Alert.alert("Invalid Height", "Please enter a valid height between 100-250 cm");
      return;
    }

    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      Alert.alert("Invalid Age", "Please enter a valid age between 10-120 years");
      return;
    }

    try {
      await updateUserProfile(heightNum, ageNum, gender);
      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Height Input */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeader}>
          <MaterialCommunityIcons name="human-male-height" size={24} color={COLORS.primary} />
          <Text style={styles.inputLabel}>Height</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="170"
            keyboardType="number-pad"
            value={height}
            onChangeText={setHeight}
            placeholderTextColor={COLORS.mediumGray}
          />
          <Text style={styles.inputUnit}>cm</Text>
        </View>
        <Text style={styles.inputHelp}>Enter your height in centimeters</Text>
      </View>

      {/* Age Input */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeader}>
          <MaterialCommunityIcons name="cake-variant" size={24} color={COLORS.primary} />
          <Text style={styles.inputLabel}>Age</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="30"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            placeholderTextColor={COLORS.mediumGray}
          />
          <Text style={styles.inputUnit}>years</Text>
        </View>
        <Text style={styles.inputHelp}>Enter your age in years</Text>
      </View>

      {/* Gender Selection */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeader}>
          <MaterialCommunityIcons name="gender-male-female" size={24} color={COLORS.primary} />
          <Text style={styles.inputLabel}>Gender</Text>
        </View>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "male" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("male")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="gender-male"
              size={32}
              color={gender === "male" ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.genderText,
                gender === "male" && styles.genderTextActive,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "female" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("female")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="gender-female"
              size={32}
              color={gender === "female" ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.genderText,
                gender === "female" && styles.genderTextActive,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHelp}>
          Used for accurate BMR calculation
        </Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          This data is used to calculate your Basal Metabolic Rate (BMR) and calories burned from steps.
          More accurate profile = better calorie tracking.
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
        <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.white} />
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
  },
  content: {
    padding: SPACING.container,
    paddingBottom: SPACING.container * 2,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.container,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.container,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: SPACING.container,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.medium,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  inputUnit: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING.small,
  },
  inputHelp: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.small,
    marginLeft: SPACING.xs,
  },
  genderContainer: {
    flexDirection: "row",
    gap: SPACING.medium,
  },
  genderButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.mediumGray,
    paddingVertical: SPACING.container,
    gap: SPACING.small,
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
  genderTextActive: {
    color: COLORS.white,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.medium,
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.element,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.container,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.medium,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.element,
    borderRadius: SPACING.borderRadius,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});
