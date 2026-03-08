import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { Button } from '@shared/components/ui/Button';
import { Spacing, Layout } from '@theme/spacing';
import StepIndicator from './StepIndicator';

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
}

export default function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  nextDisabled = false,
  nextLoading = false,
}: OnboardingLayoutProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: Layout.screenPaddingHorizontal }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step indicator */}
          <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.xl }}>
            <StepIndicator totalSteps={totalSteps} currentStep={step} />
          </View>

          {/* Title */}
          <Text style={{ ...typography.screenTitle, color: colors.textPrimary, marginBottom: spacing.sm }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl }}>
              {subtitle}
            </Text>
          ) : null}

          {/* Content */}
          <View style={{ flex: 1, paddingBottom: spacing['2xl'] }}>{children}</View>
        </ScrollView>

        {/* Footer buttons */}
        <View
          style={{
            paddingHorizontal: Layout.screenPaddingHorizontal,
            paddingBottom: spacing['2xl'],
            gap: spacing.sm,
          }}
        >
          <Button
            label={nextLabel}
            onPress={onNext}
            disabled={nextDisabled}
            loading={nextLoading}
          />
          {onBack ? (
            <Button label="Back" onPress={onBack} variant="secondary" />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
