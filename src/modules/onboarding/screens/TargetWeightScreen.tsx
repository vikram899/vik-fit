import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import OnboardingSlide from "../components/OnboardingSlide";
import { WheelPicker, WheelColumn } from "../components/WheelPicker";
import { useOnboarding } from "../hooks/useOnboarding";
import { OnboardingStackParamList } from "@core/navigation/stacks/OnboardingStack";

type Props = NativeStackScreenProps<OnboardingStackParamList, "TargetWeight">;

const KG_LIST = Array.from({ length: 171 }, (_, i) => String(30 + i));
const LBS_LIST = Array.from({ length: 375 }, (_, i) => String(66 + i));
const DEC_LIST = Array.from({ length: 10 }, (_, i) => String(i));

export default function TargetWeightScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();
  const isMetric = draft.unitPreference !== "imperial";

  const defaultKg =
    draft.goal === "lose-fat" || draft.goal === "lose-fat-gain-muscle"
      ? Math.max(30, Math.round(draft.weightKg) - 5)
      : Math.round(draft.weightKg) + 3;

  const [kgIdx, setKgIdx] = useState(Math.max(0, defaultKg - 30));
  const [lbsIdx, setLbsIdx] = useState(
    Math.max(0, Math.round(defaultKg * 2.20462) - 66)
  );
  const [decIdx, setDecIdx] = useState(0);
  const [skip, setSkip] = useState(draft.goal === "maintain");

  useEffect(() => {
    if (skip) {
      updateDraft({ targetWeightKg: null });
      return;
    }
    const kg = isMetric
      ? 30 + kgIdx + decIdx * 0.1
      : Math.round(((66 + lbsIdx) / 2.20462) * 10) / 10;
    updateDraft({ targetWeightKg: Math.round(kg * 10) / 10 });
  }, [kgIdx, lbsIdx, decIdx, skip, isMetric]);

  return (
    <OnboardingSlide
      step={7}
      totalSteps={7}
      title="What is your target weight?"
      onNext={() => navigation.navigate("Summary")}
      onBack={() => navigation.goBack()}
      nextLabel="Next"
    >
      {/* Skip toggle */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => setSkip(!skip)}
          activeOpacity={1}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: skip
              ? "rgba(255,255,255,0.3)"
              : "rgba(255,255,255,0.15)",
            backgroundColor: skip ? "rgba(255,255,255,0.08)" : "transparent",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: skip ? "#fff" : "rgba(255,255,255,0.5)",
              fontWeight: "500",
            }}
          >
            {skip ? "Set target" : "Skip"}
          </Text>
        </TouchableOpacity>
      </View>

      {!skip && (
        <View style={{ alignItems: "center" }}>
          {isMetric ? (
            <WheelPicker visibleItems={5}>
              <WheelColumn
                items={KG_LIST}
                selectedIndex={kgIdx}
                onSelect={setKgIdx}
                width={90}
                visibleItems={5}
              />
              <WheelColumn
                items={DEC_LIST}
                selectedIndex={decIdx}
                onSelect={setDecIdx}
                width={50}
                visibleItems={5}
              />
              <View
                style={{
                  width: 60,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}
                >
                  kg
                </Text>
              </View>
            </WheelPicker>
          ) : (
            <WheelPicker visibleItems={5}>
              <WheelColumn
                items={LBS_LIST}
                selectedIndex={lbsIdx}
                onSelect={setLbsIdx}
                width={100}
                visibleItems={5}
              />
              <View
                style={{
                  width: 60,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}
                >
                  lbs
                </Text>
              </View>
            </WheelPicker>
          )}

          {/* Current vs Target */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 28,
              width: "100%",
            }}
          >
            <View
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 6,
                }}
              >
                Current
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}>
                {isMetric
                  ? `${draft.weightKg} kg`
                  : `${Math.round(draft.weightKg * 2.20462)} lbs`}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(132,204,22,0.35)",
                backgroundColor: "rgba(132,204,22,0.08)",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(132,204,22,0.7)",
                  marginBottom: 6,
                }}
              >
                Target
              </Text>
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: "#84CC16" }}
              >
                {isMetric ? `${30 + kgIdx}.${decIdx} kg` : `${66 + lbsIdx} lbs`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {skip && (
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <Text
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            No target weight set.{"\n"}You can add one later from your profile.
          </Text>
        </View>
      )}
    </OnboardingSlide>
  );
}
