import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import OnboardingSlide from "../components/OnboardingSlide";
import { useOnboarding } from "../hooks/useOnboarding";
import { OnboardingStackParamList } from "@core/navigation/stacks/OnboardingStack";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Gender">;

const OPTIONS = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
];

export default function GenderScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();

  return (
    <OnboardingSlide
      step={1}
      totalSteps={7}
      title={"What is your biological sex?"}
      hint="Please select the closest match. This information is used for accurate metabolic calculations."
      onNext={() => navigation.navigate("DOB")}
      onBack={() => navigation.goBack()}
      nextDisabled={!draft.gender}
    >
      <View style={{ gap: 12 }}>
        {OPTIONS.map(({ value, label }) => {
          const selected = draft.gender === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => updateDraft({ gender: value })}
              activeOpacity={1}
              style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderRadius: 16,
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? "#fff" : "rgba(255,255,255,0.2)",
                backgroundColor: selected
                  ? "rgba(255,255,255,0.06)"
                  : "transparent",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#fff" }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingSlide>
  );
}
