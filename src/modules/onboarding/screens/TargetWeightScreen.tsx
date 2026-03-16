import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, TrendingDown, TrendingUp, Minus } from 'lucide-react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TargetWeight'>;

// ─── Wheel ────────────────────────────────────────────────────────────────────

const ITEM_H = 56;
const WHEEL_BG = '#161618';

function WheelColumn({
  items, selectedIndex, onSelect, width = 160, visibleItems = 5,
}: {
  items: string[]; selectedIndex: number; onSelect: (i: number) => void;
  width?: number; visibleItems?: number;
}) {
  const wheelH = ITEM_H * visibleItems;
  const half = (wheelH - ITEM_H) / 2;
  const ref = useRef<ScrollView>(null);
  const didScroll = useRef(false);

  const scrollTo = useCallback((idx: number, animated = true) => {
    ref.current?.scrollTo({ x: 0, y: idx * ITEM_H, animated });
  }, []);

  const handleLayout = useCallback(() => {
    if (!didScroll.current) { didScroll.current = true; scrollTo(selectedIndex, false); }
  }, [selectedIndex, scrollTo]);

  const handleMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    onSelect(clamped);
    scrollTo(clamped);
  }, [items.length, onSelect, scrollTo]);

  return (
    <View style={{ width, height: wheelH, overflow: 'hidden' }}>
      {/* Selection highlight */}
      <View pointerEvents="none" style={{
        position: 'absolute', left: 8, right: 8, top: half,
        height: ITEM_H, borderRadius: 14,
        backgroundColor: 'rgba(132,204,22,0.12)',
        borderWidth: 1, borderColor: 'rgba(132,204,22,0.25)',
        zIndex: 2,
      }} />
      <ScrollView
        ref={ref} onLayout={handleLayout} showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H} decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd} scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: half, paddingBottom: half }}
      >
        {items.map((label, i) => {
          const dist = Math.abs(i - selectedIndex);
          return (
            <TouchableOpacity
              key={i} onPress={() => { onSelect(i); scrollTo(i); }}
              activeOpacity={0.7}
              style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{
                fontSize: dist === 0 ? 28 : dist === 1 ? 20 : 16,
                fontWeight: dist === 0 ? '800' : dist === 1 ? '500' : '400',
                color: dist === 0 ? '#84CC16' : dist === 1 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <LinearGradient
        colors={[WHEEL_BG, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: half, zIndex: 1 }}
      />
      <LinearGradient
        colors={['transparent', WHEEL_BG]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: half, zIndex: 1 }}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TargetWeightScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();

  const isMetric = draft.unitPreference === 'metric';
  const unit = isMetric ? 'kg' : 'lbs';

  const kgList = Array.from({ length: 171 }, (_, i) => `${30 + i}`);
  const lbList = Array.from({ length: 375 }, (_, i) => `${66 + i}`);

  const [kgIdx, setKgIdx] = useState(() => {
    if (draft.targetWeightKg != null) return Math.max(0, Math.min(170, draft.targetWeightKg - 30));
    // Default to slightly below current weight for lose goal, above for gain
    const defaultKg = draft.goal === 'lose-fat' ? Math.max(0, draft.weightKg - 5) : draft.weightKg + 5;
    return Math.max(0, Math.min(170, Math.round(defaultKg) - 30));
  });

  const [lbIdx, setLbIdx] = useState(() => {
    if (draft.targetWeightKg != null) {
      const targetLbs = Math.round(draft.targetWeightKg * 2.20462);
      return Math.max(0, Math.min(374, targetLbs - 66));
    }
    const currentLbs = Math.round(draft.weightKg * 2.20462);
    const defaultLbs = draft.goal === 'lose-fat' ? currentLbs - 10 : currentLbs + 10;
    return Math.max(0, Math.min(374, defaultLbs - 66));
  });

  const [skip, setSkip] = useState(draft.targetWeightKg === null && draft.goal === 'maintain');
  const [wheelScrollEnabled, setWheelScrollEnabled] = useState(true);

  const currentTargetKg = isMetric ? 30 + kgIdx : Math.round(((66 + lbIdx) / 2.20462) * 10) / 10;

  const handleKgSelect = (i: number) => {
    setKgIdx(i);
    updateDraft({ targetWeightKg: 30 + i });
  };
  const handleLbSelect = (i: number) => {
    setLbIdx(i);
    updateDraft({ targetWeightKg: Math.round(((66 + i) / 2.20462) * 10) / 10 });
  };

  // Diff vs current weight
  const currentWeightKg = draft.weightKg;
  const diff = currentTargetKg - currentWeightKg;
  const absDiff = Math.abs(diff);
  const diffDisplay = isMetric
    ? `${absDiff.toFixed(1)} kg`
    : `${Math.abs(Math.round(diff * 2.20462))} lbs`;

  const DiffIcon = diff < -0.5 ? TrendingDown : diff > 0.5 ? TrendingUp : Minus;
  const diffColor = diff < -0.5 ? '#84CC16' : diff > 0.5 ? '#3B82F6' : 'rgba(255,255,255,0.4)';
  const diffLabel = diff < -0.5 ? `${diffDisplay} to lose` : diff > 0.5 ? `${diffDisplay} to gain` : 'At goal weight';

  // Ensure targetWeightKg is set when arriving on this screen (if not skipped)
  React.useEffect(() => {
    if (!skip && draft.targetWeightKg === null) {
      updateDraft({ targetWeightKg: currentTargetKg });
    }
  }, []);

  return (
    <OnboardingLayout
      step={3}
      totalSteps={4}
      title="Set your target weight"
      subtitle="Give us a goal to track your progress toward"
      onNext={() => navigation.navigate('Summary')}
      onBack={() => navigation.goBack()}
      nextLabel="Next"
      scrollEnabled={wheelScrollEnabled}
    >
      {/* Skip toggle */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Target size={16} color={skip ? 'rgba(255,255,255,0.3)' : '#84CC16'} />
          <Text style={{ fontSize: 14, color: skip ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
            {skip ? 'Skipped — set later from dashboard' : 'Scroll to pick your goal'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            const next = !skip;
            setSkip(next);
            updateDraft({ targetWeightKg: next ? null : currentTargetKg });
          }}
          activeOpacity={1}
          style={{
            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
            backgroundColor: skip ? 'rgba(255,255,255,0.06)' : 'rgba(132,204,22,0.15)',
            borderWidth: 1,
            borderColor: skip ? 'rgba(255,255,255,0.1)' : 'rgba(132,204,22,0.4)',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: skip ? 'rgba(255,255,255,0.4)' : '#84CC16' }}>
            {skip ? 'Set target' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {!skip && (
        <>
          {/* Wheel */}
          <View
            onTouchStart={() => setWheelScrollEnabled(false)}
            onTouchEnd={() => setWheelScrollEnabled(true)}
            onTouchCancel={() => setWheelScrollEnabled(true)}
            style={{
              backgroundColor: WHEEL_BG, borderRadius: 24,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              overflow: 'hidden', alignItems: 'center',
              paddingVertical: 8, marginBottom: 24,
            }}
          >
            {/* Unit label above */}
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              {unit}
            </Text>
            {isMetric ? (
              <WheelColumn items={kgList} selectedIndex={kgIdx} onSelect={handleKgSelect} />
            ) : (
              <WheelColumn items={lbList} selectedIndex={lbIdx} onSelect={handleLbSelect} />
            )}
          </View>

          {/* Diff card */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            padding: 16, marginBottom: 20,
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: diffColor + '22',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <DiffIcon size={20} color={diffColor} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{diffLabel}</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                Current: {isMetric ? `${draft.weightKg} kg` : `${Math.round(draft.weightKg * 2.20462)} lbs`}
              </Text>
            </View>
          </View>

          {/* Current / Target row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              padding: 14, alignItems: 'center',
            }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Current</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>
                {isMetric ? `${draft.weightKg}` : `${Math.round(draft.weightKg * 2.20462)}`}
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}> {unit}</Text>
              </Text>
            </View>
            <View style={{
              flex: 1, borderRadius: 14, overflow: 'hidden',
            }}>
              <LinearGradient
                colors={['rgba(132,204,22,0.2)', 'rgba(132,204,22,0.08)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{
                  flex: 1, padding: 14, alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)', borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Target</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#84CC16' }}>
                  {isMetric ? `${30 + kgIdx}` : `${66 + lbIdx}`}
                  <Text style={{ fontSize: 13, color: 'rgba(132,204,22,0.7)' }}> {unit}</Text>
                </Text>
              </LinearGradient>
            </View>
          </View>
        </>
      )}
    </OnboardingLayout>
  );
}
