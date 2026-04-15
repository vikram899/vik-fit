import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import OnboardingSlide from '../components/OnboardingSlide';
import { WheelPicker, WheelColumn } from '../components/WheelPicker';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Height'>;

const CM_LIST   = Array.from({ length: 151 }, (_, i) => String(100 + i));
const FT_LIST   = ['3', '4', '5', '6', '7', '8'];
const IN_LIST   = Array.from({ length: 12 }, (_, i) => String(i));
const UNIT_LIST = ['cms', 'ft/in'];

export default function HeightScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();
  const isMetric = draft.unitPreference !== 'imperial';

  const [cmIdx, setCmIdx]     = useState(78);   // 178 cm
  const [ftIdx, setFtIdx]     = useState(2);    // 5 ft
  const [inIdx, setInIdx]     = useState(10);   // 10 in
  const [unitIdx, setUnitIdx] = useState(isMetric ? 0 : 1);

  const currentUnit = unitIdx === 0 ? 'metric' : 'imperial';

  useEffect(() => {
    const newUnit = unitIdx === 0 ? 'metric' : 'imperial';
    updateDraft({ unitPreference: newUnit });
  }, [unitIdx]);

  useEffect(() => {
    let cm: number;
    if (currentUnit === 'metric') {
      cm = 100 + cmIdx;
    } else {
      const ft = parseInt(FT_LIST[ftIdx]);
      const inches = inIdx;
      cm = Math.round((ft * 12 + inches) * 2.54);
    }
    updateDraft({ heightCm: cm });
  }, [cmIdx, ftIdx, inIdx, currentUnit]);

  return (
    <OnboardingSlide
      step={3} totalSteps={7}
      title="How tall are you?"
      hint="Please enter your correct height to get the most appropriate plan."
      onNext={() => navigation.navigate('Weight')}
      onBack={() => navigation.goBack()}
    >
      <View style={{ alignItems: 'center' }}>
        {currentUnit === 'metric' ? (
          <WheelPicker visibleItems={5}>
            <WheelColumn items={CM_LIST}   selectedIndex={cmIdx}   onSelect={setCmIdx}   width={120} visibleItems={5} />
            <WheelColumn items={UNIT_LIST} selectedIndex={unitIdx} onSelect={setUnitIdx} width={80}  visibleItems={5} />
          </WheelPicker>
        ) : (
          <WheelPicker visibleItems={5}>
            <WheelColumn items={FT_LIST}   selectedIndex={ftIdx}   onSelect={setFtIdx}   width={70}  visibleItems={5} />
            <WheelColumn items={IN_LIST}   selectedIndex={inIdx}   onSelect={setInIdx}   width={70}  visibleItems={5} />
            <WheelColumn items={UNIT_LIST} selectedIndex={unitIdx} onSelect={setUnitIdx} width={80}  visibleItems={5} />
          </WheelPicker>
        )}
      </View>
    </OnboardingSlide>
  );
}
