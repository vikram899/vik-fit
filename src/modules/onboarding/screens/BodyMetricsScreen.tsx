import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Input } from '@shared/components/ui/Input';
import { Radius } from '@theme/radius';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { UnitPreference } from '@shared/types/common';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BodyMetrics'>;

const UNITS: { label: string; value: UnitPreference }[] = [
  { label: 'Metric (kg/cm)', value: 'metric' },
  { label: 'Imperial (lbs/in)', value: 'imperial' },
];

export default function BodyMetricsScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { draft, updateDraft } = useOnboarding();

  const isValid = draft.height.length > 0 && draft.weight.length > 0;
  const isMetric = draft.unitPreference === 'metric';

  return (
    <OnboardingLayout
      step={2}
      totalSteps={5}
      title="Body metrics"
      subtitle="Used to calculate your calorie and macro targets."
      onNext={() => navigation.navigate('ActivityGoal')}
      onBack={() => navigation.goBack()}
      nextDisabled={!isValid}
    >
      {/* Unit toggle */}
      <Text style={{ ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm }}>
        Units
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
        {UNITS.map((u) => {
          const selected = draft.unitPreference === u.value;
          return (
            <TouchableOpacity
              key={u.value}
              onPress={() => updateDraft({ unitPreference: u.value })}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: Radius.sm,
                borderWidth: 1.5,
                borderColor: selected ? colors.brandPrimary : colors.border,
                backgroundColor: selected ? `${colors.brandPrimary}22` : colors.transparent,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...typography.label,
                  color: selected ? colors.brandPrimary : colors.textSecondary,
                }}
              >
                {u.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Input
        label={`Height (${isMetric ? 'cm' : 'inches'})`}
        value={draft.height}
        onChangeText={(v) => updateDraft({ height: v })}
        placeholder={isMetric ? 'e.g. 175' : 'e.g. 69'}
        keyboardType="decimal-pad"
        containerStyle={{ marginBottom: spacing.base }}
      />
      <Input
        label={`Weight (${isMetric ? 'kg' : 'lbs'})`}
        value={draft.weight}
        onChangeText={(v) => updateDraft({ weight: v })}
        placeholder={isMetric ? 'e.g. 75' : 'e.g. 165'}
        keyboardType="decimal-pad"
      />
    </OnboardingLayout>
  );
}
