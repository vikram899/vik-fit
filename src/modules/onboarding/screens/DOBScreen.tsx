import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import OnboardingSlide from '../components/OnboardingSlide';
import { WheelPicker, WheelColumn } from '../components/WheelPicker';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DOB'>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const NOW_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => String(NOW_YEAR - 10 - i));

export default function DOBScreen({ navigation }: Props) {
  const { updateDraft } = useOnboarding();
  const [dayIdx, setDayIdx] = useState(1);
  const [monthIdx, setMonthIdx] = useState(0);
  const [yearIdx, setYearIdx] = useState(18); // default ~25-28 years old

  useEffect(() => {
    const day = dayIdx + 1;
    const month = monthIdx + 1;
    const year = parseInt(YEARS[yearIdx]);
    updateDraft({ dateOfBirth: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` });
  }, [dayIdx, monthIdx, yearIdx]);

  return (
    <OnboardingSlide
      step={2} totalSteps={7}
      title="When were you born?"
      hint="Your age plays an important role in determining your metabolism."
      onNext={() => navigation.navigate('Height')}
      onBack={() => navigation.goBack()}
    >
      <View style={{ alignItems: 'center' }}>
        <WheelPicker visibleItems={5}>
          <WheelColumn items={DAYS}   selectedIndex={dayIdx}   onSelect={setDayIdx}   width={70}  visibleItems={5} />
          <WheelColumn items={MONTHS} selectedIndex={monthIdx} onSelect={setMonthIdx} width={90}  visibleItems={5} />
          <WheelColumn items={YEARS}  selectedIndex={yearIdx}  onSelect={setYearIdx}  width={100} visibleItems={5} />
        </WheelPicker>
      </View>
    </OnboardingSlide>
  );
}
