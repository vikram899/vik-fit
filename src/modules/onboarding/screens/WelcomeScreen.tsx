import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Button } from '@shared/components/ui/Button';
import { Layout, Spacing } from '@theme/spacing';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: Layout.screenPaddingHorizontal,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            ...typography.statMedium,
            color: colors.brandPrimary,
            marginBottom: spacing.sm,
          }}
        >
          VikFit
        </Text>
        <Text
          style={{
            ...typography.screenTitle,
            color: colors.textPrimary,
            marginBottom: spacing.base,
          }}
        >
          Your fitness,{'\n'}your rules.
        </Text>
        <Text
          style={{
            ...typography.body,
            color: colors.textSecondary,
            marginBottom: spacing['3xl'],
          }}
        >
          Track meals, plan workouts, and hit your goals — all offline, all private.
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: Layout.screenPaddingHorizontal,
          paddingBottom: spacing['2xl'],
        }}
      >
        <Button label="Get Started" onPress={() => navigation.navigate('BasicInfo')} />
      </View>
    </SafeAreaView>
  );
}
