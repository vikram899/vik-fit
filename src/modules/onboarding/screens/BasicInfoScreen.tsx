import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BasicInfo'>;

// ─── Wheel picker constants ───────────────────────────────────────────────────
const ITEM_H = 52;
const WHEEL_BG = '#161618';

// ─── WheelColumn ─────────────────────────────────────────────────────────────
interface WheelProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  width?: number;
  visibleItems?: number;
}

function WheelColumn({ items, selectedIndex, onSelect, width = 80, visibleItems = 5 }: WheelProps) {
  const wheelH = ITEM_H * visibleItems;
  const half = (wheelH - ITEM_H) / 2;
  const ref = useRef<ScrollView>(null);
  const didScroll = useRef(false);

  const scrollTo = useCallback((idx: number, animated = true) => {
    ref.current?.scrollTo({ x: 0, y: idx * ITEM_H, animated });
  }, []);

  const handleLayout = useCallback(() => {
    if (!didScroll.current) {
      didScroll.current = true;
      scrollTo(selectedIndex, false);
    }
  }, [selectedIndex, scrollTo]);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      onSelect(clamped);
      scrollTo(clamped);
    },
    [items.length, onSelect, scrollTo],
  );

  return (
    <View style={{ width, height: wheelH, overflow: 'hidden' }}>
      {/* Card-style selection highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 6, right: 6,
          top: half,
          height: ITEM_H,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.1)',
          zIndex: 2,
        }}
      />
      <ScrollView
        ref={ref}
        onLayout={handleLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: half, paddingBottom: half }}
      >
        {items.map((label, i) => {
          const dist = Math.abs(i - selectedIndex);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => { onSelect(i); scrollTo(i); }}
              activeOpacity={0.7}
              style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{
                fontSize: dist === 0 ? 22 : dist === 1 ? 18 : 15,
                fontWeight: dist === 0 ? '700' : '400',
                color: dist === 0 ? '#fff' : 'rgba(255,255,255,0.35)',
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <LinearGradient
        colors={[WHEEL_BG, 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: half, zIndex: 1 }}
      />
      <LinearGradient
        colors={['transparent', WHEEL_BG]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: half, zIndex: 1 }}
      />
    </View>
  );
}

function PickerBox({ children, headers }: { children: React.ReactNode; headers?: string[] | undefined }) {
  return (
    <View style={{
      backgroundColor: WHEEL_BG,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      overflow: 'hidden',
      paddingVertical: 12,
      paddingHorizontal: 8,
    }}>
      {headers && headers.length > 0 && (
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {headers.map((h, i) => (
            <Text key={i} style={{
              flex: 1, textAlign: 'center',
              fontSize: 11, fontWeight: '600',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}>
              {h}
            </Text>
          ))}
        </View>
      )}
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

// ─── Date data ────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const NOW_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 91 }, (_, i) => String(NOW_YEAR - 10 - i));

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function BasicInfoScreen({ navigation }: Props) {
  const { spacing } = useTheme();
  const { draft, updateDraft } = useOnboarding();
  const [pageScrollEnabled, setPageScrollEnabled] = useState(true);

  // DOB
  const [monthIdx, setMonthIdx] = useState(0);
  const [dayIdx, setDayIdx] = useState(0);
  const [yearIdx, setYearIdx] = useState(20);

  // Height — units embedded in item text
  const heightCmList = Array.from({ length: 151 }, (_, i) => `${100 + i} cm`);
  const ftList = ['3 ft','4 ft','5 ft','6 ft','7 ft','8 ft'];
  const inList = Array.from({ length: 12 }, (_, i) => `${i} in`);
  const [heightCmIdx, setHeightCmIdx] = useState(70);   // 170 cm
  const [ftIdx, setFtIdx] = useState(2);                 // 5 ft
  const [inIdx, setInIdx] = useState(7);                 // 7 in

  // Weight — units embedded in item text
  const kgList = Array.from({ length: 171 }, (_, i) => `${30 + i} kg`);
  const lbList = Array.from({ length: 375 }, (_, i) => `${66 + i} lbs`);
  const [kgIdx, setKgIdx] = useState(40);  // 70 kg
  const [lbIdx, setLbIdx] = useState(88);  // ~154 lbs

  const isMetric = draft.unitPreference === 'metric';

  useEffect(() => {
    const month = monthIdx + 1;
    const day = dayIdx + 1;
    const year = parseInt(YEARS[yearIdx]);
    const dob = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    updateDraft({ dateOfBirth: dob });
  }, [monthIdx, dayIdx, yearIdx]);

  useEffect(() => {
    let cm: number;
    if (isMetric) {
      cm = 100 + heightCmIdx;
    } else {
      const ft = 3 + ftIdx;
      const inch = inIdx;
      cm = Math.round((ft * 12 + inch) * 2.54);
    }
    updateDraft({ heightCm: cm });
  }, [heightCmIdx, ftIdx, inIdx, isMetric]);

  useEffect(() => {
    const kg = isMetric
      ? 30 + kgIdx
      : Math.round(((66 + lbIdx) / 2.20462) * 10) / 10;
    updateDraft({ weightKg: kg });
  }, [kgIdx, lbIdx, isMetric]);

  const handleUnitChange = (unit: 'metric' | 'imperial') => {
    updateDraft({ unitPreference: unit });
  };

  const isValid = draft.name.trim() !== '' && draft.dateOfBirth !== '' && draft.gender !== '';

  const sub = 'rgba(255,255,255,0.04)';
  const subBorder = 'rgba(255,255,255,0.08)';

  return (
    <OnboardingLayout
      step={1}
      totalSteps={3}
      title="Tell us about yourself"
      subtitle="Help us personalize your fitness journey"
      onNext={() => navigation.navigate('ActivityGoal')}
      nextDisabled={!isValid}
      nextLabel="Next"
      scrollEnabled={pageScrollEnabled}
    >
      {/* Name */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Name</Text>
        <TextInput
          value={draft.name}
          onChangeText={(v) => updateDraft({ name: v })}
          placeholder="Enter your name"
          placeholderTextColor="rgba(255,255,255,0.25)"
          autoCapitalize="words"
          style={{
            backgroundColor: sub,
            borderWidth: 1,
            borderColor: subBorder,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 16,
            color: '#fff',
            fontSize: 17,
          }}
        />
      </View>

      {/* Date of Birth */}
      <View
        style={{ marginBottom: spacing.lg }}
        onTouchStart={() => setPageScrollEnabled(false)}
        onTouchEnd={() => setPageScrollEnabled(true)}
        onTouchCancel={() => setPageScrollEnabled(true)}
      >
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          Date of Birth
        </Text>
        <PickerBox>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <WheelColumn items={DAYS}   selectedIndex={dayIdx}   onSelect={setDayIdx}   width={80}  visibleItems={3} />
            <WheelColumn items={MONTHS} selectedIndex={monthIdx} onSelect={setMonthIdx} width={110} visibleItems={3} />
            <WheelColumn items={YEARS}  selectedIndex={yearIdx}  onSelect={setYearIdx}  width={110} visibleItems={3} />
          </View>
        </PickerBox>
      </View>

      {/* Gender */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Gender</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['male', 'female', 'other'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => updateDraft({ gender: g })}
              activeOpacity={1}
              style={{
                flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                backgroundColor: draft.gender === g ? '#3B82F6' : sub,
                borderWidth: 1,
                borderColor: draft.gender === g ? '#3B82F6' : subBorder,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Units */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Units</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([
            { value: 'metric' as const, label: 'Metric (kg/cm)' },
            { value: 'imperial' as const, label: 'Imperial (lbs/ft)' },
          ]).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleUnitChange(opt.value)}
              activeOpacity={1}
              style={{
                flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
                backgroundColor: draft.unitPreference === opt.value ? '#84CC16' : sub,
                borderWidth: 1,
                borderColor: draft.unitPreference === opt.value ? '#84CC16' : subBorder,
              }}
            >
              <Text style={{
                color: draft.unitPreference === opt.value ? '#000' : 'rgba(255,255,255,0.6)',
                fontWeight: '600', fontSize: 13,
              }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Height + Weight side by side */}
      <View
        style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.base }}
        onTouchStart={() => setPageScrollEnabled(false)}
        onTouchEnd={() => setPageScrollEnabled(true)}
        onTouchCancel={() => setPageScrollEnabled(true)}
      >
        {/* Height */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            Height
          </Text>
          <PickerBox headers={isMetric ? undefined : ['ft', 'in']}>
            {isMetric ? (
              <WheelColumn items={heightCmList} selectedIndex={heightCmIdx} onSelect={setHeightCmIdx} width={120} visibleItems={3} />
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <WheelColumn items={ftList} selectedIndex={ftIdx} onSelect={setFtIdx} width={80} visibleItems={3} />
                <WheelColumn items={inList} selectedIndex={inIdx} onSelect={setInIdx} width={80} visibleItems={3} />
              </View>
            )}
          </PickerBox>
        </View>

        {/* Weight */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            Weight
          </Text>
          <PickerBox>
            {isMetric ? (
              <WheelColumn items={kgList} selectedIndex={kgIdx} onSelect={setKgIdx} width={120} visibleItems={3} />
            ) : (
              <WheelColumn items={lbList} selectedIndex={lbIdx} onSelect={setLbIdx} width={120} visibleItems={3} />
            )}
          </PickerBox>
        </View>
      </View>
    </OnboardingLayout>
  );
}
