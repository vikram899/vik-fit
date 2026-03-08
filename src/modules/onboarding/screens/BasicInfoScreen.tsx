import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Input } from '@shared/components/ui/Input';
import { Radius } from '@theme/radius';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { Gender } from '@shared/types/common';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BasicInfo'>;

const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

// useOnboarding is shared across steps via React Context in a real app.
// For simplicity here, each screen receives the hook as prop drilling through
// a parent context — screens import from the same context provider.
// This screen demonstrates the pattern; wiring via context is done in OnboardingStack.

export default function BasicInfoScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { draft, updateDraft } = useOnboarding();

  const isValid = draft.name.trim().length > 0 && draft.age.length > 0 && draft.gender !== '';

  return (
    <OnboardingLayout
      step={1}
      totalSteps={5}
      title="Tell us about you"
      subtitle="We'll use this to personalise your experience."
      onNext={() => navigation.navigate('BodyMetrics')}
      onBack={() => navigation.goBack()}
      nextDisabled={!isValid}
    >
      <Input
        label="Your name"
        value={draft.name}
        onChangeText={(v) => updateDraft({ name: v })}
        placeholder="e.g. Vikram"
        containerStyle={{ marginBottom: spacing.base }}
        autoCapitalize="words"
      />
      <Input
        label="Age"
        value={draft.age}
        onChangeText={(v) => updateDraft({ age: v })}
        placeholder="e.g. 25"
        keyboardType="number-pad"
        containerStyle={{ marginBottom: spacing.base }}
      />

      <Text style={{ ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm }}>
        Gender
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {GENDERS.map((g) => {
          const selected = draft.gender === g.value;
          return (
            <TouchableOpacity
              key={g.value}
              onPress={() => updateDraft({ gender: g.value })}
              style={{
                paddingHorizontal: spacing.base,
                paddingVertical: spacing.sm,
                borderRadius: Radius.full,
                borderWidth: 1.5,
                borderColor: selected ? colors.brandPrimary : colors.border,
                backgroundColor: selected ? `${colors.brandPrimary}22` : colors.transparent,
              }}
            >
              <Text
                style={{
                  ...typography.label,
                  color: selected ? colors.brandPrimary : colors.textSecondary,
                }}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
