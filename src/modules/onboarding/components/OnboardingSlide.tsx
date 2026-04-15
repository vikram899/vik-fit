import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';

interface Props {
  step: number;
  totalSteps: number;
  title: string;
  hint?: string;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  children: React.ReactNode;
}

export default function OnboardingSlide({
  step, totalSteps, title, hint, onNext, onBack,
  nextLabel = 'Next', nextDisabled = false, nextLoading = false,
  children,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F10' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Progress bar + back arrow */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, gap: 10 }}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} activeOpacity={1} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronLeft size={26} color="#F5F5F7" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 26 }} />
          )}
          <View style={{ flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ width: `${(step / totalSteps) * 100}%`, height: '100%', backgroundColor: '#84CC16', borderRadius: 2 }} />
          </View>
        </View>

        {/* Title */}
        <Text style={{
          fontSize: 32, fontWeight: '800', color: '#F5F5F7',
          paddingHorizontal: 24, lineHeight: 40, marginBottom: 28,
          letterSpacing: -0.5,
        }}>
          {title}
        </Text>

        {/* Content */}
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {children}
        </View>
      </SafeAreaView>

      {/* Bottom: hint + button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16, backgroundColor: '#0F0F10' }}>
        {hint ? (
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 14, lineHeight: 19 }}>
            {hint}
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={onNext}
          disabled={nextDisabled || nextLoading}
          activeOpacity={1}
          style={{ borderRadius: 16, overflow: 'hidden', opacity: nextDisabled ? 0.4 : 1 }}
        >
          <LinearGradient
            colors={['#84CC16', '#65A30D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {nextLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#000', letterSpacing: 0.3 }}>
                {nextLabel}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
