import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { Button } from '@shared/components/ui/Button';
import { Layout } from '@theme/spacing';
import { LinearGradient } from 'expo-linear-gradient';

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
  scrollEnabled?: boolean;
}

export default function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Next',
  nextDisabled = false,
  nextLoading = false,
  scrollEnabled = true,
}: OnboardingLayoutProps) {
  const { colors, typography, spacing } = useTheme();
  const pct = Math.round((step / totalSteps) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress bar area */}
        <View style={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Step {step} of {totalSteps}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#84CC16' }}>{pct}%</Text>
          </View>
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <LinearGradient
              colors={['#3B82F6', '#84CC16']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${pct}%` as any, height: '100%', borderRadius: 4 }}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: Layout.screenPaddingHorizontal }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.sm }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ ...typography.body, color: 'rgba(255,255,255,0.5)', marginBottom: spacing.xl }}>
              {subtitle}
            </Text>
          ) : null}

          <View style={{ flex: 1, paddingBottom: spacing['2xl'] }}>{children}</View>
        </ScrollView>

        {/* Footer */}
        <View style={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: spacing['2xl'], gap: spacing.sm }}>
          {onBack ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Back" onPress={onBack} variant="secondary" style={{ flex: 1 }} />
              <Button
                label={nextLabel}
                onPress={onNext}
                disabled={nextDisabled}
                loading={nextLoading}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <Button
              label={nextLabel}
              onPress={onNext}
              disabled={nextDisabled}
              loading={nextLoading}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
