import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import OnboardingSlide from '../components/OnboardingSlide';
import { WheelPicker, WheelColumn } from '../components/WheelPicker';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Weight'>;

const KG_LIST   = Array.from({ length: 171 }, (_, i) => String(30 + i));
const LBS_LIST  = Array.from({ length: 375 }, (_, i) => String(66 + i));
const DEC_LIST  = Array.from({ length: 10 }, (_, i) => String(i));
const UNIT_LIST = ['kg', 'lbs'];

export default function WeightScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();
  const isMetric = draft.unitPreference !== 'imperial';

  const [kgIdx,   setKgIdx]   = useState(49);  // 79 kg
  const [lbsIdx,  setLbsIdx]  = useState(108); // 174 lbs
  const [decIdx,  setDecIdx]  = useState(0);
  const [unitIdx, setUnitIdx] = useState(isMetric ? 0 : 1);

  const currentUnit = unitIdx === 0 ? 'metric' : 'imperial';

  useEffect(() => {
    const newUnit = unitIdx === 0 ? 'metric' : 'imperial';
    updateDraft({ unitPreference: newUnit });
  }, [unitIdx]);

  useEffect(() => {
    let kg: number;
    if (currentUnit === 'metric') {
      kg = (30 + kgIdx) + decIdx * 0.1;
    } else {
      kg = Math.round(((66 + lbsIdx) / 2.20462) * 10) / 10;
    }
    updateDraft({ weightKg: Math.round(kg * 10) / 10 });
  }, [kgIdx, lbsIdx, decIdx, currentUnit]);

  return (
    <OnboardingSlide
      step={4} totalSteps={7}
      title={"What's your\ncurrent weight?"}
      onNext={() => navigation.navigate('Goal')}
      onBack={() => navigation.goBack()}
    >
      <View style={{ alignItems: 'center' }}>
        {currentUnit === 'metric' ? (
          <WheelPicker visibleItems={5}>
            <WheelColumn items={KG_LIST}   selectedIndex={kgIdx}   onSelect={setKgIdx}   width={90}  visibleItems={5} />
            <WheelColumn items={DEC_LIST}  selectedIndex={decIdx}  onSelect={setDecIdx}  width={50}  visibleItems={5} />
            <WheelColumn items={UNIT_LIST} selectedIndex={unitIdx} onSelect={setUnitIdx} width={70}  visibleItems={5} />
          </WheelPicker>
        ) : (
          <WheelPicker visibleItems={5}>
            <WheelColumn items={LBS_LIST}  selectedIndex={lbsIdx}  onSelect={setLbsIdx}  width={100} visibleItems={5} />
            <WheelColumn items={UNIT_LIST} selectedIndex={unitIdx} onSelect={setUnitIdx} width={70}  visibleItems={5} />
          </WheelPicker>
        )}
      </View>
    </OnboardingSlide>
  );
}
