import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Card } from '@shared/components/ui/Card';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { formatCalories, formatMacro } from '@shared/utils/formatUtils';
import { useAuth } from '@core/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Summary'>;

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ ...typography.body, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ ...typography.label, color: colors.textPrimary }}>{value}</Text>
    </View>
  );
}

export default function SummaryScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { getNutritionSummary, completeOnboarding, loading, error, draft } = useOnboarding();
  const { setHasUser } = useAuth();

  const nutrition = getNutritionSummary();

  const handleComplete = async () => {
    const success = await completeOnboarding();
    if (success) {
      setHasUser(true);
    }
  };

  return (
    <OnboardingLayout
      step={4}
      totalSteps={5}
      title={`You're all set, ${draft.name}!`}
      subtitle="Here's your personalised daily target."
      onNext={handleComplete}
      onBack={() => navigation.goBack()}
      nextLabel="Start Tracking"
      nextLoading={loading}
    >
      {nutrition ? (
        <Card style={{ marginBottom: spacing.base }}>
          <Text
            style={{
              ...typography.statLarge,
              color: colors.brandPrimary,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            {formatCalories(nutrition.targetCalories)}
          </Text>
          <Text
            style={{
              ...typography.caption,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: spacing.base,
            }}
          >
            Daily calorie target
          </Text>
          <SummaryRow label="BMR" value={formatCalories(nutrition.bmr)} />
          <SummaryRow label="TDEE" value={formatCalories(nutrition.tdee)} />
          <SummaryRow label="Protein" value={formatMacro(nutrition.proteinGrams)} />
          <SummaryRow label="Carbs" value={formatMacro(nutrition.carbsGrams)} />
          <SummaryRow label="Fat" value={formatMacro(nutrition.fatGrams)} />
        </Card>
      ) : null}

      {error ? (
        <Text style={{ ...typography.caption, color: colors.error, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
    </OnboardingLayout>
  );
}
