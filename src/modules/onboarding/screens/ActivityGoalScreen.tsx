import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { ActivityLevel, Goal } from '@shared/types/common';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ActivityGoal'>;

const ACTIVITY_OPTIONS: { label: string; description: string; value: ActivityLevel }[] = [
  { label: 'Sedentary', description: 'Little to no exercise', value: 'sedentary' },
  { label: 'Light', description: '1–3 days/week', value: 'light' },
  { label: 'Moderate', description: '3–5 days/week', value: 'moderate' },
  { label: 'Active', description: '6–7 days/week', value: 'active' },
  { label: 'Very Active', description: 'Twice a day or hard labour', value: 'very_active' },
];

const GOAL_OPTIONS: { label: string; description: string; value: Goal }[] = [
  { label: 'Lose Weight', description: 'Caloric deficit', value: 'lose_weight' },
  { label: 'Maintain', description: 'Stay at current weight', value: 'maintain' },
  { label: 'Gain Muscle', description: 'Caloric surplus', value: 'gain_muscle' },
];

export default function ActivityGoalScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { draft, updateDraft } = useOnboarding();

  const isValid = draft.activityLevel !== '' && draft.goal !== '';

  return (
    <OnboardingLayout
      step={3}
      totalSteps={5}
      title="Activity & goal"
      subtitle="This determines your daily calorie target."
      onNext={() => navigation.navigate('Summary')}
      onBack={() => navigation.goBack()}
      nextDisabled={!isValid}
    >
      <Text style={{ ...typography.sectionTitle, color: colors.textPrimary, marginBottom: spacing.sm }}>
        Activity level
      </Text>
      <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
        {ACTIVITY_OPTIONS.map((opt) => {
          const selected = draft.activityLevel === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => updateDraft({ activityLevel: opt.value })}
              style={{
                padding: spacing.base,
                borderRadius: Radius.md,
                borderWidth: 1.5,
                borderColor: selected ? colors.brandPrimary : colors.border,
                backgroundColor: selected ? `${colors.brandPrimary}15` : colors.surface,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ ...typography.label, color: selected ? colors.brandPrimary : colors.textPrimary }}>
                  {opt.label}
                </Text>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                  {opt.description}
                </Text>
              </View>
              {selected ? (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: Radius.full,
                    backgroundColor: colors.brandPrimary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={{ ...typography.sectionTitle, color: colors.textPrimary, marginBottom: spacing.sm }}>
        Goal
      </Text>
      <View style={{ gap: spacing.sm }}>
        {GOAL_OPTIONS.map((opt) => {
          const selected = draft.goal === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => updateDraft({ goal: opt.value })}
              style={{
                padding: spacing.base,
                borderRadius: Radius.md,
                borderWidth: 1.5,
                borderColor: selected ? colors.brandPrimary : colors.border,
                backgroundColor: selected ? `${colors.brandPrimary}15` : colors.surface,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ ...typography.label, color: selected ? colors.brandPrimary : colors.textPrimary }}>
                  {opt.label}
                </Text>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                  {opt.description}
                </Text>
              </View>
              {selected ? (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: Radius.full,
                    backgroundColor: colors.brandPrimary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
